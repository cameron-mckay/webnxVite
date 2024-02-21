<script setup lang="ts">
import { AssetPart, KioskQuantity, PartSchema, User } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import { onMounted, ref, watch } from 'vue';
import Cacher from '../../plugins/Cacher';
import { clamp } from '../../plugins/CommonMethods';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
import MinusButton from '../GenericComponents/Buttons/MinusButton.vue';
import XButton from '../GenericComponents/Buttons/XButton.vue';
interface Props {
  item: AssetPart;
  maxQuantity?: number;
  hideButtons?: boolean;
  untracked?: boolean;
  kiosks?: User[];
  kiosk_quantities: Map<string, KioskQuantity[]>
}
const { item, maxQuantity, hideButtons, untracked, kiosk_quantities } = defineProps<Props>();
const emit = defineEmits(['movePart', 'update', 'updateSerialized']);
let quantityVisible = ref(item.quantity ? item.quantity : 0)
// let serial = ref(item.serial?item.serial:"")

function updateQuantity() {
  if(maxQuantity&&quantityVisible.value!>maxQuantity)
    quantityVisible.value = maxQuantity
  if(quantityVisible.value!<0)
    quantityVisible.value = 0
  emit('movePart', item.part, quantityVisible.value!-item.quantity!)
}

// Watch for changes in props
watch(()=>item.quantity, ()=>{
  if(item.quantity) {
    // Update visible and invisble quantities to match
    quantityVisible.value = item.quantity
  }
})

let loaded = ref(false)
let quantities = ref([] as KioskQuantity[])
let serials = ref([] as string[])
let serialized_kiosk = ref({} as User)
let info = {} as PartSchema
let updating = false

onMounted(async ()=>{
  // Set loader
  loaded.value = false
  // Get info for current part
  info = await Cacher.getPartInfo(item.part.nxid!)
  // Get the inital values
  if(!item.serial)
    quantities.value = kiosk_quantities.get(item.part.nxid!)!.sort((a, b) => b.quantity - a.quantity).map((q)=>{
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
    if(q.kiosk=="Unsorted")
      continue
    // Calculate the new quantity
    let quantity = clamp(parseInt(q.quantity as any as string), 0, quantityVisible.value - total)
    // Push to array
    arrayCopy.push({kiosk: q.kiosk, max: q.max, quantity})
    // Update running total
    total += quantity
  }
  // Update the serial array
  updateSerialArray(total)
  // Check for remaining parts
  if(quantityVisible.value - total > 0)
    // Push remaining as rejected
    arrayCopy.push({kiosk: "Unsorted", max: quantityVisible.value, quantity: quantityVisible.value - total})
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
  emit("update", item.part.nxid, quantities.value, serials.value)
}

watch(serialized_kiosk, () => {
    emit("updateSerialized", item.part.nxid, item.serial, serialized_kiosk.value)
})

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
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-8 md:grid-cols-5 md:p-2 md:leading-10"
    >
      <p class="hidden md:block !mt-0">{{ item.part.nxid }}</p>
      <p class="break-words !mt-0">{{ item.part.manufacturer }}</p>
      <p class="break-words !mt-0">{{ item.part.name }}</p>
      <p class="break-words !mt-0" v-if="item.serial">
        {{ item.serial }}
      </p>
      <div class="flex justify-center" v-else-if="!hideButtons">
        <input
          class="textbox pl-2 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right"
          required
          v-model="quantityVisible"
          type="number"
          min="0"
          step="1"
          v-on:focusout="updateQuantity"
        />
        <p class="break-words" v-if="!untracked">/ {{ maxQuantity }}</p>
      </div>
      <p class="break-words !mt-0" v-else>{{ item.quantity }}</p>
      
      <div>
        <div v-if="hideButtons != true" class="my-auto flex justify-end">
          <!-- Plus -->
          <PlusButton
            v-if="!(item.serial)"
            v-on:click="$emit('movePart', item.part, 1, item.serial)"
          />
          <div v-else class="button-icon opacity-0"></div>
          <!-- Minus -->
          <MinusButton
            v-if="!(item.serial)"
            v-on:click="$emit('movePart', item.part, -1, item.serial)"
          />
          <div v-else class="button-icon opacity-0"></div>
          <!-- X icon -->
          <XButton
            v-on:click="$emit('movePart', item.part, item.quantity ? item.quantity * -1 : -1, item.serial)"
          />
        </div>
        <div>
          <div v-for="q of quantities">
            <div>
              <p class="leading-6">{{q.kiosk}}: {{ q.quantity }}</p>
              <input class="w-full h-2 rounded-md accent-green-400 cursor-pointer text-gray-200 dark:text-gray-700" type="range" min="0" :max="quantityVisible! < q.max! ? quantityVisible : q.max" v-model="q.quantity" :disabled="q.kiosk=='Unsorted'"/>
            </div>
          </div>

          <div v-if="info.serialized&&untracked">
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
          <select
            v-else-if="item.serial"
            required
            v-model="serialized_kiosk"
            class="textbox m-1"
          >
            <option :value="undefined" selected disabled>Select</option>
            <option :value="kiosk" v-for="kiosk of kiosks">{{ kiosk.first_name }} {{ kiosk.last_name }}</option>
          </select>
        </div>
      </div>


    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
