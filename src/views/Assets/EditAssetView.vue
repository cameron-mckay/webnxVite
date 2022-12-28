<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref, watch } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetManagerComponent from '../../components/AssetManagerComponent.vue';
import { getAssetByID, getPartsOnAsset, updateAsset } from '../../plugins/dbCommands/assetManager';
import { getUserInventory } from '../../plugins/dbCommands/userManager';
import type { AssetSchema, CartItem, LoadedCartItem, UserState } from '../../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

let oldAsset = ref({} as AssetSchema)
let assetCopy = {} as AssetSchema
let partsOnAsset = ref([] as LoadedCartItem[])
let partsOnAssetCopy = [] as AssetSchema[]
let inventory = ref([] as LoadedCartItem[])
let inventoryCopy = [] as LoadedCartItem[]

// RAILS AND LIVE GET CLEARED ON LOAD WITHOUT THIS
let firstLoad = true
let secondLoad = true

onBeforeMount(() => {
    if (router.currentRoute.value.query.asset_tag) {
        // get asset tag from url
        let nxid = router.currentRoute.value.query.asset_tag as string
        // Get asset from API
        getAssetByID(http, nxid, (res, err) => {
            if (err) {
                errorHandler(err)
            }
            // Set asset to res
            oldAsset.value = res as AssetSchema
            assetCopy = JSON.parse(JSON.stringify(oldAsset.value))
            // Get parts from api
            getPartsOnAsset(http, oldAsset.value.asset_tag!, (res, err) => {
                if (err) {
                    errorHandler(err)
                }
                partsOnAsset.value = res as LoadedCartItem[]
                partsOnAssetCopy = JSON.parse(JSON.stringify(partsOnAsset.value))
            })
        })
        // Get user inventory from api
        getUserInventory(http, (res, err) => {
            if (err) {
                errorHandler(err)
            }
            inventory.value = res as LoadedCartItem[]
            inventoryCopy = JSON.parse(JSON.stringify(inventory.value))
        })

    }
})

function assetSubmit() {
    // Use create part method from API commands
    let unloadedParts = [] as CartItem[]
    // Iterate through list of parts and strip only the NXID and quantity
    for (const part of partsOnAsset.value) {
        unloadedParts.push({ nxid: part.part.nxid as string, quantity: part.quantity })
    }
    updateAsset(http, oldAsset.value, unloadedParts, (data, err) => {
        if (err) {
            return errorHandler(err)
        }
        router.back()
    })
}

function plusPart(item: LoadedCartItem) {
    if (partsOnAsset.value.indexOf(item) == -1) {
        let found = false
        for (let existingItem of partsOnAsset.value) {
            if (item.part._id == existingItem.part._id) {
                found = true
                item.quantity -= 1
                existingItem.quantity += 1
                break
            }
        }
        if (!found) {
            partsOnAsset.value.push({ part: JSON.parse(JSON.stringify(item.part)), quantity: 1 });
            item.quantity -= 1
        }
        if (item.quantity < 1)
            inventory.value.splice(inventory.value.indexOf(item), 1)
    } else {
        let found = false
        for (let existingItem of inventory.value) {
            if (item.part._id == existingItem.part._id) {
                found = true
                item.quantity += 1
                existingItem.quantity -= 1
                if (existingItem.quantity < 1)
                    inventory.value.splice(inventory.value.indexOf(existingItem), 1)
                break
            }
        }
        if (!found) {
            errorHandler("Not enough parts in your inventory.")
        }
    }
}

function minusPart(item: LoadedCartItem) {
    if (item.quantity > 1) {
        item.quantity -= 1
    } else {
        partsOnAsset.value.splice(partsOnAsset.value.indexOf(item), 1)
    }
    let found = false
    for (let inventoryItem of inventory.value) {
        if (item.part._id == inventoryItem.part._id) {
            inventoryItem.quantity += 1
            found = true
            break
        }
    }
    if (!found) {
        inventory.value.push({ part: item.part, quantity: 1 })
    }
}

function deletePart(part: LoadedCartItem) {
    inventory.value.push(JSON.parse(JSON.stringify(part)))
    partsOnAsset.value.splice(partsOnAsset.value.indexOf(part), 1)
}

function reset() {
    firstLoad = true
    secondLoad = true
    oldAsset.value = JSON.parse(JSON.stringify(assetCopy))
    partsOnAsset.value = JSON.parse(JSON.stringify(partsOnAssetCopy))
    inventory.value = JSON.parse(JSON.stringify(inventoryCopy))
}

// Clear out fields when part type is changed
watch(() => oldAsset.value.asset_type, () => {
    // RAILS AND LIVE GET CLEARED ON LOAD WITHOUT THIS
    if (!firstLoad && !secondLoad) {
        delete oldAsset.value.rails
        delete oldAsset.value.live
        delete oldAsset.value.public_port
        delete oldAsset.value.private_port
        delete oldAsset.value.ipmi_port
        delete oldAsset.value.power_port
        delete oldAsset.value.sid
    }
    if (!firstLoad) {
        secondLoad = false
    }
    firstLoad = false
})

watch(() => oldAsset.value.live, () => {
    // RAILS AND LIVE GET CLEARED ON LOAD WITHOUT THIS
    if (!firstLoad && !secondLoad) {
        if (oldAsset.value.asset_type == "Server" && oldAsset.value.live) {
            oldAsset.value.rails = true
        } else {
            delete oldAsset.value.rails
        }
    }
    if (!firstLoad) {
        secondLoad = false
    }
    firstLoad = false
})
</script>

<template>
    <AssetManagerComponent :http="http" :title="'Edit Asset:'" :submitText="'Update Asset'" :strict="true"
        :oldAsset="oldAsset" :parts="partsOnAsset" :errorHandler="errorHandler" :inventory="inventory"
        :displayMessage="displayMessage" :inventorySearch="true" @assetSubmit="assetSubmit" @plusPart="plusPart"
        @minusPart="minusPart" @deletePart="deletePart" @assetReset="reset" />
</template>
