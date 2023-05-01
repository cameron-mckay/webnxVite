<script setup lang="ts">
import { Ref, onBeforeMount, ref, watch } from 'vue';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import InventoryPartComponent from '../../components/InventoryComponents/InventoryPartComponent.vue';
import { checkin } from '../../plugins/dbCommands/partManager';
import {
getAllUsers,
getUserInventoryByID,
} from '../../plugins/dbCommands/userManager';
import type {
CartItem,
LoadedCartItem,
PartSchema,
User,
UserState,
} from '../../plugins/interfaces';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS

let users = ref([] as User[]);
let currentUser = ref({} as User);
let inventory = ref([] as LoadedCartItem[]);
let checkInList = ref([] as LoadedCartItem[]);
let loading = ref(false)

onBeforeMount(() => {
  loadUsers();
});

function loadUsers() {
  getAllUsers(http, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    users.value = data as User[];
    users.value.push({ first_name: 'All', last_name: 'Techs', _id: 'all' });
    for (let i = 0; i < users.value.length; i++) {
      if (users.value[i].role == 'kiosk') {
        users.value.splice(i, 1);
        i--;
      }
    }
  });
}

async function loadInventory() {
  loading.value = true
  getUserInventoryByID(http, currentUser.value._id!, (data, err) => {
    loading.value = false
    if (err) return errorHandler(err);
    inventory.value = data as LoadedCartItem[];
    checkInList.value = [] as LoadedCartItem[];
  });
}

function localCheckin() {
  let unloadedParts = checkInList.value.map((i) => {
    if (i.serial) return { nxid: i.part.nxid, serial: i.serial } as CartItem;
    else return { nxid: i.part.nxid, quantity: i.quantity } as CartItem;
  });
  checkin(http, unloadedParts, currentUser.value._id!, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    setTimeout(() => {
      displayMessage('Successfully checked in.');
      loadInventory();
    }, 500);
  });
}

function moveToInventory(part: PartSchema, quantity: number, serial: string) {
  move(checkInList, inventory, part, quantity, serial);
}

function moveToCheckin(part: PartSchema, quantity: number, serial: string) {
  move(inventory, checkInList, part, quantity, serial);
}

function move(
  array1: Ref<LoadedCartItem[]>,
  array2: Ref<LoadedCartItem[]>,
  part: PartSchema,
  quantity: number,
  serial: string
) {
  // Create var for item to move
  let item1 = {} as LoadedCartItem | undefined;
  // If item is serialized
  if (serial) {
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
    if (!item2) array2.value.push({ part, quantity });
    // Otherwise increment existing entry
    else item2.quantity! += quantity;
  }
}

watch(currentUser, () => {
  loadInventory();
});
</script>

<template>
  <form @submit.prevent="localCheckin">
    <div>
      <div class="mb-4 flex flex-wrap justify-between">
        <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
          Inventory:
        </h1>
        <div class="flex">
          <p class="my-auto mr-2">User:</p>
          <select required v-model="currentUser" class="mt-auto">
            <option disabled :value="{}"></option>
            <option v-for="user in users" :value="user">
              {{ `${user.first_name} ${user.last_name}` }}
            </option>
          </select>
        </div>
      </div>
      <div v-if="loading" class="flex justify-center my-4">
          <div class="loader text-center"></div>
        </div>
      <div v-else-if="inventory.length > 0">
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
          v-for="item in inventory"
          :part="item.part"
          :serial="item.serial"
          :quantity="item.quantity"
          @movePart="moveToCheckin"
          />
        </div>
      </div>
      <div v-else-if="JSON.stringify(currentUser) == JSON.stringify({})">
        <p>Please select a user to get started...</p>
      </div>
      <div v-else class="md:animate-bottom">
        <p>Inventory is empty...</p>
      </div>
      <div class="my-4" v-if="checkInList.length > 0">
        <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
          Checking In:
        </h1>
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
          v-for="item in checkInList"
          :part="item.part"
          :serial="item.serial"
          :quantity="item.quantity"
          @movePart="moveToInventory"
        />
        <div class="flex justify-center">
          <input type="submit" class="submit mx-1" value="Check In" />
        </div>
      </div>
    </div>
  </form>
</template>
