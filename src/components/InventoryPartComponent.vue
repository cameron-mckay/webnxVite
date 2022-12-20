<script setup lang="ts">
import { PartSchema } from '../plugins/interfaces';
import TooltipComponent from './TooltipComponent.vue';

interface Props {
    part: PartSchema,
    quantity: number,
    isCurrentUser: boolean
}
const { part, quantity, isCurrentUser } = defineProps<Props>()

console.log(part)
</script>

<template>
    <div>
        <div
            class="grid md:grid-cols-6 grid-cols-5 relative leading-10 text-center group-hover:bg-zinc-400 p-2 rounded-xl group-hover:rounded-bl-none group-hover:shadow-lg">
            <p class="md:block hidden">{{ part.nxid }}</p>
            <p>{{ part.manufacturer }}</p>
            <p>{{ part.name }}</p>
            <p>{{ part.shelf_location }}</p>
            <p>{{ quantity }}</p>
            <div v-if="isCurrentUser" class="flex justify-center">
                <TooltipComponent class="w-12 h-12" :text="'Move one'">
                    <img class="h-10 w-10 p-2 bg-zinc-400 hover:bg-zinc-500 active:bg-zinc-600 rounded-lg shadow-lg transition"
                        src="../assets/1arrowUp.png" v-on:click="$emit('movePart', part, 1)">
                </TooltipComponent>
                <TooltipComponent class="w-12 h-12" :text="'Move all'">
                    <img class="h-10 w-10 p-2 bg-zinc-400 hover:bg-zinc-500 active:bg-zinc-600 rounded-lg shadow-lg transition"
                        src="../assets/2arrowsUp.png" v-on:click="$emit('movePart', part, quantity)">
                </TooltipComponent>
            </div>
            <div v-else class="flex justify-center">
                <TooltipComponent class="w-12 h-12" :text="'Move one'">
                    <img class="h-10 w-10 p-2 bg-zinc-400 hover:bg-zinc-500 active:bg-zinc-600 rounded-lg shadow-lg transition"
                        src="../assets/1arrowDown.png" v-on:click="$emit('movePart', part, 1)">
                </TooltipComponent>
                <TooltipComponent class="w-12 h-12" :text="'Move all'">
                    <img class="h-10 w-10 p-2 bg-zinc-400 hover:bg-zinc-500 active:bg-zinc-600 rounded-lg shadow-lg transition"
                        src="../assets/2arrowsDown.png" v-on:click="$emit('movePart', part, quantity)">
                </TooltipComponent>
            </div>
        </div>
        <div
            class="hidden h-0 absolute group-hover:h-auto group-hover:block rounded-b-xl group-hover:bg-zinc-400 p-2 z-30 group-hover:shadow-lg">
            <p class="md:hidden block">{{ `NXID: ${part.nxid}` }}</p>
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
