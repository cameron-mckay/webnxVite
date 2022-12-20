<script setup lang="ts">
import { LoadedCartItem } from '../plugins/interfaces';

interface Props {
    item: LoadedCartItem
}
const { item } = defineProps<Props>()
</script>

<template>
    <div class="group">
        <div
            class="grid grid-cols-5 relative leading-10 text-center group-hover:bg-zinc-400 p-2 rounded-xl group-hover:rounded-bl-none group-hover:shadow-lg">
            <p>{{ item.part.nxid }}</p>
            <p>{{ item.part.manufacturer }}</p>
            <p>{{ item.part.name }}</p>
            <p>{{ item.quantity }}</p>
            <div class="flex justify-center">
                <img class="h-10 w-10 p-2 m-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                    src="../assets/plus-solid.svg" v-on:click="$emit('plus')">
                <img class="h-10 w-10 p-2 m-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                    src="../assets/minus-solid.svg" v-on:click="$emit('minus')">
                <img class="h-10 w-10 p-2 m-1 bg-zinc-400 shadow-lg rounded-lg transition hover:bg-red-500 active:bg-red-600"
                    src="../assets/x-solid.svg" v-on:click="$emit('delete')">
            </div>
        </div>
        <div
            class="hidden h-0 absolute group-hover:h-auto group-hover:block rounded-b-xl group-hover:bg-zinc-400 p-2 z-30 group-hover:shadow-lg">
            <p class="md:hidden block">{{ `NXID: ${item.part.nxid}` }}</p>
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
