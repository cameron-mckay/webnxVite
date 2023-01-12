<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetCartItemComponent from '../../components/AssetCartItemComponent.vue';
import { getAssetByID, getPartsOnAsset } from '../../plugins/dbCommands/assetManager';
import type { AssetSchema, LoadedCartItem, UserState } from '../../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

let asset = ref({
    asset_tag: "",
    building: 3,
    asset_type: "",
} as AssetSchema)
let parts = ref([] as LoadedCartItem[])

onBeforeMount(() => {
    if (router.currentRoute.value.query.asset_tag) {
        let nxid = router.currentRoute.value.query.asset_tag as string
        getAssetByID(http, nxid, (res, err) => {
            if (err) {
                errorHandler(err)
            }
            asset.value = res as AssetSchema
            getPartsOnAsset(http, asset.value.asset_tag!, (res, err) => {
                if (err) {
                    errorHandler(err)
                }
                parts.value = res as LoadedCartItem[]
            })
        })
    }
})

function edit() {
    router.push({ name: 'Edit Asset', query: { asset_tag: asset.value.asset_tag } })
}
</script>

<template>
    <div class="body">
        <div class="grid grid-cols-4 relative leading-10 group-hover:bg-zinc-400 
            p-2 rounded-lg group-hover:rounded-bl-none">
            <div class="flex justify-between col-span-4">
                <h1 class="text-4xl mb-4">{{ asset.asset_tag + ":" }}</h1>
                <img class="h-10 w-10 p-2 m-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                    src="../../assets/pencil-solid.svg" v-on:click="edit">
            </div>
            <p>Building:</p>
            <p class="col-span-3">{{ asset.building }}</p>
            <p>Asset Type:</p>
            <p class="col-span-3">{{ asset.asset_type }}</p>
            <p v-if="asset.chassis_type">Chassis Type</p>
            <p class="col-span-3" v-if="asset.chassis_type">{{ asset.chassis_type }}</p>
            <p v-if="asset.manufacturer">Manufacturer:</p>
            <p class="col-span-3" v-if="asset.manufacturer">{{ asset.manufacturer }}</p>
            <p v-if="asset.model">Model:</p>
            <p class="col-span-3" v-if="asset.model">{{ asset.model }}</p>
            <p v-if="asset.serial">Serial:</p>
            <p class="col-span-3" v-if="asset.serial">{{ asset.serial }}</p>
            <p v-if="asset.live != undefined">Status:</p>
            <p class="col-span-3" v-if="asset.live">Live</p>
            <p class="col-span-3" v-else-if="asset.live != undefined">Inactive</p>
            <p v-if="asset.rails != undefined">Rails:</p>
            <p class="col-span-3" v-if="asset.rails">Yes</p>
            <p class="col-span-3" v-else-if="asset.rails != undefined">No</p>
            <p v-if="asset.bay">Bay:</p>
            <p class="col-span-3" v-if="asset.bay">{{ asset.bay }}</p>
            <p v-if="asset.power_port">Power Port:</p>
            <p class="col-span-3" v-if="asset.power_port">{{ asset.power_port }}</p>
            <p v-if="asset.public_port">Public Port:</p>
            <p class="col-span-3" v-if="asset.public_port">{{ asset.public_port }}</p>
            <p v-if="asset.private_port">Private Port:</p>
            <p class="col-span-3" v-if="asset.private_port">{{ asset.private_port }}</p>
            <p v-if="asset.ipmi_port">IPMI Port:</p>
            <p class="col-span-3" v-if="asset.ipmi_port">{{ asset.ipmi_port }}</p>
            <p>Date Updated:</p>
            <p class="col-span-3">{{ "Date Updated: " + new Date(Date.parse(asset.date_updated!)).toDateString() }}</p>
            <p>Date Created:</p>
            <p class="col-span-3">{{ "Date Created: " + new Date(Date.parse(asset.date_created!)).toDateString() }}</p>
        </div>
        <div v-if="parts.length > 0">
            <h1 class="text-4xl mb-4 col-span-2">Parts</h1>
            <div v-if="(parts!.length > 0)" class="grid font-bold grid-cols-5 relative leading-10 text-center group-hover:bg-zinc-400 p-2 rounded-xl 
                    group-hover:rounded-bl-none group-hover:shadow-lg">
                <p>NXID</p>
                <p>Manufacturer</p>
                <p>Name</p>
                <p>Quantity</p>
                <p></p>
            </div>
            <AssetCartItemComponent class="col-span-2" v-for="part in parts" :item="part"
                @plus="$emit('plusPart', part)" @minus="$emit('minusPart', part)" @delete="$emit('deletePart', part)"
                :hideButtons="true" />
        </div>
    </div>
</template>
