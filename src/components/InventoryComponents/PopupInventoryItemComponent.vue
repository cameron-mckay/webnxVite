<script setup lang="ts">
import { LoadedCartItem } from '../../plugins/interfaces';

interface Props {
  item: LoadedCartItem;
}
const { item } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-8 md:grid-cols-5 md:p-2 md:leading-10"
    >
      <p class="hidden break-words md:block">{{ item.part.nxid }}</p>
      <p class="break-words">{{ item.part.manufacturer }}</p>
      <p class="break-words">{{ item.part.name }}</p>
      <p class="break-words">{{ item.quantity }}</p>
      <div class="flex justify-end">
        <!-- Plus -->
        <svg
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="$emit('plus')"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
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
