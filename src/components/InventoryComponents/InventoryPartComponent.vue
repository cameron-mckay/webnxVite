<script setup lang="ts">
import { LoadedCartItem, PartSchema } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import { onMounted, ref, watch } from 'vue';
import SingleArrowUpButton from '../GenericComponents/Buttons/SingleArrowUpButton.vue';
import SingleArrowDownButton from '../GenericComponents/Buttons/SingleArrowDownButton.vue';
import DoubleArrowUpButton from '../GenericComponents/Buttons/DoubleArrowUpButton.vue';
import DoubleArrowDownButton from '../GenericComponents/Buttons/DoubleArrowDownButton.vue';
interface Props {
  isCurrentUser: boolean;
  item: LoadedCartItem;
  maxQuantity?: number;
  untracked?: boolean
  serialOptional?: boolean
}
const { maxQuantity, isCurrentUser, item, untracked, serialOptional } = defineProps<Props>();
let quantityVisible = ref(item.quantity)
let emit = defineEmits(['movePart'])
let serial = ref(item.serial?item.serial:"")

onMounted(()=>{
  if(item.quantity) {
    quantityVisible.value = item.quantity
  }
})

watch(()=>item.quantity, ()=>{
  if(item.quantity) {
    quantityVisible.value = item.quantity
  }
})

function updateQuantity() {
  if(quantityVisible.value as any=="")
    return
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
        :required="serialOptional!=true"
        v-model="serial"
        type="text"
        placeholder="Serial"
        v-on:mouseleave="updateSerial"
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
          v-on:mouseleave="updateQuantity"
        v-on:focusout="updateQuantity"
        />
        <p class="break-words">/ {{ maxQuantity }}</p>
      </div>

      <div v-if="isCurrentUser" class="my-auto flex justify-end">
        <!-- Single arrow up -->
        <SingleArrowUpButton
          v-on:click="$emit('movePart', item.part, -1, item.serial)"
        />
        <!-- Double arrow up -->
        <DoubleArrowUpButton
          v-if="item.quantity && item.quantity > 1"
          v-on:click="$emit('movePart', item.part, item.quantity ? item.quantity*-1 : -1, item.serial)"
        />
        <div v-else class="button-icon opacity-0"></div>
      </div>
      <div v-else class="flex justify-end">
        <!-- Single arrow down -->
        <SingleArrowDownButton
          v-on:click="$emit('movePart', item.part, -1, item.serial)"
        />
        <!-- Double arrow down -->
        <DoubleArrowDownButton
          v-if="item.quantity && item.quantity > 1"
          v-on:click="$emit('movePart', item.part, item.quantity ? item.quantity * -1 : -1, item.serial)"
        />
        <div v-else class="button-icon opacity-0"></div>
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
