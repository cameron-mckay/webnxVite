<script setup lang="ts">
import { Ref, onMounted, ref, watch } from 'vue';
import InventoryPartComponent from '../../components/InventoryComponents/InventoryPartComponent.vue';
import { movePart } from '../../plugins/dbCommands/partManager';
import {
  getAllUsers,
  getUserInventoryByID,
} from '../../plugins/dbCommands/userManager';
import {
  LoadedCartItem,
  PartRecord,
  PartSchema,
  User,
  InventoryEntry
} from '../../plugins/interfaces';

import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../../plugins/interfaces';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let items = ref([] as LoadedCartItem[]);
let transferList = ref([] as LoadedCartItem[]);
let isCurrentUser = ref(true);
let currentUser = ref({} as User);
let transferUser = ref({} as User);
let users = ref([] as User[]);
let processingMove = false;
let loading = ref(false);
let maxQuantities = new Map<string, number>()

let canBuildingTransfer = ref(store.state.user.roles?.includes('admin')||store.state.user.roles?.includes('clerk'));

function loadInventory() {
  loading.value = true;
  getUserInventoryByID(http, currentUser.value._id!, (data, err) => {
    if (err) {
      loading.value = false;
      return errorHandler(err);
    }
    items.value = data as LoadedCartItem[];
    maxQuantities = new Map<string, number>()
    for(let item of items.value) {
      if(item.quantity)
        maxQuantities.set(item.part.nxid!, item.quantity)
    }
    transferList.value = [] as LoadedCartItem[];
    loading.value = false;
  });
}

onMounted(async () => {
  // Check if store is loaded
  if (store.state.user._id == undefined) {
    // Wait .5 seconds if not loaded
    setTimeout(firstLoad, 500);
  } else {
    // Loaded - continue
    firstLoad();
  }
});

function firstLoad() {
  // Set user to current user
  currentUser.value = store.state.user;
  // Load inventory
  loadInventory();
  // If admin - get other users
  if (store.state.user.roles?.includes('admin')) {
    // Get all userse
    getAllUsers(http, (data, err) => {
      if (err) {
        return errorHandler(err);
      }
      // Push to reactive var
      users.value = data as User[];
      // Find and remove current user or kiosks
      users.value = users.value.filter(
        (u) => !(u._id == store.state.user._id || u.roles?.includes('kiosk') || u.roles?.includes('sales'))
      );
    });
  }
  canBuildingTransfer = ref(store.state.user.roles?.includes('admin')||store.state.user.roles?.includes('clerk'));
}

function moveFromInventory(part: PartSchema, difference: number, serial: string) {
  if(difference<0)
    move(items, transferList, part, difference*-1, serial);
  if(difference>0)
    move(transferList, items, part, difference, serial);
}

function moveFromTransferList(
  part: PartSchema,
  difference: number,
  serial: string
) {
  if(difference<0)
    move(transferList, items, part, difference*-1, serial);
  if(difference>0)
    move(items, transferList, part, difference, serial);
}

function move(
  array1: Ref<LoadedCartItem[]>,
  array2: Ref<LoadedCartItem[]>,
  part: PartSchema,
  quantity: number,
  serial: string | undefined
) {
  console.log("MOVE")
  // Create var for item to move
  let item1 = {} as LoadedCartItem | undefined;
  // If item is serialized
  if (serial != undefined) {
    console.log('serial')
    // Find existing item
    item1 = array1.value.find((e) => e.serial == serial);
    // Return if not found
    if (!item1) {
      return;
    }
    // Remove from array 1
    array1.value.splice(array1.value.indexOf(item1), 1);
    // Push to array 2
    array2.value.push({ part, serial: serial });
  } else {
    // Find matching part in array 1
    item1 = array1.value.find((e) => e.part.nxid == part.nxid);
    // Return if not found
    if (!item1 || !quantity) {
      console.log('err')
      return;
    }
    // subtract quantity
    item1.quantity! -= quantity;
    // Remove from array if quantity < 1
    if (item1.quantity! < 1)
      array1.value.splice(array1.value.indexOf(item1), 1);
    // Find in array 2
    let item2 = array2.value.find((e) => e.part.nxid == part.nxid);
    // If it doesn't exist, push a new entry
    if (!item2) array2.value.push({ part, quantity });
    // Otherwise increment existing entry
    else item2.quantity! += quantity;
  }
}
function submit() {
  if (!processingMove) {
    console.log(transferList.value)
    processingMove = true;
    let transferListHash = new Map<string, InventoryEntry>()
    // Process transfer list
    transferList.value.map((item)=> {
      // Create boilerplate
      let invEntry = { serials: [], unserialized: 0} as InventoryEntry
      // Check if it already exists in map
      if(transferListHash.has(item.part.nxid!))
        invEntry = transferListHash.get(item.part.nxid!)!
      // Update values
      if(item.serial)
        // Push serial to array
        invEntry.serials.push(item.serial)
      else
        // Increment unserialized
        invEntry.unserialized+=item.quantity!
      // Update hash
      transferListHash.set(item.part.nxid!, invEntry)
    })
    // Turn hash map back into array
    let partList = [] as InventoryEntry[]
    transferListHash.forEach((v, k)=>{
      v.nxid = k
      partList.push(v)
    })
    // Move parts
    movePart(http, transferUser.value._id!, currentUser.value._id!, partList, (data, err) => {
      if (err) {
        // Handle errors
        processingMove = false;
        return errorHandler(err);
      }
      displayMessage(data as string);
      transferList.value = [];
      processingMove = false;
    });
  }
}

