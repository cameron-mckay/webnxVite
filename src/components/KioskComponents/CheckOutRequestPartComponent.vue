<script setup lang="ts">
import { CartItem, KioskQuantity, PartSchema } from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';
import { onMounted, ref, watch } from 'vue';
import { clamp } from '../../plugins/CommonMethods';
import CustomDropdownComponent from '../GenericComponents/CustomDropdownComponent.vue';

interface Props {
  part: CartItem,
  kiosk_quantities: Map<string, KioskQuantity[]>
  view_only?: boolean
}

let { part, kiosk_quantities, view_only } = defineProps<Props>()
let loaded = ref(false)
let quantities = ref([] as any[])
let info = {} as PartSchema
let updating = false
let emit = defineEmits(['update'])

onMounted(async ()=>{
  let boxes = [] as any[]
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
    return { kiosk: q.kiosk, box_tag: q.box_tag, max: q.quantity, quantity: q.quantity, serials: q.serials, selectedSerials: padOrClampArray([], q.quantity) }
  })
  boxes = quantities.value.filter((q)=>q.kiosk=="Box").map((q)=>{
    return { box_tag: q.box_tag, max: q.quantity, quantity: q.quantity, serials: q.serials, selectedSerials: padOrClampArray([], q.quantity) }
  })

  let maxQboxes = 0
  for(let b of boxes) {
    maxQboxes += b.max
  }

  quantities.value = quantities.value.filter((q)=>q.kiosk!="Box")

  quantities.value.push({kiosk: "Box", max: maxQboxes, quantity: maxQboxes, boxes, serials: [], selectedSerials: []})

  console.log(quantities.value)
  // Call the slider update
  updateSliders([],[])
  watch(quantities.value, updateSliders, {deep: true})
  loaded.value = true
})

function updateSliders(val: any[], oldVal: any[]) {
  console.log("TEST")
  console.log(JSON.parse(JSON.stringify(val)))
  console.log(JSON.parse(JSON.stringify(oldVal)))
  let noChanges = JSON.stringify(val)==JSON.stringify(oldVal)
  console.log(noChanges)
  // Return if function is already running
  if(updating) {
    console.log("SKIPPED")
    return
  }
  // Set flag
  updating = true
  // Temp running total
  let total = 0
  // Working array
  let arrayCopy = [] as any[]
  // Loop through all the quantities
  for(let q of quantities.value) {
    // Skip over rejected
    if(q.kiosk=="Rejected")
      continue
    // Fuckkkkkk this
    if(q.kiosk=="Box") {
      let boxes = [] as any[]
      let totalBox = 0
      for(let b of q.boxes) {
        let quantity = clamp(parseInt(b.quantity as any as string), 0, part.quantity! - total)
        boxes.push({
          box_tag: b.box_tag,
          max: b.max,
          quantity,
          serials: b.serials,
          selectedSerials: padOrClampArray(b.selectedSerials!, quantity)
        })
        total += quantity
        totalBox += quantity
      }
      arrayCopy.push({
        kiosk: q.kiosk,
        max: q.max,
        boxes,
        quantity: totalBox,
        serials: q.serials,
        selectedSerials: padOrClampArray(q.selectedSerials!, totalBox) })
        continue
      }
    // Calculate the new quantity
    let quantity = clamp(parseInt(q.quantity as any as string), 0, part.quantity! - total)
    // Push to array
    arrayCopy.push({
      kiosk: q.kiosk,
      max: q.max,
      quantity,
      serials: q.serials,
      selectedSerials: padOrClampArray(q.selectedSerials!, quantity) })
    // Update running total
    total += quantity
  }
  // Update the serial array
  // updateSerialArray(total)
  // Check for remaining parts
  if(part.quantity! - total > 0)
    // Push remaining as rejected
    arrayCopy.push({kiosk: "Rejected", max: part.quantity!, quantity: part.quantity! - total, serials: []})
  // Set array to copy
  quantities.value = arrayCopy
  // Emit update to parent
  emitUpdate()
  // Unset flag
  updating = false
}

function padOrClampArray(arr: string[], size: number) {
  if(arr.length>size) {
    return arr.splice(0, size)
  }
  while(arr.length < size) {
    arr.push("")
  }
  return arr
}

function emitUpdate() {
  emit("update", quantities.value)
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
      <p>{{ info.rack_num! + info.shelf_location! }}</p>
    </div>
    <div v-if="view_only!=true">
      <div v-for="q of quantities">
        <div>
          <p class="leading-6">{{q.kiosk}}: {{ q.quantity }}</p>
          <input
            class="w-full h-2 rounded-md accent-green-400 cursor-pointer text-gray-200 dark:text-gray-700"
            type="range"
            min="0"
            :max="part.quantity! < q.max! ? part.quantity : q.max" v-model="q.quantity"
            :disabled="q.kiosk=='Rejected'"
          />
        </div>

        <div v-if="info.serialized&&q.quantity>0">
          <p v-if="q.kiosk=='Box'">I'm a box</p>
          
          <div v-if="q.kiosk=='Box'">

          </div>
          <div v-else>
            <p class="leading-6 text-left">Serials:</p>
            <CustomDropdownComponent
              :required="true"
              placeholder="serial"
              :custom-name="'Manual Entry'"
              :custom-at-top="true"
              :clear-prev-on-close="true"
              @update-value="(v)=>{
                q.selectedSerials![index] = v
              }"
              v-for="(serial, index) of q.selectedSerials"
            >
              <option v-for="s of q.serials"
                :disabled="q.selectedSerials!.indexOf(s)!=-1"
                :value="s"
              >
                {{s}}
              </option>
            </CustomDropdownComponent>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p class="w-full md:w-auto" v-if="part.serial">{{ part.serial }}</p>
      <p class="w-full md:w-auto" v-else>{{ part.quantity }}</p>
    </div>
  </div>
</template>
