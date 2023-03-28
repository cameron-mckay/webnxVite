<script setup lang="ts">
import { LoadedCartItem } from "../../plugins/interfaces";

interface Props {
  item: LoadedCartItem;
  hideButtons?: boolean;
}
const { item, hideButtons } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-8 md:grid-cols-5 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ item.part.nxid }}</p>
      <p class="break-words">{{ item.part.manufacturer }}</p>
      <p class="break-words">{{ item.part.name }}</p>
      <p class="break-words">{{ item.quantity }}</p>
      <div v-if="hideButtons != true" class="my-auto flex justify-end">
        <!-- Plus -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="$emit('plus')"
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
          class="button-icon hover:button-icon-hover active:button-icon-active no-margin-on-mobile"
          v-on:click="$emit('minus')"
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
    <div class="group-hover:bab-drop-hover bab-drop">
      <p class="block md:hidden">{{ `NXID: ${item.part.nxid}` }}</p>
      <p>{{ `Type: ${item.part.type}` }}</p>
      <div v-if="item.part.type == 'Motherboard'">
        <p>{{ `Chipset: ${item.part.chipset}` }}</p>
      </div>
      <div v-if="item.part.type == 'CPU'">
        <p>{{ `Chipset: ${item.part.chipset}` }}</p>
        <p>{{ `Frequency: ${item.part.frequency}GHz` }}</p>
      </div>
      <div v-if="item.part.type == 'Memory'">
        <p>{{ `Frequency: ${item.part.frequency}MHz` }}</p>
        <p>{{ `Capacity: ${item.part.capacity}GB` }}</p>
        <p>{{ `Mem Type: ${item.part.memory_type}` }}</p>
      </div>
      <div v-if="item.part.type == 'Peripheral Card'">
        <p>{{ `Card type: ${item.part.peripheral_type}` }}</p>
        <p>{{ `Port type: ${item.part.port_type}` }}</p>
      </div>
      <div v-if="item.part.type == 'Storage'">
        <p>{{ `Interface: ${item.part.storage_interface}` }}</p>
        <p>{{ `Capacity: ${item.part.capacity}${item.part.capacity_unit}` }}</p>
        <div v-if="item.part.storage_interface == 'NVME'">
          <p>{{ `Connector: ${item.part.port_type}` }}</p>
        </div>
      </div>
      <div v-if="item.part.type == 'GPU'">
        <!-- Placeholder -->
      </div>
      <div v-if="item.part.type == 'Cable'">
        <p>{{ `End 1: ${item.part.cable_end1}` }}</p>
        <p>{{ `End 2: ${item.part.cable_end2}` }}</p>
      </div>
      <div v-if="item.part.type == 'Backplane'">
        <p>{{ `Interface: ${item.part.storage_interface}` }}</p>
        <p>{{ `Ports: ${item.part.port_type}` }}</p>
      </div>
      <div v-if="item.part.type == 'Misc.'">
        <!-- Placeholder -->
      </div>
    </div>
  </div>
</template>
