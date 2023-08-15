<script setup lang="ts">
import { LoadedCartItem, PartSchema } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import { ref, watch } from 'vue';
interface Props {
  isCurrentUser: boolean;
  item: LoadedCartItem;
  maxQuantity?: number;
  untracked?: boolean
}
const { maxQuantity, isCurrentUser, item, untracked } = defineProps<Props>();
let quantityVisible = ref(item.quantity)
let emit = defineEmits(['movePart'])
let serial = ref(item.serial?item.serial:"")

watch(()=>item.quantity, ()=>{
  if(item.quantity) {
    quantityVisible.value = item.quantity
  }
})

function updateQuantity() {
  if(maxQuantity&&quantityVisible.value!>maxQuantity)
    quantityVisible.value = maxQuantity
  if(quantityVisible.value!<0)
    quantityVisible.value = 0
  emit('movePart', item.part, quantityVisible.value!-item.quantity!)
}
function updateSerial() {
  item.serial = serial.value
}
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-8 md:grid-cols-6 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ item.part.nxid }}</p>
      <p class="break-words">{{ item.part.manufacturer }}</p>
      <p class="break-words">{{ item.part.name }}</p>
      <p class="hidden break-words md:block">
        {{
          `${item.part.rack_num ? item.part.rack_num : ''}${
            item.part.shelf_location ? item.part.shelf_location : ''
          }`
        }}
      </p>
      <input
        class="textbox pl-2 "
        v-if="untracked"
        required
        v-model="serial"
        type="text"
        placeholder="Serial"
        v-on:focusout="updateSerial"
      />
      <p class="break-words" v-else-if="item.part.serialized&&item.serial">
        {{ item.serial }}
      </p>
      <p v-else-if="!isCurrentUser" class="break-words">{{ item.quantity }}</p>
      <div v-else class="flex justify-center">
        <input
          class="textbox pl-2 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right"
          required
          v-model="quantityVisible"
          type="number"
          min="0"
          step="1"
          v-on:focusout="updateQuantity"
        />
        <p class="break-words">/ {{ maxQuantity }}</p>
      </div>

      <div v-if="isCurrentUser" class="my-auto flex justify-end">
        <!-- Single arrow up -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          v-on:click="$emit('movePart', item.part, -1, item.serial)"
          class="button-icon hover:button-icon-hover active:button-icon-active"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M169.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L192 205.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"
          />
        </svg>
        <!-- Double arrow up -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-if="item.quantity && item.quantity > 1"
          v-on:click="$emit('movePart', item.part, item.quantity ? item.quantity*-1 : -1, item.serial)"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3 329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 329.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"
          />
        </svg>
        <div v-else class="button-icon opacity-0"></div>
      </div>
      <div v-else class="flex justify-end">
        <!-- Single arrow down -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="$emit('movePart', item.part, -1, item.serial)"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M169.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 274.7 54.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
          />
        </svg>
        <!-- Double arrow down -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-if="item.quantity && item.quantity > 1"
          v-on:click="$emit('movePart', item.part, item.quantity ? item.quantity * -1 : -1, item.serial)"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M214.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 402.7 329.4 265.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-160 160zm160-352l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 210.7 329.4 73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z"
          />
        </svg>
        <div v-else class="button-icon opacity-0"></div>
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
