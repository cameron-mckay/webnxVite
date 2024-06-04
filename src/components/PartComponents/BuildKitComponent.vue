<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import Cacher from '../../plugins/Cacher';
import { LoadedCartItem, BuildKitSchema } from '../../plugins/interfaces'
import CheckoutHistoryPartComponent from '../KioskComponents/CheckoutHistoryPartComponent.vue';

interface Props {
  buildKit: BuildKitSchema
  create: boolean
  request: boolean
  claim: boolean
}

let { buildKit, create, request, claim } = defineProps<Props>()
let loadedParts = ref([] as LoadedCartItem[])
let requested = ref(false)
onBeforeMount(async ()=>{
  loadedParts.value = await Promise.all(buildKit.parts!.map((p)=>{
    return new Promise<LoadedCartItem>(async (res) => {
      let part = await Cacher.getPartInfo(p)
      res({
        part,
        serial: p.serial,
        quantity: p.quantity
      })
    })
  }))
})
</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="flex justify-between">
      <h1 class="text-2xl leading-8 md:leading-10">
        {{ buildKit.kit_name }}
      </h1>
      <p>
        Created: {{ new Date(buildKit.date_created).toLocaleString() }}
      </p>
    </div>
    <pre class="whitespace-pre-wrap notes-with-links">{{ buildKit.notes }}</pre>
    <div>
      <div
        class="relative grid grid-cols-3 md:grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
      >
        <p class="mt-auto hidden md:block">NXID</p>
        <p class="mt-auto">Manufacturer</p>
        <p class="mt-auto">Name</p>
        <p class="mt-auto">Quantity/SN</p>
      </div>
      <CheckoutHistoryPartComponent
        v-for="part in loadedParts"
        :item="part"
        :hideButtons="true"
      />
    </div>
    <div class="flex justify-center">
      <input
        v-if="!(buildKit.requested_by||requested)&&claim"
        @click="$emit('claim')"
        class="submit col-span-2 mx-1 mt-4"
        type="submit"
        value="Claim Kit"
      />
      <input
        v-if="buildKit.requested_by&&buildKit.requested_by!=Cacher.getCurrentUser()._id&&(request||claim)"
        class="submit bg-green-300 text-black hover:bg-green-300 hover:cursor-default col-span-2 mx-1 mt-4"
        type="submit"
        value="Requested By Other User"
      />
      <input
        v-else-if="requested||buildKit.requested_by==Cacher.getCurrentUser()._id&&request"
        class="submit bg-green-300 text-black hover:bg-green-300 hover:cursor-default col-span-2 mx-1 mt-4"
        type="submit"
        value="Requested"
      />
      <input
        v-else-if="request"
        @click="()=>{$emit('request'); requested = true;}"
        class="submit col-span-2 mx-1 mt-4"
        type="submit"
        value="Request Kit"
      />
      <input
        v-if="create"
        @click="$emit('delete')"
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700 mx-1 mt-4"
        type="reset"
        value="Delete"
      />
    </div>
  </div>
</template>
