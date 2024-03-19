<script setup lang="ts">
import CartItemComponent from '../../components/KioskComponents/CartItemComponent.vue';
import { onBeforeMount, ref, Ref } from 'vue';
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import {
  getPartByID, requestParts,
} from '../../plugins/dbCommands/partManager';
import type {
  CartItem,
  LoadedCartItem,
  PartSchema,
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
let processingCheckout = false
let notes = ref("")
let loading = ref(true)

onBeforeMount(() => {
  loadCart();
});

async function loadCart() {
  loading.value = true
  parts.value = [];
  let loaded = await Promise.all(Array.from(store.state.parts.keys()).map((nxid)=>{
    return Cacher.getPartInfo(nxid)
  }))
  parts.value = loaded.map((p)=>{
    return {
      part: p,
      quantity: store.getters.getQuantity(p.nxid),
    }
  })
  loading.value = false
}

async function deletePart(item: LoadedCartItem) {
  store.commit('removeAll', item.part.nxid);
  parts.value = parts.value.filter((p)=>p!=item)
}

async function addOne(id: string) {
  getPartByID(
    http,
    id,
    store.state.user.building!,
    (data, err) => {
      let part = data as PartSchema;
      if (part.quantity! > store.getters.getQuantity(id)) {
        store.commit('addOne', part.nxid);

      } else {
        errorHandler('Not enough stock');
      }
    })
}

async function subOne(id: string) {
  store.commit('removeOne', id);
  if (store.getters.getQuantity(id) == 0) {
    parts.value = parts.value.filter((p)=>p.part.nxid! != id)
  }
}

function localCheckout() {
  if(processingCheckout)
    return
  processingCheckout = true
  let cart = [] as CartItem[];
  
  for (let item of parts.value) {
    cart.push({ nxid: item.part.nxid!, quantity: store.state.parts.get(item.part.nxid!)! })
  }
  requestParts(http, cart, notes.value, (data, err) => {
    if(err) {
      processingCheckout = false
      return errorHandler(err);
    }
    store.commit('emptyCart');
    loadCart()
    processingCheckout = false
    displayMessage(data as string);
  })
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
    })
}
</script>
<template>
  <form @submit.prevent="localCheckout">
    <div>
      <div class="mb-4 flex flex-wrap justify-between">
        <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
          Request Parts:
        </h1>
        <div class="flex">
          <RouterLink
            class="cursor-pointer text-sm my-auto rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none mx-2"
            :to="`/partRequests/active`"
          >
            Active Part Requests
          </RouterLink>
          <RouterLink
            class="cursor-pointer text-sm my-auto rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none mx-2"
            :to="`/partRequests/fulfilled`"
          >
            Fulfilled Part Requests
          </RouterLink>
        </div>
      </div>
      <LoaderComponent
        v-if="loading"
      />
      <div 
        v-else-if="parts.length != 0"
      >
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
          v-for="item in parts"
          v-bind:key="item.part.nxid!+item.serial"
          :item="item"
          :serialize="false"
          @plus="addOne(item.part.nxid!)"
          @minus="subOne(item.part.nxid!)"
          @delete="deletePart(item)"
          @updateQuantity="updateQuantity"
        />
        <div class="col-span-2 my-4">
          <!-- -->
          <h1 class="inline-block text-4xl leading-8 md:leading-10">Notes:</h1>
          <textarea
            class="textbox m-1 h-40"
            v-model="notes"
            placeholder="Drag to resize"
          />
          <!-- -->
        </div>
        <div class="flex justify-center">
          <input type="submit" class="submit mx-1" value="Submit" />
        </div>
      </div>
      <div v-else>
        <p>List is empty...</p>
      </div>
    </div>
  </form>
</template>
