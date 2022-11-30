<script setup lang="ts">
import { PartSchema } from '../plugins/interfaces'
import { onMounted, ref } from 'vue'

interface Props {
    part: PartSchema,
    quantity: number
}
const { part, quantity } = defineProps<Props>()

onMounted(() => {
    console.log(part)
})

const emit = defineEmits(['plus', 'minus', 'delete'])

let item_quantity = ref(quantity)


function plus(){
    if(item_quantity.value < part.quantity!)
    {
        item_quantity.value = item_quantity.value + 1 
    }
    emit('plus')
}

function minus(){
    item_quantity.value -= 1
    emit('minus')
}

</script>

<template>
    <div class="group">
        <div
            class="grid md:grid-cols-6 grid-cols-5 relative leading-10 text-center group-hover:bg-zinc-400 p-2 rounded-xl group-hover:rounded-bl-none group-hover:shadow-lg">
            <p class="md:block hidden">{{ part.nxid }}</p>
            <p>{{ part.manufacturer }}</p>
            <p>{{ part.name }}</p>
            <p>{{ part.shelf_location }}</p>
            <p>{{ `${item_quantity}/${part.quantity}` }}</p>
            <div class="flex justify-center">
                <img class="h-10 w-10 p-2 bg-zinc-400 hover:bg-zinc-500 active:bg-zinc-600 rounded-lg shadow-lg transition" src="../assets/plus-solid.svg"
                    v-on:click="plus">
                <img class="h-10 w-10 p-2 bg-zinc-400 hover:bg-zinc-500 active:bg-zinc-600 rounded-lg shadow-lg transition" src="../assets/minus-solid.svg"
                v-on:click="minus">
                <img class="h-10 w-10 p-2 bg-zinc-400 hover:bg-red-500 active:bg-red-600 rounded-lg shadow-lg transition" src="../assets/x-solid.svg"
                    v-on:click="$emit('delete')">
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
