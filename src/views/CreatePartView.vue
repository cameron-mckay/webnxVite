<script setup lang="ts">
// Get http and store from props
import { PartSchema } from '../model/part';
import { createPart } from '../plugins/dbCommands';
import { inject, reactive, watch } from 'vue';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/store';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router
    errorHandler: (err: Error | AxiosError) => void
}

const { http, store, router, errorHandler } = defineProps<Props>()
// END OF PROPS

var part: PartSchema = {
    nxid: '',
    manufacturer: '',
    name: '',
    type: '',
    location: '',
    quantity: 0,
}
var state = reactive<PartSchema>(part)

// Clear out fields when part type is changed
watch(() => state.type, () => {
    delete part.frequency
    delete part.chipset
    delete part.memory_type
    delete part.peripheral_type
    delete part.storage_interface
    delete part.capacity
    delete part.capacity_unit
    delete part.num_ports
    delete part.port_type
    delete part.cable_end1
    delete part.cable_end2
})

// Clear out connector type when storage interface is changed
watch(() => state.storage_interface, () => {
    delete part.port_type
})

async function submitPart() {
    createPart(http, part, (data, err) => {
        if (err) {
            // Fail
            errorHandler(err)
            return
        }
        // Success
        console.log("success")
    })
}



</script>

<template>
    <div class="body">
        <h1>Create a new part:</h1>
        <form @submit.prevent="submitPart">
            <label>NXID: </label>
            <input required v-model="state.nxid" type="text" placeholder="NXID">
            <label>Manufacturer: </label>
            <input required v-model="state.manufacturer" type="text" placeholder="Manufacturer">
            <label>Part name: </label>
            <input required v-model="state.name" type="text" placeholder="Part name">
            <label>Quantity: </label>
            <input required v-model="state.quantity" type="number" placeholder="Quantity">
            <label>Location: </label>
            <input required v-model="state.location" type="text" placeholder="Location">
            <label>Part Type: </label>
            <select required v-model="state.type">
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


            <div v-if="state.type == 'Motherboard'">
                <label>Chipset: </label>
                <input required v-model="state.chipset" type="number" placeholder="Chipset">
            </div>


            <div v-if="state.type == 'CPU'">
                <label>Chipset: </label>
                <input required v-model="state.chipset" type="number" placeholder="Chipset">
                <label>Frequency(GHz): </label>
                <input required v-model="state.frequency" type="number" placeholder="Frequency">
            </div>


            <div v-if="state.type == 'Memory'">
                <label>Frequency(MHz): </label>
                <input required v-model="state.frequency" type="number" placeholder="Frequency">
                <label>Capacity(GB): </label>
                <input required v-model="state.capacity" type="number" placeholder="Capacity">
                <label>Type: </label>
                <select v-model="state.memory_type">
                    <option disabled value="">Memory type</option>
                    <option>UDIMM</option>
                    <option>ECC</option>
                    <option>REG</option>
                </select>
            </div>


            <div v-if="state.type == 'Peripheral Card'">
                <label>Card type: </label>
                <select required v-model="state.peripheral_type">
                    <option disabled value="">Card type</option>
                    <option>RAID</option>
                    <option>JBOD</option>
                    <option>NIC</option>
                    <option>Adapter</option>
                </select>
                <label>Port Type: </label>
                <select required v-model="state.port_type">
                    <optgroup v-if="state.peripheral_type == 'NIC'">
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


            <div v-if="state.type == 'Storage'">
                <label>Storage interface: </label>
                <select required v-model="state.storage_interface">
                    <option disabled value="">Pick one</option>
                    <option>SATA</option>
                    <option>SAS</option>
                    <option>NVME</option>
                </select>
                <label>Capacity: </label>
                <div>
                    <input required v-model="state.capacity" type="number">
                    <select required v-model="state.capacity_unit">
                        <option disabled value="">Pick one</option>
                        <option>GB</option>
                        <option>TB</option>
                    </select>
                </div>
                <div v-if="state.storage_interface == 'NVME'">
                    <label>Connector Type: </label>
                    <select required v-model="state.port_type">
                        <option disabled value="">Pick one</option>
                        <option>SAS</option>
                        <option>M.2</option>
                    </select>
                </div>
            </div>


            <div v-if="state.type == 'GPU'">
                <!-- Placeholder -->
            </div>


            <div v-if="state.type == 'Cable'">
                <label>Cable end 1: </label>
                <input required v-model="state.cable_end1" type="text">
                <label>Cable end 2: </label>
                <input required v-model="state.cable_end2" type="text">
            </div>
            <div v-if="state.type == 'Backplane'">
                <label>Storage interface: </label>
                <select required v-model="state.storage_interface">
                    <option selected>SATA</option>
                    <option>SAS</option>
                    <option>NVME</option>
                </select>
                <label>Ports: </label>
                <select required v-model="state.port_type">
                    <option selected>SATA</option>
                    <option>SAS</option>
                    <option>Mini SAS HD</option>
                </select>
            </div>
            <div v-if="state.type == 'Misc.'">
                <!-- Placeholder -->
            </div>

            <input id="submit" type="submit">
        </form>
    </div>
</template>

<style scoped>
h1 {
    text-align: left;
}

form {
    display: grid;
    grid-template-columns: 1fr 3fr;
}

label {
    grid-column: 1;
    text-align: right;
    padding-right: 20px;
}

form>div {
    grid-column: 1/3;
    display: grid;
    grid-template-columns: 1fr 3fr;
}

input,
select {
    grid-column: 2;
}

#submit {
    grid-column: 1/3;
    background-color: greenyellow;
}
</style>