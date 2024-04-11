<script setup lang="ts">
import { BuildKitSchema, CartItem, InventoryEntry, LoadedCartItem, PartRequestSchema, User } from '../../plugins/interfaces'
import { onBeforeMount, ref } from 'vue';
import Cacher from '../../plugins/Cacher';
import CartItemComponent from './CartItemComponent.vue';

interface Props {
  request: PartRequestSchema
  kit?: BuildKitSchema
}

let { request, kit } = defineProps<Props>()

let requestCopy = ref(JSON.parse(JSON.stringify(request)) as PartRequestSchema)
let requestedBy = Cacher.getUser(request.requested_by)
let fulfilledBy = request.fulfilled_by ? Cacher.getUser(request.fulfilled_by): {}
let requestedParts = ref([] as LoadedCartItem[])
let fulfilledParts = ref([] as {kiosk: string, parts: LoadedCartItem[]}[])
let boxParts = ref([] as {box_tag: string, parts: LoadedCartItem[]}[])
let kiosk = {} as User

onBeforeMount(async ()=>{
  if(kit) {
    if(request.date_fulfilled)
      requestedParts.value = kit.claimed_parts ? await Cacher.loadCartItems(kit.claimed_parts) : []
    else
      requestedParts.value = kit.parts ? await Cacher.loadCartItems(kit.parts) : []
    kiosk = Cacher.getUser(kit.kiosk)
  }
  else {
    requestedParts.value = await Cacher.loadCartItems(request.parts)
    fulfilledParts.value = await Promise.all((request.fulfilled_list ? request.fulfilled_list : []).map((p)=>{
      return new Promise<{kiosk: string, parts: LoadedCartItem[]}>(async (res)=>{
        let cartItems = [] as CartItem[]
        for(let ie of p.parts) {
          if(ie.unserialized||ie.newSerials||ie.serials) {
            let q = ie.unserialized
            if(ie.serials) {
              for(let s of ie.serials!) {
                cartItems.push({nxid: ie.nxid!, serial: s})
                q--
              }
            }
            if(q>0)
              cartItems.push({nxid: ie.nxid!, quantity: q})
          }
          else {
            cartItems.push(ie as CartItem)
          }
        }
        let parts = await Cacher.loadCartItems(cartItems)
        res({kiosk: p.kiosk, parts})
      })
    }))
    boxParts.value = await Promise.all(request.boxes.map((box) => {
      return new Promise<{box_tag: string, parts: LoadedCartItem[]}>(async (res)=>{
        let parts = await Cacher.loadCartItems(box.parts)
        res({box_tag: box.box_tag, parts})

      })
    }))
  }
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
    <div class="col-span-2 my-4" v-if="kit">
      <p><span class="font-bold">Kit Name:</span> {{kit.kit_name}}</p>
      <p><span class="font-bold">Kiosk:</span> {{kiosk.first_name}} {{kiosk.last_name}}</p>
      <pre class="notes-with-links whitespace-pre-wrap"><span class="font-bold">Kit Notes:</span> {{kit.notes}}</pre>
    </div>
    <div class="my-4" v-if="request.tech_notes">
      <h1 class="mb-4 text-4xl">Tech Notes:</h1>
      <pre class="whitespace-pre-wrap notes-with-links">{{ request.tech_notes }}</pre>
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
        <h1 v-if="request.denied" class="text-2xl leading-8 md:leading-10 text-red-500 dark:text-red-500">
          Denied: {{ new Date(requestCopy.date_fulfilled!).toLocaleString() }}
        </h1>
        <h1 v-else class="text-2xl leading-8 md:leading-10">
          Fulfilled: {{ new Date(requestCopy.date_fulfilled!).toLocaleString() }}
        </h1>
        <p>
          {{ fulfilledBy.first_name + " " + fulfilledBy.last_name }}
        </p>
      </div>
      <div
        v-if="!kit&&!request.denied"
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
      <div v-for="b of boxParts">
        <h1 class="text-xl">{{ b.box_tag }}</h1>
        <CartItemComponent v-for="p of b.parts" :item="p" :hide-buttons="true"/>
      </div>
      <div class="my-4" v-if="request.clerk_notes">
        <h1 class="mb-4 text-4xl">Inventory Notes:</h1>
        <pre class="whitespace-pre-wrap">{{ request.clerk_notes }}</pre>
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
