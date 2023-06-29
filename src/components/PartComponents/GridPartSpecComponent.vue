<script lang="ts" setup>
import { PartSchema } from '../../plugins/interfaces';

interface Props {
  part: PartSchema;
  serial?: string;
  quantity?: number;
}

let { part, serial, quantity } = defineProps<Props>();
let url = import.meta.env.VITE_API_URL;
</script>
<template>
  <div class="detail-table">
    <h1 class="detail-title">
      {{ part.type!='Cable' ? part.manufacturer : '' }} {{ part.name }}
    </h1>
    <p class="detail-label">NXID:</p>
    <p class="detail-data">{{ part.nxid }}</p>
    <p class="detail-label">Rack Number:</p>
    <p class="detail-data">{{ part.rack_num }}</p>
    <p class="detail-label">Shelf Location:</p>
    <p class="detail-data">{{ part.shelf_location }}</p>
    <div class="detail-row" v-if="part.quantity">
      <p class="detail-label">Parts Room Quantity:</p>
      <p class="detail-data">{{ part.quantity }}</p>
    </div>
    <div class="detail-row" v-if="part.total_quantity">
      <p class="detail-label">Total Quantity:</p>
      <p class="detail-data">{{ part.total_quantity }}</p>
    </div>
    <p class="detail-label" v-if="part.audited">Last Audited:</p>
    <p class="detail-data" v-if="part.audited">{{new Date(Date.parse(part.audited!)).toLocaleString()}}</p>
    <p class="detail-label">Type:</p>
    <p class="detail-data">{{ part.type }}</p>
    <p class="detail-label" v-if="part.serialized && serial">Serial:</p>
    <p class="detail-data" v-if="part.serialized && serial">
      {{ serial }}
    </p>
    <div class="detail-row" v-if="part.type == 'Motherboard'">
      <p v-if="part.chipset">Chipset:</p>
      <p v-if="part.chipset">{{ part.chipset }}</p>
      <p>Socket:</p>
      <p>{{ Array.isArray(part.socket)?(part.socket as string[]).join(', '):part.socket }}</p>
      <p>Memory Generation:</p>
      <p>{{ part.memory_gen }}</p>
    </div>
    <div v-if="part.type == 'CPU'" class="detail-row">
      <p>Socket:</p>
      <p>{{ Array.isArray(part.socket)?(part.socket as string[]).join(', '):part.socket }}</p>
    </div>
    <div v-if="part.type == 'Memory'" class="detail-row">
      <p>Frequency:</p>
      <p>{{ part.frequency + 'MHz' }}</p>
      <p>Capacity:</p>
      <p>{{ part.capacity + 'GB' }}</p>
      <p>Memory Type:</p>
      <p>{{ part.memory_type }}</p>
      <p>Memory Generation:</p>
      <p>{{ part.memory_gen }}</p>
      <p>Rank:</p>
      <p>{{ part.mem_rank }}</p>
    </div>
    <div v-if="part.type == 'Peripheral Card'" class="detail-row">
      <p>Mainboard Connector:</p>
      <p>{{ part.mainboard_con }}</p>
      <p>Card Type:</p>
      <p>{{ part.peripheral_type }}</p>
      <p v-if="part.port_type">Port Type:</p>
      <p v-if="part.port_type">{{ Array.isArray(part.port_type)?(part.port_type as string[]).join(', '):part.port_type }}</p>
    </div>
    <div v-if="part.type == 'Storage'" class="detail-row">
      <p v-if="part.size">Form Factor:</p>
      <p v-if="part.size">{{ part.size }}</p>
      <p v-if="part.storage_type">Storage Type:</p>
      <p v-if="part.storage_type">{{ part.storage_type }}</p>
      <p>Interface:</p>
      <p>{{ part.storage_interface }}</p>
      <p>Capacity:</p>
      <p>
        {{ `${part.capacity}${part.capacity_unit}` }}
      </p>
      <div v-if="part.storage_interface == 'NVME'" class="detail-row">
        <p>Connector:</p>
        <p>{{ Array.isArray(part.port_type)?(part.port_type as string[]).join(', '):part.port_type }}</p>
      </div>
    </div>
    <div v-if="part.type == 'Cable'" class="detail-row">
      <p>End 1:</p>
      <p>{{ part.cable_end1 }}</p>
      <p>End 2:</p>
      <p>{{ part.cable_end2 }}</p>
    </div>
    <div v-if="part.type == 'Backplane'" class="detail-row">
      <p>Num Slots:</p>
      <p>{{ part.num_ports }}</p>
      <p>Ports:</p>
      <p>{{ Array.isArray(part.port_type)?(part.port_type as string[]).join(', '):part.port_type }}</p>
    </div>
    <div v-if="part.type == 'Heatsink'" class="detail-row">
      <p>Socket:</p>
      <p>{{ Array.isArray(part.socket) ? part.socket.join(", ") : part.socket }}</p>
      <p>Size:</p>
      <p>{{ part.size }}</p>
      <p>Active:</p>
      <p v-if="part.active">Yes</p>
      <p v-else>No</p>
    </div>
    <div v-if="part.type == 'Misc.'">
      <!-- Placeholder -->
    </div>
    <p v-if="part.consumable">Consumable:</p>
    <p v-if="part.consumable">{{ part.consumable?"Yes":"No" }}</p>

    <div class="detail-image-container">
      <img :src="`${url}/images/parts/${part.nxid}`" />
    </div>
  </div>
</template>
