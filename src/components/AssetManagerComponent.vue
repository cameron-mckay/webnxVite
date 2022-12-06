<script setup lang="ts">
import type { AssetSchema } from '../plugins/interfaces';
import { ref, watch, Ref } from 'vue';

// Props interface
interface Props {
    title: string,
    submitText: string,
    strict: boolean,
    oldAsset?: AssetSchema,
}
const { title, submitText, strict, oldAsset } = defineProps<Props>()

let asset:Ref<AssetSchema> = ref(JSON.parse(JSON.stringify(oldAsset)) as AssetSchema)
let assetCopy = JSON.parse(JSON.stringify(oldAsset))
let firstLoad = false
let inRack = ref(false)

// Clear out fields when part type is changed
watch(() => asset.value.type, () => {
    if(!firstLoad) {
        delete asset.value.frequency
        delete asset.value.chipset
        delete asset.value.memory_type
        delete asset.value.peripheral_type
        delete asset.value.storage_interface
        delete asset.value.capacity
        delete asset.value.capacity_unit
        delete asset.value.num_ports
        delete asset.value.port_type
        delete asset.value.cable_end1
        delete asset.value.cable_end2
    }else {
        firstLoad = false
    }
})

// Clear out connector type when storage interface is changed
watch(() => asset.value.storage_interface, () => {
    if(asset.value.storage_interface != 'NVME') {
        delete asset.value.port_type
    }
})

// Reset form
function resetForm() {
    asset.value = JSON.parse(JSON.stringify(assetCopy))
}
</script>

<template>
    <div class="body">
        <h1 class="text-4xl mb-4">{{ title }}</h1>
        <form id="form" @submit.prevent="$emit('assetSubmit',asset)" @reset.prevent="resetForm" class="grid grid-cols-2">
            <label>Asset Tag: </label>
            <input :required="strict" v-model="asset.asset_tag" type="text" placeholder="Asset Tag">
            <label>Manufacturer: </label>
            <input :required="strict" v-model="asset.manufacturer" type="text" placeholder="Manufacturer">
            <label>Model: </label>
            <input :required="strict" v-model="asset.model" type="text" placeholder="Model">
            <label>Bay: </label>
            <input :required="strict" v-model="asset.bay" type="number" placeholder="Bay">
            <label>Serial Number: </label>
            <input :required="strict" v-model="asset.serial" type="text" placeholder="Serial Number">
            <label>Asset Type: </label>
            <select :required="strict" v-model="asset.asset_type">
                <option disabled selected value="">Asset type</option>
                <option>Server</option>
                <option>Laptop</option>
                <option>PDU</option>
                <option>Switch</option>
            </select>
            
            <div v-if="(asset.asset_type != 'Laptop'&&asset.asset_type!=undefined)" class="col-span-2 grid grid-cols-2">
                <label>Status: </label>
                <select :required="strict" v-model="asset.live">
                    <option selected :value="true">Live</option>
                    <option :value="false">Inactive</option>
                </select>
                <div v-if="((asset.asset_type == 'PDU'||asset.asset_type =='Switch')&&asset.live)" class="col-span-2 grid grid-cols-2">
                    <label>Rack Location: </label>
                    <input :required="strict" v-model="asset.power_port" type="text" placeholder="Rack Location">
                </div>
                <div v-if="asset.asset_type == 'Server'" class="col-span-2 grid grid-cols-2">
                    <div v-if="(!asset.live&&asset.live!=undefined)" class="col-span-2 grid grid-cols-2">
                        <label>Rails: </label>
                        <select :required="strict" v-model="asset.rails">
                            <option :value="true">Yes</option>
                            <option :value="false">No</option>
                        </select>
                        <div v-if="(asset.rails&&asset.rails!=undefined)" class="col-span-2 grid grid-cols-2">
                            <label>In Rack: </label>
                            <select :required="strict" v-model="inRack">
                                <option :value="true">Yes</option>
                                <option :value="false">No</option>
                            </select>
                        </div>
                    </div>
                    <div v-if="(asset.live||inRack)" class="col-span-2 grid grid-cols-2">
                        <label>Power Port: </label>
                        <input :required="strict" v-model="asset.power_port" type="text" placeholder="Power Port">
                        <label>Public Port: </label>
                        <input :required="strict" v-model="asset.public_port" type="text" placeholder="Public Port">
                        <label>Private Port: </label>
                        <input :required="strict" v-model="asset.private_port" type="text" placeholder="Private Port">
                        <label>IPMI Port: </label>
                        <input :required="strict" v-model="asset.ipmi_port" type="text" placeholder="IPMI Port">
                    </div>
                    <div v-if="asset.live" class="col-span-2 grid grid-cols-2">
                        <label>SID: </label>
                        <input :required="strict" v-model="asset.sid" type="number" placeholder="Service ID">
                    </div>
                </div>
            </div>
            <input class="col-span-2 submit bg-red-500 hover:bg-red-600 active:bg-red-700" type="reset" value="Reset">
            <input class="col-span-2 submit" type="submit" :value="submitText">
        </form>
    </div>
</template>