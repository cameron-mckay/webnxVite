<script setup lang="ts">
// Get http and store from props
import type { PartSchema } from '../plugins/interfaces';
import { ref, watch, Ref, onBeforeUnmount } from 'vue';

// Props interface
interface Props {
    title: string,
    submitText: string,
    strict: boolean,
    oldPart?: PartSchema,
}

const { title, submitText, strict, oldPart } = defineProps<Props>()
// END OF PROPS
let part:Ref<PartSchema> = ref(JSON.parse(JSON.stringify(oldPart)) as PartSchema)
let partCopy = JSON.parse(JSON.stringify(oldPart))
let firstLoad = false

// Clear out fields when part type is changed
watch(() => part.value.type, () => {
    if(!firstLoad) {
        delete part.value.frequency
        delete part.value.chipset
        delete part.value.memory_type
        delete part.value.peripheral_type
        delete part.value.storage_interface
        delete part.value.capacity
        delete part.value.capacity_unit
        delete part.value.num_ports
        delete part.value.port_type
        delete part.value.cable_end1
        delete part.value.cable_end2
    }else {
        firstLoad = false
    }
})

// Clear out connector type when storage interface is changed
watch(() => part.value.storage_interface, () => {
    if(part.value.storage_interface != 'NVME') {
        delete part.value.port_type
    }
})

// Reset form
function resetForm() {
    part.value = JSON.parse(JSON.stringify(partCopy))
}
</script>

<template>
    <div class="body">
        <h1 class="text-4xl mb-4">{{ title }}</h1>
        <form id="form" @submit.prevent="$emit('partSubmit',part)" @reset.prevent="resetForm" class="grid grid-cols-2">
            <label>NXID: </label>
            <input :required="strict" v-model="part.nxid" type="text" placeholder="NXID">
            <label>Manufacturer: </label>
            <input :required="strict" v-model="part.manufacturer" type="text" placeholder="Manufacturer">
            <label>Part Name: </label>
            <input :required="strict" v-model="part.name" type="text" placeholder="Part Name">
            <label v-if="(strict&&!oldPart)">Quantity: </label>
            <input :required="strict" v-if="(strict&&!oldPart)" v-model="part.quantity" type="number" placeholder="Quantity">
            <label>Shelf Location: </label>
            <input :required="strict" v-model="part.shelf_location" type="text" placeholder="Shelf Location">
            <label>Part Type: </label>
            <select :required="strict" v-model="part.type">
                <option disabled value="">Part type</option>
                <option>Motherboard</option>
                <option>CPU</option>
                <option>Memory</option>
                <option>Storage</option>
                <option>Peripheral Card</option>
                <option>GPU</option>
                <option>Cable</option>
                <option>Backplane</option>
                <option>Misc.</option>
            </select>


            <div v-if="part.type == 'Motherboard'" class="col-span-2 grid grid-cols-2">
                <label class="col-span-1">Chipset: </label>
                <input class="col-span-1" :required="strict" v-model="part.chipset" type="text" placeholder="Chipset">
            </div>


            <div v-if="part.type == 'CPU'" class="col-span-2 grid grid-cols-2">
                <label>Chipset: </label>
                <input :required="strict" v-model="part.chipset" type="text" placeholder="Chipset">
                <label>Frequency(GHz): </label>
                <input :required="strict" v-model="part.frequency" type="number" placeholder="Frequency">
            </div>
            <div v-if="part.type == 'Memory'" class="col-span-2 grid grid-cols-2">
                <label>Frequency(MHz): </label>
                <input :required="strict" v-model="part.frequency" type="number" placeholder="Frequency">
                <label>Capacity(GB): </label>
                <input :required="strict" v-model="part.capacity" type="number" placeholder="Capacity">
                <label>Type: </label>
                <select v-model="part.memory_type">
                    <option disabled value="">Memory type</option>
                    <option>UDIMM</option>
                    <option>ECC</option>
                    <option>REG</option>
                </select>
            </div>
            <div v-if="part.type == 'Peripheral Card'" class="col-span-2 grid grid-cols-2">
                <label>Card type: </label>
                <select :required="strict" v-model="part.peripheral_type">
                    <option disabled value="">Card type</option>
                    <option>RAID</option>
                    <option>JBOD</option>
                    <option>NIC</option>
                    <option>Adapter</option>
                </select>
                <label>Port Type: </label>
                <select :required="strict" v-model="part.port_type">
                    <optgroup v-if="part.peripheral_type == 'NIC'">
                        <option disabled value="">Port type</option>
                        <option>SFP</option>
                        <option>RJ45</option>
                    </optgroup>
                    <optgroup v-else>
                        <option disabled value="">Port type</option>
                        <option>SAS</option>
                        <option>Mini SAS HD</option>
                    </optgroup>
                </select>
            </div>
            <div v-if="part.type == 'Storage'" class="col-span-2 grid grid-cols-2">
                <label>Storage interface: </label>
                <select :required="strict" v-model="part.storage_interface">
                    <option disabled value="">Pick one</option>
                    <option>SATA</option>
                    <option>SAS</option>
                    <option>NVME</option>
                </select>
                <label>Capacity: </label>
                <div class="flex justify-between">
                    <input :required="strict" v-model="part.capacity" type="number">
                    <select :required="strict" v-model="part.capacity_unit">
                        <option disabled value="">Pick one</option>
                        <option>GB</option>
                        <option>TB</option>
                    </select>
                </div>
                <div v-if="part.storage_interface == 'NVME'">
                    <label>Connector Type: </label>
                    <select :required="strict" v-model="part.port_type">
                        <option disabled value="">Pick one</option>
                        <option>SAS</option>
                        <option>M.2</option>
                    </select>
                </div>
            </div>
            <div v-if="part.type == 'GPU'" class="col-span-2 grid grid-cols-2">
                <!--   -->
            </div>
            <div v-if="part.type == 'Cable'" class="col-span-2 grid grid-cols-2">
                <label>Cable end 1: </label>
                <input :required="strict" v-model="part.cable_end1" type="text">
                <label>Cable end 2: </label>
                <input :required="strict" v-model="part.cable_end2" type="text">
            </div>
            <div v-if="part.type == 'Backplane'" class="col-span-2 grid grid-cols-2">
                <label>Storage interface: </label>
                <select :required="strict" v-model="part.storage_interface">
                    <option selected>SATA</option>
                    <option>SAS</option>
                    <option>NVME</option>
                </select>
                <label>Ports: </label>
                <select :required="strict" v-model="part.port_type">
                    <option selected>SATA</option>
                    <option>SAS</option>
                    <option>Mini SAS HD</option>
                </select>
            </div>
            <div v-if="part.type == 'Misc.'">
                <!-- Placeholder -->
            </div>
            <input class="col-span-2 submit bg-red-500 hover:bg-red-600 active:bg-red-700" type="reset" value="Reset">
            <input class="col-span-2 submit" type="submit" :value="submitText">
        </form>
    </div>
</template>