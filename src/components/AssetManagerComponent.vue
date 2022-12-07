<script setup lang="ts">
import type { AssetSchema } from '../plugins/interfaces';
import { ref, watch, Ref } from 'vue';
import CustomDropdownCompononent from './CustomDropdownCompononent.vue';

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
let inRack = ref(false)
asset.value.asset_type = asset.value.asset_type ? asset.value.asset_type : ""
// Clear out fields when part type is changed
watch(() => asset.value.asset_type, () => {
    delete asset.value.rails
    delete asset.value.live
    delete asset.value.public_port
    delete asset.value.private_port
    delete asset.value.ipmi_port
    delete asset.value.power_port
    delete asset.value.sid
})

watch(() => asset.value.live, () => {
    if (asset.value.asset_type == "Server"&&asset.value.live) {
        asset.value.rails = true
    } else {
        delete asset.value.rails
    }
})

// Reset form
function resetForm() {
    asset.value = JSON.parse(JSON.stringify(assetCopy))
}
</script>

<template>
    <div class="body" v-smooth-resize="{delay: 50, transition: 800, fineTune: 27}">
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
            <CustomDropdownCompononent :required="strict" :options="['Server','Laptop', 'Switch', 'PDU']" @updateValue="(value)=>{asset.asset_type = value}"/>
            <div v-if="(asset.asset_type == 'Server'|| asset.asset_type == 'Switch' || asset.asset_type == 'PDU')" class="col-span-2 grid grid-cols-2">
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