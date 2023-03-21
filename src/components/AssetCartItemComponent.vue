<script setup lang="ts">
import { LoadedCartItem } from "../plugins/interfaces";

interface Props {
  item: LoadedCartItem;
  hideButtons?: boolean;
}
const { item, hideButtons } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-5 p-2 text-center leading-10"
    >
      <p>{{ item.part.nxid }}</p>
      <p class="break-words">{{ item.part.manufacturer }}</p>
      <p class="break-words">{{ item.part.name }}</p>
      <p class="break-words">{{ item.quantity }}</p>
      <div v-if="hideButtons != true" class="flex justify-end">
        <img
          class="button-icon"
          src="../assets/plus-solid.svg"
          v-on:click="$emit('plus')"
        />
        <img
          class="button-icon"
          src="../assets/minus-solid.svg"
          v-on:click="$emit('minus')"
        />
        <img
          class="button-icon"
          src="../assets/x-solid.svg"
          v-on:click="$emit('delete')"
        />
      </div>
    </div>
    <div class="group-hover:bab-drop-hover hidden">
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
