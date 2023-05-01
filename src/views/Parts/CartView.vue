<script setup lang="ts">
import CartItemComponent from '../../components/KioskComponents/CartItemComponent.vue';

import { onBeforeMount, ref, Ref } from 'vue';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import SerializedCartItemComponent from '../../components/KioskComponents/SerializedCartItemComponent.vue';
import {
checkout,
getPartByID,
getUniqueOnPartRecord,
} from '../../plugins/dbCommands/partManager';
import { getAllUsers } from '../../plugins/dbCommands/userManager';
import type {
CartItem,
LoadedCartItem,
PartSchema,
SNAvailable,
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

let parts: Ref<Array<LoadedCartItem>> = ref([]);
let cachedRecords = new Map<string, PartSchema>();
let allSerials = ref(new Map<string, SNAvailable[]>());
let users = ref([] as User[]);
let currentUser = ref({} as User);
let keys = ref([] as number[]);
let offset = 0;

onBeforeMount(() => {
  loadCart();
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

async function loadCart() {
  parts.value = [];
  for (let item of store.state.cart.unserialized.keys()) {
    if (cachedRecords.has(item)) {
      parts.value.push({
        part: cachedRecords.get(item)!,
        quantity: store.getters.getQuantity(item),
      });
    } else {
      getPartByID(
        http,
        item,
        store.state.user.building!,
        'Parts Room',
        (data, err) => {
          if (err) {
            return errorHandler(err);
          }
          let part = data as PartSchema;
          cachedRecords.set(part.nxid!, part);
          parts.value.push({
            part,
            quantity: store.getters.getQuantity(part.nxid),
          });
        }
      );
    }
  }
  keys.value = await Promise.all(
    store.state.cart.serialized.map(async (item, i, arr) => {
      if (!cachedRecords.has(item.nxid)) {
        getPartByID(
          http,
          item.nxid,
          store.state.user.building!,
          'Parts Room',
          (data, err) => {
            if (err) {
              return errorHandler(err);
            }
            let part = data as PartSchema;
            cachedRecords.set(part.nxid!, part);
            getUniqueOnPartRecord(
              http,
              'serial',
              {
                nxid: part.nxid,
                location: 'Parts Room',
                building: store.state.user.building,
                next: 'null',
              },
              (data, err) => {
                if (err) {
                  return errorHandler(err);
                }
                let serials = data as string[];
                let mappedSerials = serials.map((sn) => {
                  let avail =
                    store.state.cart.serialized.findIndex(
                      (e) => e.serial == sn
                    ) == -1;
                  return { serial: sn, available: avail } as SNAvailable;
                });
                allSerials.value.set(part.nxid!, mappedSerials);
              }
            );
          }
        );
      }
      return i;
    })
  );
  keys.value = keys.value.map((val) => (val += 1000 * offset));
  offset++;
}

async function deletePart(id: string) {
  store.commit('removeAll', id);
  loadCart();
}

function deleteSerialized(index: number) {
  console.log(index);
  let { nxid, serial } = store.state.cart.serialized[index];
  let serials = allSerials.value.get(nxid);
  if (serials) {
    let i = serials.findIndex((e) => e.serial == serial);
    if (i >= 0) serials[i].available = true;
    store.commit('removeSerialized', index);
    loadCart();
  }
}

function addSerialized(index: number) {
  store.commit('duplicateSerialized', index);
  loadCart();
}

async function addOne(id: string) {
  getPartByID(
    http,
    id,
    store.state.user.building!,
    'Parts Room',
    (data, err) => {
      let part = data as PartSchema;
      if (part.quantity! > store.getters.getQuantity(id)) {
        store.commit('addOne', part.nxid);
      } else {
        errorHandler('Not enough stock');
      }
    }
  );
}

async function subOne(id: string) {
  store.commit('removeOne', id);
  if (store.getters.getQuantity(id) == 0) {
    loadCart();
  }
}

function updateSerial(new_sn: string, old_sn: string, index: number) {
  let nxid = store.state.cart.serialized[index].nxid;
  let serials = allSerials.value.has(nxid)
    ? allSerials.value.get(nxid)!
    : ([] as SNAvailable[]);
  let oldSN = serials.findIndex((e) => e.serial == old_sn)!;
  let newSN = serials.findIndex((e) => e.serial == new_sn)!;
  if (newSN >= 0) {
    if (oldSN >= 0) serials[oldSN].available = true;
    serials[newSN].available = false;
    store.commit('setSerial', {
      quantity: index,
      nxid: nxid,
      serial: serials[newSN].serial,
    });
  }
}

function localCheckout() {
  let cart = [] as CartItem[];
  for (let item of store.state.cart.unserialized.keys()) {
    cart.push({ nxid: item, quantity: store.getters.getQuantity(item) });
  }
  store.state.cart.serialized.map((e) => {
    cart.push({ nxid: e.nxid, serial: e.serial } as CartItem);
  });
  console.log(cart);
  checkout(http, cart, currentUser.value._id!, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    displayMessage('Successfully checked out.');
    store.commit('emptyCart');
    loadCart();
  });
}
</script>

<template>
  <form @submit.prevent="localCheckout">
    <div v-if="parts.length != 0 || store.state.cart.serialized.length != 0">
      <div class="mb-4 flex flex-wrap justify-between">
        <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
          Check Out:
        </h1>
        <div class="flex">
          <p class="my-auto mr-2">User:</p>
          <select required v-model="currentUser" class="mt-auto">
            <option disabled :value="''"></option>
            <option v-for="user in users" :value="user">
              {{ `${user.first_name} ${user.last_name}` }}
            </option>
          </select>
        </div>
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
      <SerializedCartItemComponent
        :key="keys[index]"
        :init_serial="item.serial"
        :index="index"
        v-for="(item, index) of store.state.cart.serialized"
        :part="cachedRecords.get(item.nxid!)"
        :serials="allSerials.get(item.nxid)"
        @update="updateSerial"
        @add="addSerialized"
        @delete="deleteSerialized"
      />
      <CartItemComponent
        v-for="item in parts"
        v-bind:key="item.part.nxid"
        :part="item.part"
        :quantity="item.quantity!"
        @plus="addOne(item.part.nxid!)"
        @minus="subOne(item.part.nxid!)"
        @delete="deletePart(item.part.nxid!)"
      />
      <div class="flex justify-center">
        <input type="submit" class="submit mx-1" value="Check Out" />
      </div>
    </div>
    <div v-else>
      <h1 class="mb-4 text-4xl">Check Out:</h1>
      <p>List is empty...</p>
    </div>
  </form>
</template>
