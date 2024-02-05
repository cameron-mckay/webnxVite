<script setup lang="ts">
import CartItemComponent from '../../components/KioskComponents/CartItemComponent.vue';
import { onBeforeMount, ref, Ref } from 'vue';
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import {
  checkout,
  getPartByID,
} from '../../plugins/dbCommands/partManager';
import type {
  CartItem,
  InventoryEntry,
  LoadedCartItem,
  PartSchema,
  User,
  UserState,
} from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, store, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS

let parts: Ref<Array<LoadedCartItem>> = ref([]);
let users = ref([] as User[]);
let currentUser = ref({} as User);
let processingCheckout = false

onBeforeMount(() => {
  loadCart();
});

async function loadCart() {
  Cacher.loadAllUsersFromAPISync().then((u)=>{
    users.value = u.filter((f)=>f.roles?.includes('check_out_parts'))
  })
  parts.value = [];
  for (let item of store.state.parts.keys()) {
    let p = await Cacher.getPartInfoKiosk(item, store.state.user)
    if (p.serialized) {
      let q = store.getters.getQuantity(item)
      for(let i = 0; i < q; i++) {
        parts.value.push({
          part: p,
          serial: ""
        });
      }
      continue
    }
    parts.value.push({
      part: p,
      quantity: store.getters.getQuantity(item),
    });
  }
}

async function deletePart(item: LoadedCartItem) {
  if(item.part.serialized) {
    store.commit('removeOne', item.part.nxid);
    parts.value = parts.value.filter((p)=>p!=item)
  }
  else {
    store.commit('removeAll', item.part.nxid);
    parts.value = parts.value.filter((p)=>p!=item)
  }
}

async function addOne(item: LoadedCartItem) {
  getPartByID(
    http,
    item.part.nxid!,
    store.state.user.building!,
    (data, err) => {
      let part = data as PartSchema;
      if (part.quantity! > store.getters.getQuantity(item.part.nxid!)) {
        store.commit('addOne', part.nxid);
        item.quantity = store.getters.getQuantity(item.part.nxid!)
      } else {
        errorHandler('Not enough stock');
      }
    }
  , store.state.user.first_name + " " + store.state.user.last_name);
}

async function subOne(item: LoadedCartItem) {
  store.commit('removeOne', item.part.nxid);
  item.quantity = item.quantity! -= 1
  if (store.getters.getQuantity(item.part.nxid) == 0) {
    parts.value = parts.value.filter((p)=>p.part.nxid! != item.part.nxid)
  }
}

function localCheckout() {
  if(processingCheckout)
    return
  processingCheckout = true
  let cart = [] as CartItem[];

  let partMap = new Map<string, number>()
  let serialMap = new Map<string, string[]>()
  for (let item of parts.value) {
    if(item.serial) {
      let serials = [] as string[]
      if(serialMap.has(item.part.nxid!))
        serials = serialMap.get(item.part.nxid!)!
      serials.push(item.serial)
      serialMap.set(item.part.nxid!, serials)
      cart.push({ nxid: item.part.nxid!, serial: item.serial })
    }
    let quantity = item.quantity ? item.quantity : 1
    if(partMap.has(item.part.nxid!))
      quantity += partMap.get(item.part.nxid!)!
    partMap.set(item.part.nxid!, quantity)
  }
  
  let invEntries = [] as InventoryEntry[]
  partMap.forEach((v, k) => {
    invEntries.push({
      nxid: k,
      unserialized: v,
      serials: [],
      newSerials: serialMap.has(k) ? serialMap.get(k)! : []
    })
  })
  checkout(http, invEntries, currentUser.value._id!, (data, err) => {
    if (err) {
      processingCheckout = false
      return errorHandler(err);
    }
    displayMessage('Successfully checked out.');
    store.commit('emptyCart');
    loadCart();
    processingCheckout = false
  });
}

function updateQuantity(q: number, id: string) {
  getPartByID(
    http,
    id,
    store.state.user.building!,
    (data, err) => {
      let part = data as PartSchema;
      if (part.quantity! >= q) {
        store.commit('setQuantity', {id, quantity: q});
        if(q<1)
          parts.value = parts.value.filter((p)=>p.part.nxid! != id)
      } else {
        errorHandler('Not enough stock');
      }
    }
  , store.state.user.first_name + " " + store.state.user.last_name);
}

async function dupeSerialized(nxid: string) {
  let p = await Cacher.getPartInfo(nxid)
  let filtered = parts.value.filter((i)=>i.part.nxid==nxid)
  if(p&&p.quantity&&filtered.length<p.quantity)
    parts.value.push({part: p, serial: ""})
  else
    errorHandler('Not enough stock');
}

function updateSerial(item: LoadedCartItem, serial: string) {
  item.serial = serial
}
</script>
<template>
  <form @submit.prevent="localCheckout">
    <div v-if="parts.length != 0">
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
      <CartItemComponent
        v-for="(item, index) in parts"
        v-bind:key="item.part.nxid!+item.serial"
        :item="item"
        :serialize="true"
        @plus="addOne(item)"
        @minus="subOne(item)"
        @delete="deletePart(item)"
        @updateQuantity="updateQuantity"
        @update-serial="(serial: string)=>updateSerial(item, serial)"
        @dupe-serialized="dupeSerialized(item.part.nxid!)"
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
