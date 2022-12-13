<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetManagerComponent from '../components/AssetManagerComponent.vue';
import type { UserState, AssetSchema, LoadedCartItem, CartItem } from '../plugins/interfaces';
import { createAsset } from '../plugins/dbCommands/assetManager'

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

// Submit asset function
async function submitAsset(asset: AssetSchema, parts: Array<LoadedCartItem>) {
    // Use create part method from API commands
    let unloadedParts = [] as CartItem[]
    // Iterate through list of parts and strip only the NXID and quantity
    for (const part of parts) {
        unloadedParts.push({nxid: part.part.nxid as string, quantity: part.quantity})
    }
    // Create an asset using asset object and array of cart items
    createAsset(http, asset, unloadedParts, (data, err) => {
        if (err) {
            // Fail
            errorHandler(err)
            return
        }
        // Success
        displayMessage(String(data))
        router.push({name:'Assets'})
        // Call our reset form function
    })
}

</script>
<template>
    <AssetManagerComponent :http="http" :router="router" :displayMessage="displayMessage" :errorHandler="errorHandler" :oldAsset="{}" :strict="true" :submitText="`Create Asset`" :title="'Add untracked asset: '" @assetSubmit="submitAsset" />
</template>