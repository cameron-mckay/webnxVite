<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { PartSchema, SNAvailable } from '../../plugins/interfaces';

interface Props {
  part?: PartSchema;
  serials?: SNAvailable[];
  init_serial?: string;
  index: number;
}
const { part, serials, init_serial, index } = defineProps<Props>();

let serial = ref('');
const emit = defineEmits(['update', 'add', 'delete']);
onMounted(() => {
  serial.value = init_serial ? init_serial : '';
  watch(serial, updateSerial);
});

function updateSerial(new_sn: string, old_sn: string) {
  emit('update', new_sn, old_sn, index);
}

function plus() {
  emit('add', index);
}

function remove() {
  serial.value = '';
  emit('delete', index);
}
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-10 md:grid-cols-6 md:p-2"
    >
      <p class="hidden md:block">{{ part ? part.nxid : '' }}</p>
      <p class="break-words">{{ part ? part.manufacturer : '' }}</p>
      <p class="break-words">{{ part ? part.name : '' }}</p>
      <p class="hidden break-words md:block">
        {{ part ? part.shelf_location : '' }}
      </p>
      <select required v-model="serial">
        <option :value="''" disabled>Select one</option>
        <option
          v-for="sn of serials"
          :value="sn.serial"
          :disabled="!sn.available && sn.serial != serial"
          :selected="sn.serial == serial"
        >
          {{ sn.serial }}
        </option>
      </select>
      <div class="my-auto flex justify-end">
        <!-- Plus -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="plus"
        >
          <path
            stroke="currentColor"
            fill="currentColor"
            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
          />
        </svg>
        <!-- Minus -->
        <!-- X icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="remove"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
          />
        </svg>
      </div>
    </div>
    <div class="group-hover:bab-drop-hover bab-drop relative">
      <p class="block md:hidden">{{ `NXID: ${part ? part.nxid : ''}` }}</p>
      <p class="block md:hidden">
        {{ `Shelf Location: ${part ? part.shelf_location : ''}` }}
      </p>
      <p>{{ `Type: ${part ? part.type : ''}` }}</p>
      <div v-if="part && part.type == 'Motherboard'">
        <p>{{ `Chipset: ${part ? part.chipset : ''}` }}</p>
      </div>
      <div v-if="part && part.type == 'CPU'">
        <p>{{ `Chipset: ${part ? part.chipset : ''}` }}</p>
        <p>{{ `Frequency: ${part ? part.frequency : ''}GHz` }}</p>
      </div>
      <div v-if="part && part.type == 'Memory'">
        <p>{{ `Frequency: ${part ? part.frequency : ''}MHz` }}</p>
        <p>{{ `Capacity: ${part ? part.capacity : ''}GB` }}</p>
        <p>{{ `Mem Type: ${part ? part.memory_type : ''}` }}</p>
      </div>
      <div v-if="part && part.type == 'Peripheral Card'">
        <p>{{ `Card type: ${part ? part.peripheral_type : ''}` }}</p>
        <p>{{ `Port type: ${part ? part.port_type : ''}` }}</p>
      </div>
      <div v-if="part && part.type == 'Storage'">
        <p>{{ `Interface: ${part ? part.storage_interface : ''}` }}</p>
        <p>
          {{
            `Capacity: ${part ? part.capacity : ''}${
              part ? part.capacity_unit : ''
            }`
          }}
        </p>
        <div v-if="part && part.storage_interface == 'NVME'">
          <p>{{ `Connector: ${part ? part.port_type : ''}` }}</p>
        </div>
      </div>
      <div v-if="part && part.type == 'GPU'">
        <!-- Placeholder -->
      </div>
      <div v-if="part && part.type == 'Cable'">
        <p>{{ `End 1: ${part ? part.cable_end1 : ''}` }}</p>
        <p>{{ `End 2: ${part ? part.cable_end2 : ''}` }}</p>
      </div>
      <div v-if="part && part.type == 'Backplane'">
        <p>{{ `Interface: ${part ? part.storage_interface : ''}` }}</p>
        <p>{{ `Ports: ${part ? part.port_type : ''}` }}</p>
      </div>
      <div v-if="part && part.type == 'Misc.'">
        <!-- Placeholder -->
      </div>
    </div>
  </div>
</template>
