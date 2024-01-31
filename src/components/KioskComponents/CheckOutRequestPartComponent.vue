<script setup lang="ts">
import { CartItem, KioskQuantity, PartSchema } from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';
import { onMounted, readonly, ref, watch } from 'vue';
import { clamp } from '../../plugins/CommonMethods';

interface Props {
  part: CartItem,
  kiosk_quantities: Map<string, KioskQuantity[]>
  view_only?: boolean
}

let { part, kiosk_quantities, view_only } = defineProps<Props>()
let loaded = ref(false)
let quantities = ref([] as KioskQuantity[])
let serials = ref([] as string[])
let info = {} as PartSchema
let updating = false
let emit = defineEmits(['update'])

onMounted(async ()=>{
  // Set loader
  loaded.value = false
  // Get info for current part
  info = await Cacher.getPartInfo(part.nxid)
  //
  if(view_only) {
    loaded.value = true
    return
  }
  // Get the inital values
  quantities.value = kiosk_quantities.get(part.nxid)!.sort((a, b) => b.quantity - a.quantity).map((q)=>{
    return { kiosk: q.kiosk, max: q.quantity, quantity: q.quantity}
  })
  // Call the slider update
  updateSliders()
  loaded.value = true
})

function updateSliders() {
  // Return if function is already running
  if(updating) {
    return
  }
  // Set flag
  updating = true
  // Temp running total
  let total = 0
  // Working array
  let arrayCopy = [] as KioskQuantity[]
  // Loop through all the quantities
  for(let q of quantities.value) {
    // Skip over rejected
    if(q.kiosk=="Rejected")
      continue
    // Calculate the new quantity
    let quantity = clamp(parseInt(q.quantity as any as string), 0, part.quantity! - total)
    // Push to array
    arrayCopy.push({kiosk: q.kiosk, max: q.max, quantity})
    // Update running total
    total += quantity
  }
  // Update the serial array
  updateSerialArray(total)
  // Check for remaining parts
  if(part.quantity! - total > 0)
    // Push remaining as rejected
    arrayCopy.push({kiosk: "Rejected", max: part.quantity!, quantity: part.quantity! - total})
  // Set array to copy
  quantities.value = arrayCopy
  // Emit update to parent
  emitUpdate()
  // Watch the new array
  watch(quantities.value, updateSliders)
  // Unset flag
  updating = false
}

function emitUpdate() {
  emit("update", quantities.value, serials.value)
}

function updateSerialArray(newTotal: number) {
  // If serials array is too large
  while(newTotal<serials.value.length)
    // Pop until correct size
    serials.value.pop()
  // While serials array is too small
  while(newTotal>serials.value.length)
    // Push new items
    serials.value.push("")
}

</script>
<template>
  <div v-if="!loaded"></div>
  <div v-else class="my-2 background-and-border group-hover:bab-hover grid grid-cols-4 p-1 text-center leading-8 md:p-2 md:leading-10">
    <div class="md:col-span-2 flex flex-wrap md:grid md:grid-cols-2">
      <p class="w-full md:w-auto">{{ part.nxid ? part.nxid : "PNX0000000" }}</p>
      <p class="w-full md:w-auto">{{ info.manufacturer }} {{ info.name }}</p>
    </div>
    <div>
      <p class="w-full md:w-auto">{{ info.shelf_location }}</p>
    </div>
    <div v-if="view_only!=true">
      <div v-for="q of quantities">
        <div>
          <p class="leading-6">{{q.kiosk}}: {{ q.quantity }}</p>
          <input class="w-full h-2 rounded-lg accent-green-400 cursor-pointer text-gray-200 dark:text-gray-700" type="range" min="0" :max="part.quantity! < q.max! ? part.quantity : q.max" v-model="q.quantity" :disabled="q.kiosk=='Rejected'"/>
        </div>
      </div>
      <div v-if="info.serialized">
        <input
          v-for="(serial, index) of serials"
          class="textbox pl-2 my-1"
          required
          v-model="serials[index]"
          type="text"
          placeholder="Serial"
          @focusout="emitUpdate"
        />
      </div>
    </div>
    <div v-else>
      <p class="w-full md:w-auto" v-if="part.serial">{{ part.serial }}</p>
      <p class="w-full md:w-auto" v-else>{{ part.quantity }}</p>
    </div>
  </div>
</template>
