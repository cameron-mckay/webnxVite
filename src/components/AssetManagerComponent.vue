<script setup lang="ts">
import type { AssetSchema, LoadedCartItem, PartSchema } from '../plugins/interfaces';
import { ref, watch, Ref, onBeforeMount } from 'vue';
import CustomDropdownComponent from './CustomDropdownComponent.vue';
import FullScreenPopupComponent from './FullScreenPopupComponent.vue';
import AssetPartSearchComponent from './AssetPartSearchComponent.vue';
import AssetCartItemComponent from './AssetCartItemComponent.vue';
import { AxiosInstance, AxiosError } from 'axios';
import { Router } from 'vue-router';

// Props interface
interface Props {
    title: string,
    submitText: string,
    strict: boolean,
    oldAsset?: AssetSchema,
    http?: AxiosInstance,
    router?: Router,
    parts?: LoadedCartItem[],
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
const { title, submitText, strict, oldAsset, parts, http, errorHandler, displayMessage } = defineProps<Props>()

let PartPopUp = ref(false)
let partsOnAsset:Ref<Array<LoadedCartItem>> = ref([])
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
function togglePartPopUp() {
    PartPopUp.value = !PartPopUp.value
}

function addToAsset(part: PartSchema) {
    let found = false
    for(let item of partsOnAsset.value) {
        if(item.part.nxid == part.nxid) {
            found = true
            item.quantity += 1;
        }
    }
    if(!found) {
        partsOnAsset.value.push({part, quantity: 1})
    }
}
function plusPart(part: LoadedCartItem) {
    part.quantity += 1;
    displayMessage(`Added ${part.part.manufacturer} ${part.part.name} to asset`)
}
function minusPart(part: LoadedCartItem) {
    if (part.quantity > 1) {
        part.quantity -= 1
    } else {
        for(let i = 0; i < partsOnAsset.value.length; i++) {
            if (part == partsOnAsset.value[i]) {
                partsOnAsset.value.splice(i, 1)
                return;
            }
        }
    }
}
function deletePart(part: LoadedCartItem) {
    for(let i = 0; i < partsOnAsset.value.length; i++) {
        if (part == partsOnAsset.value[i]) {
            partsOnAsset.value.splice(i, 1)
            return;
        }
    }
}

onBeforeMount(()=> {
    if (oldAsset) {
        asset.value = oldAsset
        partsOnAsset.value = parts!
    }
})
</script>

<template>
    <div class="body" v-smooth-resize="{delay: 50, transition: 800, fineTune: 27}">
        <h1 class="text-4xl mb-4">{{ title }}</h1>
        <form id="form" @submit.prevent="$emit('assetSubmit',asset, partsOnAsset)" 
        @reset.prevent="resetForm" class="grid grid-cols-2">
            <label>Asset Tag: </label>
            <input :required="strict" v-model="asset.asset_tag" type="text" placeholder="Asset Tag">
            <label>Manufacturer: </label>
            <input :required="strict" v-model="asset.manufacturer" type="text" placeholder="Manufacturer">
            <label>Model: </label>
            <input :required="strict" v-model="asset.model" type="text" placeholder="Model">
            <label>Building: </label>
            <CustomDropdownComponent :required="strict" :options="['3', '1', '4']" 
            @updateValue="(value)=>{asset.building = parseInt(value)}" :defaultValue="(asset.building?.toString())"/>
            <label>Bay: </label>
            <input :required="strict" v-model="asset.bay" type="number" placeholder="Bay">
            <label>Serial Number: </label>
            <input :required="strict" v-model="asset.serial" type="text" placeholder="Serial Number">
            <label>Asset Type: </label>
            <CustomDropdownComponent :required="strict" :options="['Server','Laptop', 'Switch', 'PDU']" 
            @updateValue="(value)=>{asset.asset_type = value}" :defaultValue="asset.asset_type"/>
            <div v-if="(asset.asset_type == 'Server'|| asset.asset_type == 'Switch' || asset.asset_type == 'PDU')" 
            class="col-span-2 grid grid-cols-2">
                <label>Status: </label>
                <select :required="strict" v-model="asset.live">
                    <option selected :value="true">Live</option>
                    <option :value="false">Inactive</option>
                </select>
                <div v-if="((asset.asset_type == 'PDU'||asset.asset_type =='Switch')&&asset.live)" 
                class="col-span-2 grid grid-cols-2">
                    <label>Rack Location: </label>
                    <input :required="strict" v-model="asset.power_port" type="text" placeholder="Rack Location">
                </div>
                <div v-if="asset.asset_type == 'Server'" class="col-span-2 grid grid-cols-2">
                    <label>Chassis Type: </label>
                    <CustomDropdownComponent :required="strict" :options="['Rack','Node', 'Tower']" 
                    @updateValue="(value)=>{asset.chassis_type = value}" :defaultValue="asset.chassis_type"/>
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
                        <input :required="strict" v-model="asset.power_port" 
                        type="text" placeholder="Power Port">
                        <label>Public Port: </label>
                        <input :required="strict" v-model="asset.public_port" 
                        type="text" placeholder="Public Port">
                        <label>Private Port: </label>
                        <input :required="strict" v-model="asset.private_port" 
                        type="text" placeholder="Private Port">
                        <label>IPMI Port: </label>
                        <input :required="strict" v-model="asset.ipmi_port" 
                        type="text" placeholder="IPMI Port">
                    </div>
                    <div v-if="asset.live" class="col-span-2 grid grid-cols-2">
                        <label>SID: </label>
                        <input :required="strict" v-model="asset.sid" 
                        type="number" placeholder="Service ID">
                    </div>
                    <!-- Part Search here -->
                </div>
            </div>
            <div v-if="(http!=undefined)" class="col-span-2">
                <div v-show="asset.asset_type=='Server'">
                    <h1 class="text-4xl inline-block">Parts: </h1>
                    <img class="w-10 h-10 p-2 mx-1 bg-zinc-400 hover:bg-green-500 
                    shadow-lg rounded-lg inline-block transition" @click="togglePartPopUp" src="../assets/plus-solid.svg">
                </div>
                <FullScreenPopupComponent v-if="PartPopUp" @toggle="togglePartPopUp">
                    <AssetPartSearchComponent :http="http" :errorHandler="errorHandler"
                    :displayMessage="displayMessage" @addPartAction="addToAsset"/>
                </FullScreenPopupComponent>
                <div v-if="(partsOnAsset.length > 0)"
                    class="grid font-bold grid-cols-5 relative leading-10 text-center group-hover:bg-zinc-400 p-2 rounded-xl 
                    group-hover:rounded-bl-none group-hover:shadow-lg">
                    <p>NXID</p>
                    <p>Manufacturer</p>
                    <p>Name</p>
                    <p>Quantity</p>
                    <p></p>
                </div>
                <AssetCartItemComponent class="col-span-2" v-for="part in partsOnAsset" :item="part" @plus="plusPart(part)" 
                @minus="minusPart(part)" @delete="deletePart(part)"/>
            </div>
            <input class="col-span-2 submit bg-red-500 hover:bg-red-600 active:bg-red-700" type="reset" value="Reset">
            <input class="col-span-2 submit" type="submit" :value="submitText">
        </form>
    </div>
</template>