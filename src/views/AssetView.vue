<script setup lang="ts">
import AssetManagerComponent from '../components/AssetManagerComponent.vue';
import { onBeforeMount, ref } from 'vue';
import { getAssetByID, getPartsOnAsset, updateAsset } from '../plugins/dbCommands/assetManager';
import { getUserInventory } from '../plugins/dbCommands/userManager';
import type { AxiosError, AxiosInstance } from 'axios';
import type { Store } from 'vuex';
import type { UserState, AssetSchema, LoadedCartItem, CartItem } from '../plugins/interfaces';
import type { Router } from 'vue-router';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

let asset = ref({} as AssetSchema)
let parts = ref([] as LoadedCartItem[])
let inventory = ref([] as LoadedCartItem[])

onBeforeMount(()=>{
    if(router.currentRoute.value.query.asset_tag) {
        let nxid = router.currentRoute.value.query.asset_tag as string
        console.log(nxid)
        getAssetByID(http, nxid, (res, err) => {
            if(err) {
                errorHandler(err)
            }
            console.log(res)
            asset.value = res as AssetSchema
            getPartsOnAsset(http, asset.value.asset_tag!, (res, err) =>{
                if(err) {
                    errorHandler(err)
                }
                parts.value = res as LoadedCartItem[]
            })
        })
        getUserInventory(http, (res, err) => {
            if(err) {
                errorHandler(err)
            }
            inventory.value = res as LoadedCartItem[]
        })

    }
})

function assetSubmit() {
    // Use create part method from API commands
    let unloadedParts = [] as CartItem[]
    // Iterate through list of parts and strip only the NXID and quantity
    for (const part of parts.value) {
        unloadedParts.push({nxid: part.part.nxid as string, quantity: part.quantity})
    }
    updateAsset(http, asset.value, unloadedParts, (data, err) => {
        if (err) {
            return errorHandler(err)
        }
        router.back()
    })
}
</script>
<template>
    <AssetManagerComponent :oldAsset="asset" :title="'Edit Asset'" :http="http" :errorHandler="errorHandler"
        :displayMessage="displayMessage" :submitText="'Update Asset'" :strict="true" :parts="parts" @assetSubmit="assetSubmit"/>
</template>