<script setup lang="ts">
import { CartItem, KioskQuantity, PartSchema } from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';
import { onMounted, ref } from 'vue';
import { clamp } from '../../plugins/CommonMethods';
import CustomDropdownComponent from '../GenericComponents/CustomDropdownComponent.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';

interface Props {
  part: CartItem,
  kiosk_quantities: Map<string, KioskQuantity[]>
  view_only?: boolean
}

let { part, kiosk_quantities, view_only } = defineProps<Props>()
let loaded = ref(false)
let quantities = ref([] as any[])
let boxMap = ref(new Map<string, {serials: string[], quantity: number}>())
let box_sliders = ref([] as any[])
let info = {} as PartSchema
let updating = false
let emit = defineEmits(['update'])
let activeBoxTag = ref("")

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
    return { kiosk: q.kiosk, box_tag: q.box_tag, max: q.quantity, quantity: q.quantity, serials: q.serials, selectedSerials: padOrClampArray([], q.quantity) }
  })

  let maxQboxes = 0
  quantities.value.filter((q)=>q.kiosk=="Box").map((q)=>{
    boxMap.value.set(q.box_tag, {serials: q.serials, quantity: q.quantity})
    maxQboxes += q.quantity
  })

  quantities.value = quantities.value.filter((q)=>q.kiosk!="Box")

  quantities.value.push({kiosk: "Box", max: maxQboxes, quantity: maxQboxes, serials: [], selectedSerials: []})
  // Call the slider update
  updateMainSliders()
  loaded.value = true
})

function updateSliders(total_quantity: number, array: KioskQuantity[], catch_all_name: string) {
  // Return if function is already running
  if(updating) {
    return array
  }
  // Set flag
  updating = true
  // Temp running total
  let running_total = 0
  // Working array
  let arrayCopy = [] as any[]
  // Loop through all the quantities
  for(let q of array) {
    // Skip over rejected
    if(q.kiosk==catch_all_name)
      continue
    // Calculate the new quantity
    let quantity = clamp(parseInt(q.quantity as any as string), 0, total_quantity - running_total)
    // Push to array
    arrayCopy.push({
      kiosk: q.kiosk,
      max: q.max,
      quantity,
      serials: q.serials,
      selectedSerials: padOrClampArray(q.selectedSerials!, quantity) })
    // Update running total
    running_total += quantity
  }
  // Check for remaining parts
  if(total_quantity - running_total > 0) {

    console.log(catch_all_name)
    // Push remaining as rejected
    arrayCopy.push({kiosk: catch_all_name, max: part.quantity!, quantity: total_quantity - running_total, serials: []})
  }
  // Emit update to parent
  emitUpdate()
  updating = false
  return arrayCopy
}

function updateBoxSliders() {
  let index = quantities.value.findIndex((v)=>v.kiosk=="Box")
  if(index!=-1) {
    console.log("FUCK 2")
    console.log(quantities.value[index].quantity)
    console.log(box_sliders.value)
    box_sliders.value = updateSliders(quantities.value[index].quantity, box_sliders.value, "Unassigned").filter((v)=>v.quantity>0)
  }
  else {
    box_sliders.value = []
  }
}

function updateMainSliders() {
  quantities.value = updateSliders(part.quantity!, quantities.value, "Rejected")
  if(box_sliders.value.length>0&&quantities.value.findIndex((v)=>v.kiosk=="Box")==-1)
    updateBoxSliders()
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

function addBox() {
  console.log(activeBoxTag.value)
  if(activeBoxTag.value=="")
    return
  let box = boxMap.value.get(activeBoxTag.value)
  let unassignedQuantity = box_sliders.value[box_sliders.value.findIndex((v)=>v.kiosk=="Unassigned")].quantity
  let quantity = clamp(box!.quantity!, 0, unassignedQuantity)
  box_sliders.value.push({
    kiosk: activeBoxTag.value,
    max: box?.quantity,
    quantity,
    serials: box?.serials,
    selectedSerials: padOrClampArray([], quantity) })
  activeBoxTag.value = ""
  updateBoxSliders()
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
            @change="()=>{
              updateMainSliders()
              if(q.kiosk=='Box') {
                updateBoxSliders()
              }
            }"
          />
        </div>
        <!-- If box -->
        <div v-if="q.kiosk=='Box'&&box_sliders.length>0" class="background-and-border">
          <p class="font-bold text-lg text-left mb-1 border-b-2 nx-border-color p-2">Boxes:</p>
          <div v-for="b of box_sliders">
            <!-- box slider goes here -->
            <div class="p-2"
              :class="{ 'nx-border-color border-t-2': b.kiosk=='Unassigned'}">
              <p class="leading-6">{{b.kiosk}}: {{ b.quantity }}</p>
              <input
                class="w-full h-2 rounded-md accent-green-400 cursor-pointer text-gray-200 dark:text-gray-700"
                type="range"
                min="0"
                :max="q.quantity! < b.max! ? q.quantity : b.max" v-model="b.quantity"
                :disabled="b.kiosk=='Unassigned'"
                @change="updateBoxSliders"
              />
            </div>
            <!-- Add another box here -->
            <div v-if="b.kiosk=='Unassigned'" class="p-2">
              <p class="text-left">Add another box:</p>
              <div class="flex">
                <select
                  v-model="activeBoxTag"
                >
                  <option disabled value="" selected>Select</option>
                  <option
                    v-for="tag of boxMap.keys()"
                    :disabled="box_sliders.findIndex((z)=>z.kiosk==tag)!=-1"
                    :value="tag"
                  >
                    {{tag}}
                  </option>
                </select>
                <PlusButton 
                  @click="addBox"
                />
              </div>
            </div>

            <!-- Assign serials here -->
            <div v-else-if="info.serialized&&b.quantity>0" class="p-2">
              <div>
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
                  v-for="(serial, index) of b.selectedSerials"
                >
                  <option v-for="s of b.serials"
                    :disabled="b.selectedSerials!.indexOf(s)!=-1"
                    :value="s"
                  >
                    {{s}}
                  </option>
                </CustomDropdownComponent>
              </div>
            </div>
            <!-- End assign serials -->
          </div>
          <!-- End for -->
        </div>
        <!-- End box -->
        <div v-else-if="info.serialized&&q.quantity>0">
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
    <div v-else>
      <p class="w-full md:w-auto" v-if="part.serial">{{ part.serial }}</p>
      <p class="w-full md:w-auto" v-else>{{ part.quantity }}</p>
    </div>
  </div>
</template>
