<script setup lang="ts">
// Get http and store from props
import { PartSchema } from '../model/part';
import { createPart } from '../plugins/dbCommands';
import { ref, Ref, watch } from 'vue';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/store';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

var part: Ref<PartSchema> = ref({
    nxid: '',
    manufacturer: '',
    name: '',
    type: '',
    location: '',
    quantity: 0,
})

// Clear out fields when part type is changed
watch(() => part.value.type, () => {
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
})

// Clear out connector type when storage interface is changed
watch(() => part.value.storage_interface, () => {
    delete part.value.port_type
})


// This is scuffed as fuck but it'll do for now
function resetForm() {
    part.value.nxid = ""
    part.value.manufacturer = ""
    part.value.name = ""
    part.value.type = ""
    part.value.location = ""
    part.value.quantity = 0
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
}

// Submit part
async function submitPart() {
    // Use create part method from API commands 
    createPart(http, part.value, (data, err) => {
        if (err) {
            // Fail
            errorHandler(err)
            return
        }
        // Success
        displayMessage(String(data))
        // Call our reset form function
        resetForm()
    })
}
// end submit part
</script>

<template>
    <div class="body">
        <h1 class="text-4xl mb-4">Create a new part:</h1>
        <form id="form" @submit.prevent="submitPart" @reset.prevent="resetForm" class="grid grid-cols-2">
            <label>NXID: </label>
            <input required v-model="part.nxid" type="text" placeholder="NXID">
            <label>Manufacturer: </label>
            <input required v-model="part.manufacturer" type="text" placeholder="Manufacturer">
            <label>Part name: </label>
            <input required v-model="part.name" type="text" placeholder="Part name">
            <label>Quantity: </label>
            <input required v-model="part.quantity" type="number" placeholder="Quantity">
            <label>Location: </label>
            <input required v-model="part.location" type="text" placeholder="Location">
            <label>Part Type: </label>
            <select required v-model="part.type">
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
                <input class="col-span-1" required v-model="part.chipset" type="text" placeholder="Chipset">
            </div>


            <div v-if="part.type == 'CPU'" class="col-span-2 grid grid-cols-2">
                <label>Chipset: </label>
                <input required v-model="part.chipset" type="text" placeholder="Chipset">
                <label>Frequency(GHz): </label>
                <input required v-model="part.frequency" type="number" placeholder="Frequency">
            </div>


            <div v-if="part.type == 'Memory'" class="col-span-2 grid grid-cols-2">
                <label>Frequency(MHz): </label>
                <input required v-model="part.frequency" type="number" placeholder="Frequency">
                <label>Capacity(GB): </label>
                <input required v-model="part.capacity" type="number" placeholder="Capacity">
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
                <select required v-model="part.peripheral_type">
                    <option disabled value="">Card type</option>
                    <option>RAID</option>
                    <option>JBOD</option>
                    <option>NIC</option>
                    <option>Adapter</option>
                </select>
                <label>Port Type: </label>
                <select required v-model="part.port_type">
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
                <select required v-model="part.storage_interface">
                    <option disabled value="">Pick one</option>
                    <option>SATA</option>
                    <option>SAS</option>
                    <option>NVME</option>
                </select>
                <label>Capacity: </label>
                <div class="flex justify-between">
                    <input required v-model="part.capacity" type="number">
                    <select required v-model="part.capacity_unit">
                        <option disabled value="">Pick one</option>
                        <option>GB</option>
                        <option>TB</option>
                    </select>
                </div>
                <div v-if="part.storage_interface == 'NVME'">
                    <label>Connector Type: </label>
                    <select required v-model="part.port_type">
                        <option disabled value="">Pick one</option>
                        <option>SAS</option>
                        <option>M.2</option>
                    </select>
                </div>
            </div>


            <div v-if="part.type == 'GPU'" class="col-span-2 grid grid-cols-2">
                <!-- Placeholder -->
            </div>


            <div v-if="part.type == 'Cable'" class="col-span-2 grid grid-cols-2">
                <label>Cable end 1: </label>
                <input required v-model="part.cable_end1" type="text">
                <label>Cable end 2: </label>
                <input required v-model="part.cable_end2" type="text">
            </div>
            <div v-if="part.type == 'Backplane'" class="col-span-2 grid grid-cols-2">
                <label>Storage interface: </label>
                <select required v-model="part.storage_interface">
                    <option selected>SATA</option>
                    <option>SAS</option>
                    <option>NVME</option>
                </select>
                <label>Ports: </label>
                <select required v-model="part.port_type">
                    <option selected>SATA</option>
                    <option>SAS</option>
                    <option>Mini SAS HD</option>
                </select>
            </div>
            <div v-if="part.type == 'Misc.'">
                <!-- Placeholder -->
            </div>
            <input class="col-span-2 submit bg-red-500 hover:bg-red-600 active:bg-red-700" type="reset" value="Reset">
            <input class="col-span-2 submit" type="submit" value="Create Part">
        </form>
    </div>
</template>



<style scoped>
input, select {
    @apply textbox;
}

</style>