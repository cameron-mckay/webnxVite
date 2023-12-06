<script setup lang="ts">
import { AssetPart } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import { ref, watch } from 'vue';
interface Props {
  item: AssetPart;
  maxQuantity?: number;
  hideButtons?: boolean;
  untracked?: boolean;
}
const { item, maxQuantity, hideButtons, untracked } = defineProps<Props>();
const emit = defineEmits(['movePart']);
let quantityVisible = ref(item.quantity ? item.quantity : 0)
let serial = ref(item.serial?item.serial:"")

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

// Function called on exit since serial is used as 
// key, and key updates reset the component.
// Direct model was causing dropped or delayed input
function updateSerial() {
  item.serial = serial.value
}
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-8 md:grid-cols-5 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ item.part.nxid }}</p>
      <p class="break-words">{{ item.part.manufacturer }}</p>
      <p class="break-words">{{ item.part.name }}</p>
      <input
        class="textbox pl-2 "
        v-if="untracked && item.part.serialized"
        required
        v-model="serial"
        type="text"
        placeholder="Serial"
        v-on:focusout="updateSerial"
      />
      <p class="break-words" v-else-if="item.part.serialized || item.serial">
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
      <p class="break-words" v-else>{{ item.quantity }}</p>
      <div v-if="hideButtons != true" class="my-auto flex justify-end">
        <!-- Plus -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-if="!(item.part.serialized || item.serial)"
          v-on:click="$emit('movePart', item.part, 1, item.serial)"
        >
          <path
            stroke="currentColor"
            fill="currentColor"
            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
          />
        </svg>
        <div v-else class="button-icon opacity-0"></div>
        <!-- Minus -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          v-if="!(item.part.serialized || item.serial)"
          class="button-icon hover:button-icon-hover active:button-icon-active no-margin-on-mobile"
          v-on:click="$emit('movePart', item.part, -1, item.serial)"
        >
          <path
            stroke="currentColor"
            fill="currentColor"
            d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
          />
        </svg>
        <div v-else class="button-icon opacity-0"></div>
        <!-- X icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="$emit('movePart', item.part, item.quantity ? item.quantity * -1 : -1, item.serial)"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
          />
        </svg>
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
