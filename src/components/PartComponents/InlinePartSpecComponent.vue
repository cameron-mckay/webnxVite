<script lang="ts" setup>
import { PartSchema } from '../../plugins/interfaces';
interface Props {
  part: PartSchema;
}
let { part } = defineProps<Props>();
</script>
<template>
  <div class="group-hover:bab-drop-hover bab-drop">
    <p class="block md:hidden">{{ `NXID: ${part.nxid}` }}</p>
    <p class="block md:hidden">
      {{ `Rack Number: ${part.rack_num}` }}
    </p>
    <p class="block md:hidden">
      {{ `Shelf Location: ${part.shelf_location}` }}
    </p>
    <p>{{ `Type: ${part.type}` }}</p>
    <div v-if="part.type == 'Motherboard'">
      <p>{{ `Socket: ${part.socket}` }}</p>
      <p v-if="part.chipset">{{ `Chipset: ${part.chipset}` }}</p>
      <p>{{ `Memory Generation: ${part.memory_gen}` }}</p>
    </div>
    <div v-if="part.type == 'CPU'">
      <p>{{ `Socket: ${part.socket}` }}</p>
    </div>
    <div v-if="part.type == 'Memory'">
      <p>{{ `Frequency: ${part.frequency}MHz` }}</p>
      <p>{{ `Capacity: ${part.capacity}GB` }}</p>
      <p>{{ `Mem Type: ${part.memory_type}` }}</p>
      <p>{{ `Memory Generation: ${part.memory_gen}` }}</p>
      <p v-if="part.mem_rank">{{ `Rank: ${part.mem_rank}` }}</p>
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
    <div v-if="part.type == 'Heatsink'">
      <!-- Placeholder -->
      <p>{{ `Socket: ${part.socket}` }}</p>
      <p>{{ `Size: ${part.size}` }}</p>
      <p v-if="part.active">Active: Yes</p>
      <p v-else>Active: No</p>
    </div>
    <div v-if="part.type == 'Optic'">
      <p>{{ `Optic Type: ${part.cable_end1}` }}</p>
    </div>
    <div v-if="part.type == 'Misc.'">
      <!-- Placeholder -->
    </div>
  </div>
</template>
