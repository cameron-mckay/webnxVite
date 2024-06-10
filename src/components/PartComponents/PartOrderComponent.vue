<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { LoadedCartItem, PartOrderSchema, PartSchema } from '../../plugins/interfaces'
import CheckoutHistoryPartComponent from '../KioskComponents/CheckoutHistoryPartComponent.vue';
import InlinePartSpecComponent from './InlinePartSpecComponent.vue';

interface Props {
  order: PartOrderSchema
  partMap: Map<string, PartSchema>
}

let { order, partMap } = defineProps<Props>()
let orderedParts = ref([] as LoadedCartItem[])
let receivedParts = ref([] as { kiosk?: string, box_tag?: string, parts: LoadedCartItem[] }[])
let perUnitCosts = ref([] as LoadedCartItem[])
onBeforeMount(async ()=>{
  orderedParts.value = await Promise.all(order.ordered_parts!.map((p)=>{
    return new Promise<LoadedCartItem>(async (res) => {
      let part = partMap.get(p.nxid)!
      res({
        part,
        serial: p.serial,
        quantity: p.quantity
      })
    })
  }))
  receivedParts.value = await Promise.all(order.received_parts!.map(async (p)=>{
    let copy = JSON.parse(JSON.stringify(p))
    copy.parts =  await Promise.all(p.parts.map((v)=>{
      let part = partMap.get(v.nxid)!
      return {
        part,
        serial: v.serial,
        quantity: v.quantity
      }
    }))
    return copy
  }))

  perUnitCosts.value = await Promise.all(order.per_unit_costs!.map(async (p)=>{
    let part = partMap.get(p.nxid)!
    return {
      part,
      quantity: p.cost
    }
  }))
})
</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div>
      <p class="text-4xl">
        Created: {{ new Date(order.date_created).toLocaleString() }}
      </p>
      <p class="mb-1 mt-4 text-3xl" v-if="order.create_notes&&order.create_notes!=''">
        Notes:
      </p>
      <pre class="whitespace-pre-wrap notes-with-links">{{ order.create_notes }}</pre>
    </div>

    <div>
      <h1 class="text-3xl mt-8 mb-2">Ordered Parts:</h1>
      <div
        class="relative grid grid-cols-3 md:grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
      >
        <p class="mt-auto hidden md:block">NXID</p>
        <p class="mt-auto">Manufacturer</p>
        <p class="mt-auto">Name</p>
        <p class="mt-auto">Quantity/SN</p>
      </div>
      <CheckoutHistoryPartComponent
        v-for="part in orderedParts"
        :item="part"
        :hideButtons="true"
      />
    </div>

    <div v-if="order.date_received!=null">
      <div class="flex justify-between">
        <p class="text-4xl mt-12">
          {{ order.cancelled ? "Cancelled:" : "Received:" }} {{ new Date(order.date_created).toLocaleString() }}
        </p>
      </div>
      <div v-if="order.received_notes&&order.received_notes!=''">
        <p class="mb-1 mt-4 text-3xl">
          Notes:
        </p>
        <pre class="whitespace-pre-wrap notes-with-links">{{ order.received_notes }}</pre>
      </div>
      <div v-if="order.per_unit_costs.length>0">
        <h1 class="text-3xl mt-8 mb-2">Per Unit Costs:</h1>
        <div
          class="relative grid grid-cols-3 md:grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
        >
          <p class="mt-auto hidden md:block">NXID</p>
          <p class="mt-auto">Manufacturer</p>
          <p class="mt-auto">Name</p>
          <p class="mt-auto">Unit Cost</p>
        </div>
        <div class="group relative my-1" v-for="item of perUnitCosts">
          <div
            class="group-hover:bab-hover background-and-border grid p-1 text-center leading-8 grid-cols-3 md:grid-cols-4 md:p-2 md:leading-10"
          >
            <p class="hidden md:block">{{ item.part.nxid ? item.part.nxid : "PNX0000000" }}</p>
            <p class="break-words">{{ item.part.manufacturer ? item.part.manufacturer : "DELETED PART" }}</p>
            <p class="break-words">{{ item.part.name ? item.part.name : "DELETED PART" }}</p>
            <p class="break-words">${{ item.quantity ? item.quantity : "DELETED" }}</p>
          </div>
          <InlinePartSpecComponent
            class="group-hover:bab-drop-hover bab-drop relative"
            :part="item.part.type ? item.part : { type: 'DELETED', notes: 'The part info associated with this NXID has been deleted' }"
          />
        </div>
      </div>
      <div
        v-if="receivedParts.length>0"
      >
        <h1 class="text-3xl mt-8 mb-2">Created Part Records:</h1>
        <div
          v-for="location in receivedParts"
        >
          <p class="text-xl mt-4 mb-1">{{ location.kiosk }}{{ location.box_tag }}:</p>
          <div
            class="relative grid grid-cols-3 md:grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
          >
            <p class="mt-auto hidden md:block">NXID</p>
            <p class="mt-auto">Manufacturer</p>
            <p class="mt-auto">Name</p>
            <p class="mt-auto">Quantity/SN</p>
          </div>
          <CheckoutHistoryPartComponent
            :item="part"
            :hideButtons="true"
            v-for="part in location.parts"
          />
        </div>
      </div>
    </div>
    <div class="flex justify-center" v-else>
      <input
        @click="$emit('received')"
        class="submit col-span-2 mx-1 mt-4"
        type="submit"
        value="Finish"
      />
      <input
        @click="$emit('cancel')"
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700 mx-1 mt-4"
        type="reset"
        value="Cancel"
      />
    </div>
  </div>
</template>
