<script setup lang="ts">
import { ref } from 'vue';
import { PartSchema } from '../../plugins/interfaces';

interface Props {
  part: PartSchema;
  quantity: number;
}
const { part, quantity } = defineProps<Props>();
const emit = defineEmits(['plus', 'minus', 'delete']);

let item_quantity = ref(quantity);

function plus() {
  if (item_quantity.value < part.quantity!) {
    item_quantity.value = item_quantity.value + 1;
  }
  emit('plus');
}

function minus() {
  item_quantity.value -= 1;
  emit('minus');
}
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-10 md:grid-cols-6 md:p-2"
    >
      <p class="hidden md:block">{{ part.nxid }}</p>
      <p class="break-words">{{ part.manufacturer }}</p>
      <p class="break-words">{{ part.name }}</p>
      <p class="hidden break-words md:block">{{ part.shelf_location }}</p>
      <p class="break-words">{{ `${item_quantity}/${part.quantity}` }}</p>
      <div class="my-auto flex justify-end">
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
    <div class="group-hover:bab-drop-hover bab-drop relative">
      <p class="block md:hidden">{{ `NXID: ${part.nxid}` }}</p>
      <p class="block md:hidden">
        {{ `Shelf Location: ${part.shelf_location}` }}
      </p>
      <p>{{ `Type: ${part.type}` }}</p>
      <div v-if="part.type == 'Motherboard'">
        <p>{{ `Chipset: ${part.chipset}` }}</p>
      </div>
      <div v-if="part.type == 'CPU'">
        <p>{{ `Chipset: ${part.chipset}` }}</p>
        <p>{{ `Frequency: ${part.frequency}GHz` }}</p>
      </div>
      <div v-if="part.type == 'Memory'">
        <p>{{ `Frequency: ${part.frequency}MHz` }}</p>
        <p>{{ `Capacity: ${part.capacity}GB` }}</p>
        <p>{{ `Mem Type: ${part.memory_type}` }}</p>
      </div>
      <div v-if="part.type == 'Peripheral Card'">
        <p>{{ `Card type: ${part.peripheral_type}` }}</p>
        <p>{{ `Port type: ${part.port_type}` }}</p>
      </div>
      <div v-if="part.type == 'Storage'">
        <p>{{ `Interface: ${part.storage_interface}` }}</p>
        <p>{{ `Capacity: ${part.capacity}${part.capacity_unit}` }}</p>
        <div v-if="part.storage_interface == 'NVME'">
          <p>{{ `Connector: ${part.port_type}` }}</p>
        </div>
      </div>
      <div v-if="part.type == 'GPU'">
        <!-- Placeholder -->
      </div>
      <div v-if="part.type == 'Cable'">
        <p>{{ `End 1: ${part.cable_end1}` }}</p>
        <p>{{ `End 2: ${part.cable_end2}` }}</p>
      </div>
      <div v-if="part.type == 'Backplane'">
        <p>{{ `Interface: ${part.storage_interface}` }}</p>
        <p>{{ `Ports: ${part.port_type}` }}</p>
      </div>
      <div v-if="part.type == 'Misc.'">
        <!-- Placeholder -->
      </div>
    </div>
  </div>
</template>
