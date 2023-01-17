<script setup lang="ts">
import { AxiosError, AxiosInstance } from 'axios';
import { ref } from 'vue';
import { Router } from 'vue-router';
import { AssetSchema, LoadedCartItem, PartSchema } from '../plugins/interfaces';
import AssetCartItemComponent from './AssetCartItemComponent.vue';
import AssetPartSearchComponent from './AssetPartSearchComponent.vue';
import CustomDropdownComponent from './CustomDropdownComponent.vue';
import FullScreenPopupComponent from './FullScreenPopupComponent.vue';
import InventoryPopup from './InventoryPopup.vue';

interface Props {
    title: string,
    submitText: string,
    strict: boolean,
    oldAsset: AssetSchema,
    parts: LoadedCartItem[],
    errorHandler?: (err: Error | AxiosError | string) => void,
    displayMessage?: (message: string) => void
    http?: AxiosInstance,
    router?: Router,
    partSearch?: boolean,
    inventorySearch?: boolean,
    inventory?: LoadedCartItem[]
}

const { title, submitText, strict, oldAsset, parts, http, errorHandler, displayMessage, partSearch, inventorySearch, inventory } = defineProps<Props>()

let inRack = ref(false)
let partSearchPopup = ref(false)
let inventorySearchPopup = ref(false)

let emit = defineEmits(['assetSubmit', 'plusPart', 'minusPart', 'deletePart'])

// Emit add part to asset as new record
function addToAsset(part: PartSchema) {
    emit('plusPart', { part, quantity: 1 })
}

// Toggle popup menus
function togglePopup() {
    partSearchPopup.value = !partSearchPopup.value
    inventorySearchPopup.value = !inventorySearchPopup.value
}

