<script setup lang="ts">
import { PartSchema } from "../plugins/interfaces";

interface Props {
  part: PartSchema;
  quantity: number;
  isCurrentUser: boolean;
}
const { part, quantity, isCurrentUser } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-2 text-center leading-10 md:grid-cols-6"
    >
      <p class="hidden md:block">{{ part.nxid }}</p>
      <p class="break-words">{{ part.manufacturer }}</p>
      <p class="break-words">{{ part.name }}</p>
      <p class="hidden break-words md:block">{{ part.shelf_location }}</p>
      <p class="break-words">{{ quantity }}</p>
      <div v-if="isCurrentUser" class="flex justify-end">
        <img
          class="button-icon"
          src="../assets/1arrowUp.png"
          v-on:click="$emit('movePart', part, 1)"
        />
        <img
          class="button-icon"
          src="../assets/2arrowsUp.png"
          v-on:click="$emit('movePart', part, quantity)"
        />
      </div>
      <div v-else class="flex justify-end">
        <img
          class="button-icon"
          src="../assets/1arrowDown.png"
          v-on:click="$emit('movePart', part, 1)"
        />
        <img
          class="button-icon"
          src="../assets/2arrowsDown.png"
          v-on:click="$emit('movePart', part, quantity)"
        />
      </div>
    </div>
    <div class="group-hover:bab-drop-hover bab-drop">
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
