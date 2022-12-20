<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { ref, watch } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetManagerComponent from '../components/AssetManagerComponent.vue';
import { createAsset } from '../plugins/dbCommands/assetManager';
import type { AssetSchema, CartItem, LoadedCartItem, UserState } from '../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

let oldAsset = ref({} as AssetSchema)
let partsOnAsset = ref([] as LoadedCartItem[])

function assetSubmit() {
    // Use create part method from API commands
    let unloadedParts = [] as CartItem[]
    // Iterate through list of parts and strip only the NXID and quantity
    for (const part of partsOnAsset.value) {
        unloadedParts.push({ nxid: part.part.nxid as string, quantity: part.quantity })
    }
    createAsset(http, oldAsset.value, unloadedParts, (data, err) => {
        if (err) {
            return errorHandler(err)
        }
        router.back()
    })
}

// Clear out fields when part type is changed
watch(() => oldAsset.value.asset_type, () => {
    delete oldAsset.value.rails
    delete oldAsset.value.live
    delete oldAsset.value.public_port
    delete oldAsset.value.private_port
    delete oldAsset.value.ipmi_port
    delete oldAsset.value.power_port
    delete oldAsset.value.sid
})

watch(() => oldAsset.value.live, () => {
    if (oldAsset.value.asset_type == "Server" && oldAsset.value.live) {
        oldAsset.value.rails = true
    } else {
        delete oldAsset.value.rails
    }
})

function plusPart(part: LoadedCartItem) {
    let index = partsOnAsset.value.indexOf(part)
    if (index == -1) {
        let found = false
        for (let i = 0; i < partsOnAsset.value.length; i++) {
            if (partsOnAsset.value[i].part._id == part.part._id) {
                found = true
                partsOnAsset.value[i].quantity += 1
                break
            }
        }
        if (!found) {
            partsOnAsset.value.push({ part: part.part, quantity: 1 })
            displayMessage(`Added ${part.part.manufacturer} ${part.part.name} to asset`)
        }
    } else {
        partsOnAsset.value[index].quantity += 1
    }
}
function minusPart(part: LoadedCartItem) {
    part.quantity -= 1
    if (part.quantity < 1) {
        partsOnAsset.value.splice(partsOnAsset.value.indexOf(part), 1)
    }
}

function deletePart(part: LoadedCartItem) {
    partsOnAsset.value.splice(partsOnAsset.value.indexOf(part), 1)
}
</script>

<template>
    <AssetManagerComponent :http="http" :title="'Add Untracked Asset:'" :submitText="'Create Asset'" :strict="true"
        :oldAsset="oldAsset" :parts="partsOnAsset" :errorHandler="errorHandler" :displayMessage="displayMessage"
        :partSearch="true" @assetSubmit="assetSubmit" @plusPart="plusPart" @minusPart="minusPart"
        @deletePart="deletePart" />
</template>
