<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onActivated, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetManagerComponent from '../components/AssetManagerComponent.vue';
import AssetSearchComponent from '../components/AssetSearchComponent.vue';
import FullScreenPopupComponent from '../components/FullScreenPopupComponent.vue';
import type { UserState, AssetSchema, LoadedCartItem, CartItem } from '../plugins/interfaces';
import { getPartsOnAsset, updateAsset } from '../plugins/dbCommands/assetManager'

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

// Default building is Ogden - 3
let currentBuilding = ref(3);
// Create empty reactive asset
let currentAsset = ref({} as AssetSchema)
// Reactive boolean for toggling editing
let edit = ref(false)
// Parts
let parts = ref([] as Array<LoadedCartItem>)

onActivated(()=>{
    // Change current building when store is loaded
    currentBuilding.value = store.state.user.building!;
})

// Toggle editing menu
function toggleEdit(asset: AssetSchema) {
    // Change current asset to given value
    currentAsset.value = asset
    parts.value = []
    if(!edit.value) {
        getPartsOnAsset(http, asset.asset_tag!, (data, err) => {
            if (err) {
                console.log(err)
                console.log(data)
                return errorHandler(err)
            }
            parts.value = data as Array<LoadedCartItem>
            edit.value = !edit.value
        })
    } else {
        edit.value = !edit.value
    }
    // Toggle reactive boolean
}

function updateAssetSubmit(asset: AssetSchema, parts: Array<LoadedCartItem>) {
    // Use create part method from API commands
    let unloadedParts = [] as CartItem[]
    // Iterate through list of parts and strip only the NXID and quantity
    for (const part of parts) {
        unloadedParts.push({nxid: part.part.nxid as string, quantity: part.quantity})
    }
    updateAsset(http, asset, unloadedParts, (data, err) => {
        if (err) {
            return errorHandler(err)
        }
        displayMessage("Updated asset")
        toggleEdit({})
    })
}
</script>
<template>
    <div>
        <!-- Title area -->
        <h1 class="text-4xl mb-4">Asset Search</h1>
        <!-- Search menu -->
        <AssetSearchComponent :http="http" :router="router" :edit="true" :view="true" :errorHandler="errorHandler" 
        :location="'Parts Room'" :building="currentBuilding" :displayMessage="displayMessage" @editAssetAction="toggleEdit"/>
        <!-- Asset editing popup menu -->
        <FullScreenPopupComponent v-if="edit" @toggle="toggleEdit({})">
            <AssetManagerComponent :oldAsset="currentAsset" :title="'Edit Asset'" :http="http" :errorHandler="errorHandler"
            :displayMessage="displayMessage" :submitText="'Update Asset'" :strict="true" :parts="parts" @assetSubmit="updateAssetSubmit"/>
        </FullScreenPopupComponent>
    </div>
</template>