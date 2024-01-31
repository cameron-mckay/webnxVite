<script setup lang="ts">
import { CartItem, InventoryEntry, LoadedCartItem, PartRequestSchema } from '../../plugins/interfaces'
import { onBeforeMount, ref } from 'vue';
import Cacher from '../../plugins/Cacher';
import CartItemComponent from './CartItemComponent.vue';

interface Props {
  request: PartRequestSchema
}

let { request } = defineProps<Props>()

let requestCopy = ref(JSON.parse(JSON.stringify(request)) as PartRequestSchema)
let requestedBy = Cacher.getUser(request.requested_by)
let fulfilledBy = request.fulfilled_by ? Cacher.getUser(request.fulfilled_by): {}
let requestedParts = ref([] as LoadedCartItem[])
let fulfilledParts = ref([] as {kiosk: string, parts: LoadedCartItem[]}[])

onBeforeMount(async ()=>{
  requestedParts.value = await Cacher.loadCartItems(request.parts)
  fulfilledParts.value = await Promise.all((request.fulfilled_list ? request.fulfilled_list : []).map((p)=>{
    return new Promise<{kiosk: string, parts: LoadedCartItem[]}>(async (res)=>{
      let cartItems = [] as CartItem[]
      for(let ie of p.parts) {
        let q = ie.unserialized
        for(let s of ie.newSerials!) {
          cartItems.push({nxid: ie.nxid!, serial: s})
          q--
        }
        if(q>0)
          cartItems.push({nxid: ie.nxid!, quantity: q})

      }
      let parts = await Cacher.loadCartItems(cartItems)
      res({kiosk: p.kiosk, parts})
    })
  }))
})

</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="flex justify-between">
      <h1 class="text-2xl leading-8 md:leading-10">
        Requested: {{ new Date(requestCopy.date_created).toLocaleString() }}
      </h1>
      <p>
        {{ requestedBy.first_name + " " + requestedBy.last_name }}
      </p>
    </div>
    <div class="my-4" v-if="request.tech_notes">
      <h1 class="mb-4 text-4xl">Tech Notes:</h1>
      <pre>{{ request.tech_notes }}</pre>
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
    <CartItemComponent v-for="p of requestedParts" :item="p" :hide-buttons="true"/>

    <hr class="h-1 border-0 rounded my-8 nx-color" v-if="request.cancelled || request.date_fulfilled">
    <div v-if="request.cancelled">
        <h1 class="text-2xl leading-8 md:leading-10 text-red-500 dark:text-red-500">
          Cancelled: {{ new Date(requestCopy.date_fulfilled!).toLocaleString() }}
        </h1>
    </div>
    <div v-else-if="request.date_fulfilled">
      <div class="flex justify-between">
        <h1 class="text-2xl leading-8 md:leading-10">
          Fulfilled: {{ new Date(requestCopy.date_fulfilled!).toLocaleString() }}
        </h1>
        <p>
          {{ fulfilledBy.first_name + " " + fulfilledBy.last_name }}
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
      <div v-for="k of fulfilledParts">
        <h1 class="text-xl">{{ k.kiosk }}</h1>
        <CartItemComponent v-for="p of k.parts" :item="p" :hide-buttons="true"/>
      </div>
      <div class="my-4" v-if="request.clerk_notes">
        <h1 class="mb-4 text-4xl">Inventory Notes:</h1>
        <pre>{{ request.clerk_notes }}</pre>
      </div>
    </div>
    <div v-else class="flex justify-center">
      <input
        type="submit"
        @click="$emit('cancel')" 
        class="submit mb-0 bg-red-500 hover:bg-red-600 active:bg-red-700"
        value="Cancel Request"
      />
    </div>
  </div>
</template>