watch(currentUser, () => {
  isCurrentUser.value =
    currentUser.value._id === store.state.user._id ? true : false;
  loadInventory();
  transferList.value = [];
  transferUser.value =
    currentUser.value._id != store.state.user._id
      ? store.state.user
      : { _id: 'all', building: store.state.user.building };
});
</script>
<template>
  <div>
    <form @submit.prevent="submit">
      <div>
        <div class="mb-4 flex flex-wrap justify-between">
          <h1
            class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit"
            v-if="currentUser._id == 'all'"
          >
            All Tech's Inventory
          </h1>
          <h1
            class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit"
            v-else-if="currentUser._id == 'testing'"
          >
            Testing Center
          </h1>
          <h1
            class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit"
            v-else-if="currentUser._id == 'hdd'"
          >
            Drive Wipe Shelf
          </h1>
          <h1
            class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit"
            v-else-if="currentUser._id == 'la'"
          >
            LA Transfers
          </h1>
          <h1
            class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit"
            v-else-if="currentUser._id == 'ny'"
          >
            NY Transfers
          </h1>
          <h1
            class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit"
            v-else-if="currentUser._id == 'og'"
          >
            Ogden Transfers
          </h1>
          <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit" v-else>
            {{ currentUser.first_name }}'s Inventory
          </h1>
          <div class="flex">
            <p class="my-auto mr-2">User:</p>
            <select required v-model="currentUser" class="mt-auto">
              <option disabled :value="{}"></option>
              <option :value="store.state.user" selected>Your Inventory</option>
              <option :value="{ _id: 'all' }">All Tech's</option>
              <option
                :value="{ _id: 'hdd' }"
              >
                Drive Wipe Shelf
              </option>
              <option
                v-if="canBuildingTransfer"
                :value="{ _id: 'la' }"
              >
               LA Transfers
              </option>
              <option
                v-if="canBuildingTransfer"
                :value="{ _id: 'ny' }"
              >
               NY Transfers
              </option>
              <option
                v-if="canBuildingTransfer"
                :value="{ _id: 'og' }"
              >
               Ogden Transfers
              </option>
              <option
                v-if="store.state.user.roles?.includes('admin')||store.state.user.roles?.includes('lead')||store.state.user.roles?.includes('testing')"
                :value="{ _id: 'testing' }"
              >
                Testing Center
              </option>
              <option v-for="user in users" :value="user">
                {{ `${user.first_name} ${user.last_name}` }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="loading" class="flex justify-center">
          <div class="loader text-center"></div>
        </div>
        <div v-else-if="items.length > 0">
          <div
            class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
          >
            <p class="hidden md:block">NXID</p>
            <p>Manufacturer</p>
            <p>Name</p>
            <p class="hidden md:block">Location</p>
            <p>Quantity/SN</p>
            <p></p>
          </div>
          <div class="md:animate-bottom">
            <InventoryPartComponent
              :isCurrentUser="false"
              v-for="item in items"
              :part="item.part"
              :quantity="item.quantity"
              :serial="item.serial"
              :item="item"
              @movePart="moveFromInventory"
            />
          </div>
        </div>
        <div v-else-if="JSON.stringify(currentUser) == JSON.stringify({})">
          <p>Please select a user to get started...</p>
        </div>
        <div v-else>
          <p>Inventory is empty...</p>
        </div>
        <div v-if="transferList.length > 0">
          <div class="my-4 flex flex-wrap justify-between">
            <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
              Transfer List
            </h1>
            <div class="flex">
              <p class="my-auto mr-2">To:</p>
              <select required v-model="transferUser" class="mt-auto">
                <option
                  v-if="currentUser._id != store.state.user._id"
                  :value="store.state.user"
                  :disabled="store.state.user._id == currentUser._id"
                  selected
                >
                  Your Inventory
                </option>
                <option
                  v-if="currentUser._id != 'all'"
                  :value="{ _id: 'all', building: store.state.user.building }"
                  :disabled="currentUser._id == 'all'"
                  selected
                >
                  All Tech's
                </option>
                <option
                  :value="{
                    _id: 'testing',
                    building: store.state.user.building,
                  }"
                  :disabled="currentUser._id == 'testing'"
                >
                  Testing Center
                </option>
                <option
                  :value="{
                    _id: 'hdd',
                    building: store.state.user.building,
                  }"
                  :disabled="currentUser._id == 'hdd'"
                >
                  Drive Wipe Shelf
                </option>
                <option
                  v-if="canBuildingTransfer"
                  :value="{ _id: 'la', building: 1 }"
                >
                 LA Transfers
                </option>
                <option
                  v-if="canBuildingTransfer"
                  :value="{ _id: 'ny', building: 4 }"
                >
                 NY Transfers
                </option>
                <option
                  v-if="canBuildingTransfer"
                  :value="{ _id: 'og', building: 3 }"
                >
                 Ogden Transfers
                </option>
                <option
                  :value="{ _id: 'lost', building: store.state.user.building }"
                  :disabled="currentUser._id == 'lost'"
                  v-if="
                    store.state.user.roles?.includes('admin')||
                    store.state.user.roles?.includes('clerk')
                  "
                >
                  Lost
                </option>
                <option
                  :value="{
                    _id: 'broken',
                    building: store.state.user.building,
                  }"
                  :disabled="currentUser._id == 'broken'"
                  v-if="
                    store.state.user.roles?.includes('admin')||
                    store.state.user.roles?.includes('clerk')
                  "
                >
                  Broken
                </option>
                <option
                  :value="{
                    _id: 'deleted',
                    building: store.state.user.building,
                  }"
                  :disabled="currentUser._id == 'deleted'"
                  v-if="
                    store.state.user.roles?.includes('admin')||
                    store.state.user.roles?.includes('clerk')
                  "
                >
                  Delete
                </option>
                <option
                  v-if="
                    store.state.user.roles?.includes('admin')||
                    store.state.user.roles?.includes('clerk')
                  "
                  v-for="user in users"
                  :disabled="user._id == currentUser._id"
                  :value="user"
                >
                  {{ `${user.first_name} ${user.last_name}` }}
                </option>
              </select>
            </div>
          </div>
          <div>
            <p
              class="my-2 w-full rounded-md bg-red-400 p-2"
              v-if="
                transferUser._id == 'testing' && !(store.state.user.roles?.includes('admin')||store.state.user.roles?.includes('lead')||store.state.user.roles?.includes('testing'))
              "
            >
              Your current role does not allow you to transfer parts from the
              testing center to your inventory.  You will not be able to return them
              to your inventory after they are transferred.
            </p>
            <p
              class="my-2 w-full rounded-md bg-red-400 p-2"
              v-if="transferUser._id == 'lost'"
            >
              This action will mark these parts as lost and make them unusable
            </p>
            <p
              class="my-2 w-full rounded-md bg-red-400 p-2"
              v-if="transferUser._id == 'broken'"
            >
              This action will mark these parts as broken and make them unusable
            </p>
            <p
              class="my-2 w-full rounded-md bg-red-400 p-2"
              v-if="transferUser._id == 'deleted'"
            >
              This action will mark these parts as deleted and make them
              unusable.
              <br />
              <span class="font-bold">
                *** This option should only be used to correct clerical errors.
                ***
              </span>
            </p>
          </div>
          <div
            class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
          >
            <p class="hidden md:block">NXID</p>
            <p>Manufacturer</p>
            <p>Name</p>
            <p class="hidden md:block">Location</p>
            <p>Quantity/SN</p>
            <p></p>
          </div>
          <InventoryPartComponent
            :isCurrentUser="true"
            v-for="item in transferList"
            :item="item"
            :part="item.part"
            :quantity="item.quantity"
            :serial="item.serial"
            :maxQuantity="maxQuantities.has(item.part.nxid!)?maxQuantities.get(item.part.nxid!):undefined"
            @movePart="moveFromTransferList"
          />
          <div class="flex justify-center">
            <input type="submit" class="submit mx-1" value="Move Parts" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
