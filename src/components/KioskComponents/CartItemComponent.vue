<script setup lang="ts">
import { ref } from 'vue';
import { LoadedCartItem } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';

interface Props {
  item: LoadedCartItem;
  serialize?: boolean;
  hideButtons?: boolean;
}
const { item, serialize, hideButtons } = defineProps<Props>();
const emit = defineEmits(['plus', 'minus', 'delete', 'updateQuantity', 'dupeSerialized', 'updateSerial']);

let item_quantity = ref(item.quantity?item.quantity:0);
let serial = ref(item.serial?item.serial:"")

function plus() {
  if(serialize&&item.part.serialized){
    return emit('dupeSerialized')
  }
  if (item_quantity.value < item.part.quantity!) {
    item_quantity.value = item_quantity.value + 1;
  }
  emit('plus');
}

function minus() {
  item_quantity.value -= 1;
  emit('minus');
}

function updateQuantity() {
  if(item.part.quantity&&item_quantity.value>item.part.quantity)
    item_quantity.value = item.part.quantity
  emit("updateQuantity", item_quantity.value, item.part.nxid!)
}

function updateSerial() {
  item.serial = serial.value
  emit("updateSerial", serial.value)
}
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-10 md:grid-cols-6 md:p-2"
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
      <p class="break-words" v-if="hideButtons&&item.serial">
        {{ item.serial }}
      </p>
      <p class="break-words" v-else-if="hideButtons">{{ item.quantity }}</p>
      <input
        class="textbox pl-2 "
        v-else-if="serialize&&item.part.serialized"
        v-model="serial"
        type="text"
        placeholder="Serial"
        v-on:focusout="updateSerial"
      />
      <div class="flex justify-center" v-else>
        <input
          class="textbox pl-2 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right"
          required
          v-model="item_quantity"
          type="number"
          min="0"
          :max="item.part.quantity"
          step="1"
          v-on:focusout="updateQuantity()"
        />
        <p class="break-words">/ {{ item.part.quantity }}</p>
      </div>
      <div v-if="hideButtons"></div>
      <div v-else class="my-auto flex justify-end">
        <!-- Plus -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="plus"
        >
          <path
            stroke="currentColor"
            fill="currentColor"
            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
          />
        </svg>
        <!-- Minus -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          v-if="!serialize||(!(item.part.serialized || item.serial))"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="minus"
        >
          <path
            stroke="currentColor"
            fill="currentColor"
            d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
          />
        </svg>
        <!-- X icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="$emit('delete')"
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
