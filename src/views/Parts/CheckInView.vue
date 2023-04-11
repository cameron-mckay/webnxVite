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
  PartCache,
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
  getUserInventoryByID(http, currentUser.value._id!, (data, err) => {
    if (err) return errorHandler(err);
    let res = data as any;
    let partsArr = res.parts as PartCache;
    let parts = new Map<string, PartSchema>();
    partsArr.map((obj) => {
      parts.set(obj.nxid, obj.part);
    });
    let records = res.records as CartItem[];
    inventory.value = records.map((item) => {
      if (item.serial) {
        return {
          part: parts.get(item.nxid),
          serial: item.serial,
        } as LoadedCartItem;
      }
      return {
        part: parts.get(item.nxid),
        quantity: item.quantity,
      } as LoadedCartItem;
    });
    checkInList.value = [] as LoadedCartItem[];
  });
}

function localCheckin() {
  let unloadedParts = [] as CartItem[];
  for (let item of checkInList.value) {
    unloadedParts.push({ nxid: item.part.nxid!, quantity: item.quantity });
  }
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

function moveToInventory(part: PartSchema, quantity: number) {
  move(checkInList, inventory, part, quantity);
}

function moveToCheckin(part: PartSchema, quantity: number) {
  move(inventory, checkInList, part, quantity);
}

function move(
  array1: Ref<LoadedCartItem[]>,
  array2: Ref<LoadedCartItem[]>,
  part: PartSchema,
  quantity: number
) {
  let item1 = array1.value.find((e) => e.part.nxid == part.nxid);
  if (!item1) {
    return;
  }
  item1.quantity! -= quantity;
  if (item1.quantity! < 1) array1.value.splice(array1.value.indexOf(item1), 1);
  let item2 = array2.value.find((e) => e.part.nxid == part.nxid);
  if (!item2) array2.value.push({ part, quantity });
  else item2.quantity! += quantity;
}

watch(currentUser, () => {
  loadInventory();
});
</script>

<template>
  <form @submit.prevent="localCheckin">
    <div>
      <div class="flex flex-wrap justify-between">
        <h1 class="mb-4 inline-block w-full text-4xl md:w-fit">Check In:</h1>
        <div class="flex">
          <p class="mr-2 mt-auto">User:</p>
          <select required v-model="currentUser" class="mt-auto">
            <option disabled :value="{}"></option>
            <option v-for="user in users" :value="user">
              {{ `${user.first_name} ${user.last_name}` }}
            </option>
          </select>
        </div>
      </div>
      <div v-if="inventory.length > 0">
        <div
          class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
        >
          <p class="hidden md:block">NXID</p>
          <p>Manufacturer</p>
          <p>Name</p>
          <p class="hidden md:block">Location</p>
          <p>Quantity</p>
          <p></p>
        </div>
        <InventoryPartComponent
          :isCurrentUser="false"
          v-for="item in inventory"
          :part="item.part"
          :quantity="item.quantity"
          @movePart="moveToCheckin"
        />
      </div>
      <div v-else-if="JSON.stringify(currentUser) == JSON.stringify({})">
        <p>Please select a user to get started...</p>
      </div>
      <div v-else>
        <p>Inventory is empty...</p>
      </div>
      <div v-if="checkInList.length > 0">
        <h1 class="mb-4 text-4xl">Checking In:</h1>
        <div
          class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
        >
          <p class="hidden md:block">NXID</p>
          <p>Manufacturer</p>
          <p>Name</p>
          <p class="hidden md:block">Location</p>
          <p>Quantity</p>
          <p></p>
        </div>
        <InventoryPartComponent
          :isCurrentUser="true"
          v-for="item in checkInList"
          :part="item.part"
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
