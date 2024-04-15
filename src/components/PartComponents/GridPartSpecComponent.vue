<script lang="ts" setup>
import { onMounted } from 'vue';
import { replaceLinksWithAnchors } from '../../plugins/CommonMethods';
import { PartSchema } from '../../plugins/interfaces';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
interface Props {
  part: PartSchema;
  serial?: string;
  quantity?: number;
  showPlus?: boolean;
  showHistory?: boolean;
  showAudit?: boolean;
}

let { part, serial, quantity, showPlus, showAudit } = defineProps<Props>();
let url = import.meta.env.VITE_API_URL;
onMounted(()=>{
  replaceLinksWithAnchors(document,  "notes-with-links")
})
</script>
<template>
  <div class="detail-table">
    <div class="detail-title">
      <div class="flex">
        <h1>
          {{ part.type!='Cable' ? part.manufacturer : '' }} {{ part.name }}
        </h1>
        <PlusButton v-if="showPlus" class="ml-4" @click="$emit('plus')"/>
      </div>
      <div 
        class="flex flex-wrap"
        v-if="showHistory"
      >
        <a
          class="cursor-pointer text-sm my-auto mt-4 mr-2 rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
          @click="$emit('loadAudit')"
        >
          Audit History
        </a>
        <a
          class="cursor-pointer text-sm my-auto mt-4 mr-2 rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
          @click="$emit('loadHistory')"
        >
          Add/Remove History
        </a>
        <a
          class="cursor-pointer text-sm my-auto mt-4 mr-2 rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
          @click="$emit('loadCheckouts')"
        >
          Check Out History
        </a>
        <a
          class="cursor-pointer text-sm my-auto mt-4 mr-2 rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
          @click="$emit('loadCheckins')"
        >
          Check In History
        </a>
        <a
          class="cursor-pointer text-sm my-auto mt-4 mr-2 rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
          @click="$emit('loadAssetUpdates')"
        >
          Asset Update History
        </a>
        <a
          class="cursor-pointer text-sm my-auto mt-4 mr-2 rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
          @click="$emit('loadNewAssets')"
        >
          New Asset History
        </a>
        <a
          class="cursor-pointer text-sm my-auto mt-4 mr-2 rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
          @click="$emit('loadPalletUpdates')"
        >
          Pallet Update History
        </a>
        <a
          class="cursor-pointer text-sm my-auto mt-4 mr-2 rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
          @click="$emit('loadNewPallets')"
        >
          New Pallet History
        </a>
        <a
          class="cursor-pointer text-sm my-auto mt-4 mr-2 rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
          @click="$emit('loadAllTechs')"
        >
          All Techs History
        </a>
      </div>
    </div>
    <p class="detail-label">NXID:</p>
    <p class="detail-data">{{ part.nxid }}</p>
    <p v-if="part.rack_num" class="detail-label">Rack Number:</p>
    <p v-if="part.rack_num" class="detail-data">{{ part.rack_num }}</p>
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

    <p class="detail-label" v-if="part.audited&&showAudit">Last Audited:</p>
    <p class="detail-data" v-if="part.audited&&showAudit">{{new Date(Date.parse(part.audited!)).toLocaleString()}}</p>

    <p class="detail-label">Type:</p>
    <p class="detail-data">{{ part.type }}</p>
    <p class="detail-label" v-if="part.serialized && serial">Serial:</p>
    <p class="detail-data" v-if="part.serialized && serial">
      {{ serial }}
    </p>
    <div class="detail-row" v-if="part.type == 'Motherboard'">
      <p v-if="part.chipset">Chipset:</p>
      <p v-if="part.chipset">{{ part.chipset }}</p>
      <p v-if="part.socket&&part.socket.length>0">Socket:</p>
      <p v-if="part.socket&&part.socket.length>0">{{ Array.isArray(part.socket)?(part.socket as string[]).join(', '):part.socket }}</p>
      <p v-if="part.memory_gen">Memory Generation:</p>
      <p v-if="part.memory_gen">{{ part.memory_gen }}</p>
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
    <div class="md:col-span-4 my-4" v-if="part.notes">
      <h1 class="col-span-2 mb-4 text-4xl">Notes:</h1>
      <pre class="whitespace-pre-wrap notes-with-links">{{ part.notes }}</pre>
    </div>
    <div class="detail-image-container">
      <img :src="`${url}/images/parts/${part.nxid}`" />
    </div>
  </div>
</template>
