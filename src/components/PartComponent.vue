<script setup lang="ts">
import { PartSchema } from "../plugins/interfaces";

interface Props {
  part: PartSchema;
  edit?: boolean;
  add?: boolean;
  view?: boolean;
}

const { part } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="grid grid-cols-4 rounded-md border-2 border-gray-500 p-2 text-center leading-10 group-hover:rounded-bl-none group-hover:bg-zinc-400 md:grid-cols-6"
    >
      <p class="hidden md:block">{{ part.nxid }}</p>
      <p class="break-words">{{ part.manufacturer }}</p>
      <p class="break-words">{{ part.name }}</p>
      <p class="hidden break-words md:block">{{ part.shelf_location }}</p>
      <p>{{ part.quantity + "/" + part.total_quantity }}</p>
      <div class="flex justify-center">
        <img
          v-if="edit === true"
          class="m-1 h-8 w-8 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500 md:h-10 md:w-10"
          src="../assets/pencil-solid.svg"
          v-on:click="$emit('editPartAction')"
        />
        <img
          v-if="add === true"
          class="m-1 h-8 w-8 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500 md:h-10 md:w-10"
          src="../assets/plus-solid.svg"
          v-on:click="$emit('addPartAction')"
        />
        <img
          v-if="view === true"
          class="m-1 h-8 w-8 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500 md:h-10 md:w-10"
          src="../assets/eye-solid.svg"
          v-on:click="$emit('viewPartAction')"
        />
      </div>
    </div>
    <div
      class="absolute z-30 hidden h-0 rounded-b-md border-x-2 border-b-2 border-gray-500 p-2 group-hover:block group-hover:h-auto group-hover:bg-zinc-400 group-hover:shadow-lg"
    >
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