// Add Part from user inventory
function addPartFromInventory(item: LoadedCartItem) {
    emit('plusPart', item)
}
</script>
<template>
    <div class="body" v-smooth-resize="{ delay: 50, transition: 800, fineTune: 27 }">
        <h1 class="text-4xl mb-4">{{ title }}</h1>
        <form id="form" @submit.prevent="$emit('assetSubmit')" @reset.prevent="$emit('assetReset')"
            class="grid grid-cols-2">
            <label>Asset Tag: </label>
            <input :required="strict" v-model="oldAsset.asset_tag" type="text" placeholder="Asset Tag">
            <label>Manufacturer: </label>
            <input :required="strict" v-model="oldAsset.manufacturer" type="text" placeholder="Manufacturer">
            <label>Model: </label>
            <input :required="strict" v-model="oldAsset.model" type="text" placeholder="Model">
            <label>Building: </label>
            <CustomDropdownComponent :required="strict" :options="['3', '1', '4']"
                @updateValue="(value: string) => { oldAsset.building = parseInt(value) }"
                :defaultValue="(oldAsset.building?.toString())" />
            <label>Bay: </label>
            <input :required="strict" v-model="oldAsset.bay" type="number" placeholder="Bay">
            <label>Serial Number: </label>
            <input :required="strict" v-model="oldAsset.serial" type="text" placeholder="Serial Number">
            <label>Asset Type: </label>
            <CustomDropdownComponent :required="strict" :options="['Server', 'Laptop', 'Switch', 'PDU']"
                @updateValue="(value: string) => { oldAsset.asset_type = value }" :defaultValue="oldAsset.asset_type" />
            <div v-if="(oldAsset.asset_type == 'Server' || oldAsset.asset_type == 'Switch' || oldAsset.asset_type == 'PDU')"
                class="col-span-2 grid grid-cols-2">
                <label>Status: </label>
                <select :required="strict" v-model="oldAsset.live">
                    <option :value=true>Live</option>
                    <option :value=false>Inactive</option>
                </select>
                <div v-if="((oldAsset.asset_type == 'PDU' || oldAsset.asset_type == 'Switch') && oldAsset.live)"
                    class="col-span-2 grid grid-cols-2">
                    <label>Rack Location: </label>
                    <input :required="strict" v-model="oldAsset.power_port" type="text" placeholder="Rack Location">
                </div>
                <div v-if="oldAsset.asset_type == 'Server'" class="col-span-2 grid grid-cols-2">
                    <label>Chassis Type: </label>
                    <CustomDropdownComponent :required="strict" :options="['Rack', 'Node', 'Tower']"
                        @updateValue="(value: string) => { oldAsset.chassis_type = value }"
                        :defaultValue="oldAsset.chassis_type" />
                    <div v-if="(!oldAsset.live && oldAsset.live != undefined)" class="col-span-2 grid grid-cols-2">
                        <label>Rails: </label>
                        <select :required="strict" v-model="oldAsset.rails">
                            <option :value="true">Yes</option>
                            <option :value="false">No</option>
                        </select>
                        <div v-if="(oldAsset.rails && oldAsset.rails != undefined)" class="col-span-2 grid grid-cols-2">
                            <label>In Rack: </label>
                            <select :required="strict" v-model="inRack">
                                <option :value="true">Yes</option>
                                <option :value="false">No</option>
                            </select>
                        </div>
                    </div>
                    <div v-if="(oldAsset.live || inRack || oldAsset.power_port)" class="col-span-2 grid grid-cols-2">
                        <label>Power Port: </label>
                        <input :required="strict" v-model="oldAsset.power_port" type="text" placeholder="Power Port">
                        <label>Public Port: </label>
                        <input :required="strict" v-model="oldAsset.public_port" type="text" placeholder="Public Port">
                        <label>Private Port: </label>
                        <input :required="strict" v-model="oldAsset.private_port" type="text"
                            placeholder="Private Port">
                        <label>IPMI Port: </label>
                        <input :required="strict" v-model="oldAsset.ipmi_port" type="text" placeholder="IPMI Port">
                    </div>
                    <div v-if="oldAsset.live" class="col-span-2 grid grid-cols-2">
                        <label>SID: </label>
                        <input :required="strict" v-model="oldAsset.sid" type="number" placeholder="Service ID">
                    </div>
                    <!-- Part Search here -->
                </div>
            </div>
            <div v-if="(http != undefined)" class="col-span-2">
                <div v-show="oldAsset.asset_type == 'Server'">
                    <h1 class="text-4xl inline-block">Parts: </h1>
                    <img class="w-10 h-10 p-2 mx-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg inline-block transition" @click="togglePopup" src="../assets/plus-solid.svg">
                </div>
                <FullScreenPopupComponent v-if="partSearch" v-show="partSearchPopup" @toggle="togglePopup">
                    <AssetPartSearchComponent :http="http" :errorHandler="errorHandler!"
                        :displayMessage="displayMessage!" @addPartAction="addToAsset" />
                </FullScreenPopupComponent>
                <FullScreenPopupComponent v-if="inventorySearch && inventory" v-show="inventorySearchPopup"
                    @toggle="togglePopup">
                    <InventoryPopup @addPartAction="addPartFromInventory" :inventory="inventory" />
                </FullScreenPopupComponent>
                <div v-if="(parts!.length > 0)" class="grid font-bold grid-cols-5 relative leading-10 text-center group-hover:bg-zinc-400 p-2 rounded-xl group-hover:rounded-bl-none group-hover:shadow-lg">
                    <p>NXID</p>
                    <p>Manufacturer</p>
                    <p>Name</p>
                    <p>Quantity</p>
                    <p></p>
                </div>
                <AssetCartItemComponent class="col-span-2" v-for="part in parts" :item="part"
                    @plus="$emit('plusPart', part)" @minus="$emit('minusPart', part)"
                    @delete="$emit('deletePart', part)" />
            </div>
            <input class="col-span-2 submit bg-red-500 hover:bg-red-600 active:bg-red-700" type="reset" value="Reset">
            <input class="col-span-2 submit" type="submit" :value="submitText">
        </form>
    </div>
</template>
