<script setup lang="ts">
import { LoadedCartItem } from '../../plugins/interfaces';

interface Props {
  item: LoadedCartItem;
  plus?: boolean;
  minus?: boolean;
}

const { item } = defineProps<Props>();
</script>

<template>
  <div class="group relative col-span-4 my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-3 rounded-lg p-1 text-center leading-8 md:grid-cols-4 md:p-2 md:leading-10"
    >
      <div class="hidden md:flex">
        <!-- Plus -->
        <svg
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-if="plus"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
          />
        </svg>
        <!-- Minus -->
        <svg
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-red-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-else-if="minus"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
          />
        </svg>
        <svg
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        ></svg>
        <p>{{ item.part.nxid }}</p>
      </div>
      <div class="flex justify-start md:justify-center">
        <svg
          class="mx-0.5 my-auto block h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:hidden md:h-10 md:w-10"
          v-if="plus"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
          />
        </svg>
        <!-- Minus -->
        <svg
          class="mx-0.5 my-auto block h-8 w-8 shrink-0 p-2 text-red-500 shadow-none md:mx-1 md:hidden md:h-10 md:w-10"
          v-else-if="minus"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
          />
        </svg>
        <svg
          class="mx-0.5 my-auto block h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:hidden md:h-10 md:w-10"
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        ></svg>
        <p class="break-words">{{ item.part.manufacturer }}</p>
      </div>
      <p class="break-words">{{ item.part.name }}</p>
      <p v-if="item.serial" class="break-words">{{ item.serial }}</p>
      <p v-else class="break-words">{{ item.quantity }}</p>
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
