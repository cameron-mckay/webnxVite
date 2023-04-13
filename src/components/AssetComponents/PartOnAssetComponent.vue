<script setup lang="ts">
import { PartSchema } from '../../plugins/interfaces';

interface Props {
  part: PartSchema;
}

const { part } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 rounded-lg p-1 text-center leading-8 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ part.nxid }}</p>
      <p class="break-words">{{ part.manufacturer }}</p>
      <p class="break-words">{{ part.name }}</p>
      <div class="my-auto flex justify-end">
        <!-- Plus -->
        <svg
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="$emit('addPartAction')"
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
      <p class="block md:hidden">{{ `NXID: ${part.nxid}` }}</p>
      <p>{{ `Type: ${part.type}` }}</p>
      <div v-if="part.type == 'Motherboard'">
        <p>{{ `Chipset: ${part.chipset}` }}</p>
        <p>{{ `Memory Generation: ${part.memory_gen}` }}</p>
      </div>
      <div v-if="part.type == 'CPU'">
        <p>{{ `Chipset: ${part.chipset}` }}</p>
        <p>{{ `Frequency: ${part.frequency}GHz` }}</p>
      </div>
      <div v-if="part.type == 'Memory'">
        <p>{{ `Frequency: ${part.frequency}MHz` }}</p>
        <p>{{ `Capacity: ${part.capacity}GB` }}</p>
        <p>{{ `Mem Type: ${part.memory_type}` }}</p>
        <p>{{ `Memory Generation: ${part.memory_gen}` }}</p>
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
