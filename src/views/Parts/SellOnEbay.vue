<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import InventoryPartComponent from '../../components/InventoryComponents/InventoryPartComponent.vue';
import { sellOnEbay } from '../../plugins/dbCommands/partManager';
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

interface EbayPart extends LoadedCartItem {
  hadSerial: boolean
}

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
let orderID = ref('');
let currentUser = ref({} as User);
let maxQuantities = new Map<string, number>()
let users = ref([] as User[]);
let processingMove = false;
let loading = ref(false);

async function loadInventory() {
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
    // Get all users
    getAllUsers(http, (data, err) => {
      if (err) {
        return errorHandler(err);
      }
      // Push to reactive var
      users.value = data as User[];
      // Find and remove current user or kiosks
      users.value = users.value.filter(
        (u) => !(u._id == store.state.user._id || u.roles?.includes('kiosk'))
      );
    });
  }
}

function moveFromInventory(part: PartSchema, difference: number, serial: string) {
  if(difference<0)
    moveEbay(part, difference*-1, serial);
  if(difference>0)
    moveBack(transferList, items, part, difference, serial);
}

function moveEbay(part: PartSchema, quantity: number, serial: string) {
  let array1 = items;
  let array2 = transferList;

  // Create var for item to move
  let item1 = {} as LoadedCartItem | undefined;
  // If item is serialized
  if (serial != undefined) {
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
    for (let i = 0; i < quantity; i++) {
      array2.value.push({ part, serial: '' });
    }
  }
}

function moveFromTransferList(
  part: PartSchema,
  difference: number,
  serial: string
) {
  if(difference<0)
    moveBack(transferList, items, part, difference*-1, serial);
  if(difference>0)
    moveEbay(part, difference, serial);
}

function moveBack(
  array1: Ref<LoadedCartItem[]>,
  array2: Ref<LoadedCartItem[]>,
  part: PartSchema,
  quantity: number,
  serial: string
) {
  // Create var for item to move
  let item1 = {} as LoadedCartItem | undefined;
  // If item is serialized
  if (serial != undefined) {
    // Find existing item
    item1 = array1.value.find((e) => e.serial == serial);
    // Return if not found
    if (!item1 && part.serialized) {
      return;
    }
    // Remove from array 1
    array1.value.splice(array1.value.indexOf(item1!), 1);
    // Push to array 2
    if (part.serialized) {
      array2.value.push({ part, serial: serial });
    } else {
      let item2 = array2.value.find((e) => e.part.nxid == part.nxid);
      // If it doesn't exist, push a new entry
      if (!item2) array2.value.push({ part, quantity: 1 });
      // Otherwise increment existing entry
      else item2.quantity! += 1;
    }
  } else {
    // Find matching part in array 1
    item1 = array1.value.find((e) => e.part.nxid == part.nxid);
    // Return if not found
    if (!item1 || !quantity) {
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
    processingMove = true;
    let transferListHash = new Map<string, InventoryEntry>()
    // Process transfer list
    transferList.value.map((item)=> {
      // Create boilerplate
      let invEntry = { newSerials: [], serials: [], unserialized: 0} as InventoryEntry
      // Check if it already exists in map
      if(transferListHash.has(item.part.nxid!))
        invEntry = transferListHash.get(item.part.nxid!)!
      // Update values
      if(item.serial&&item.part.serialized)
        // Push serial to array
        invEntry.serials.push(item.serial)
      // Increment unserialized
      else {
        invEntry.unserialized+=1
        if(item.serial&&item.serial!='') {
          invEntry.newSerials!.push(item.serial)
        }
      }
      //invEntry.unserialized+=item.quantity!
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
    sellOnEbay(http, partList, orderID.value, (data, err) => {
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
</script>
<template>
  <div>
    <form @submit.prevent="submit">
      <div>
        <div class="mb-4 flex flex-wrap justify-between">
          <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
            Your Inventory
          </h1>
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
          <div class="my-4 flex flex-wrap">
            <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
              Order:
            </h1>
            <input
              type="text"
              placeholder="eBay Order ID"
              v-model="orderID"
              class="textbox max-w-sm"
            />
          </div>
          <div
            class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
          >
            <p class="hidden md:block">NXID</p>
            <p>Manufacturer</p>
            <p>Name</p>
            <p class="hidden md:block">Location</p>
            <p>SN</p>
            <p></p>
          </div>
          <InventoryPartComponent
            :isCurrentUser="true"
            v-for="item in transferList"
            :untracked="!item.part.serialized"
            :serialOptional="true"
            :item="item"
            @movePart="moveFromTransferList"
          />
          <div class="flex justify-center">
            <input type="submit" class="submit mx-1" value="Mark As Sold" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
