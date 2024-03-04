<script setup lang="ts">
import { ref } from 'vue';
import { LoadedCartItem } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
import MinusButton from '../GenericComponents/Buttons/MinusButton.vue';
import XButton from '../GenericComponents/Buttons/XButton.vue';

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
        <PlusButton
          v-on:click="plus"
        />
        <!-- Minus -->
        <MinusButton
          v-if="!serialize||(!(item.part.serialized || item.serial))"
          v-on:click="minus"
        />
        <!-- X icon -->
        <XButton
          v-on:click="$emit('delete')"
        />
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
