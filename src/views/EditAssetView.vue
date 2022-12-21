<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref, watch } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetManagerComponent from '../components/AssetManagerComponent.vue';
import { getAssetByID, getPartsOnAsset, updateAsset } from '../plugins/dbCommands/assetManager';
import { getUserInventory } from '../plugins/dbCommands/userManager';
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
let inventory = ref([] as LoadedCartItem[])

// RAILS AND LIVE GET CLEARED ON LOAD WITHOUT THIS
let firstLoad = true
let secondLoad = true

onBeforeMount(() => {
    if (router.currentRoute.value.query.asset_tag) {
        let nxid = router.currentRoute.value.query.asset_tag as string
        console.log(nxid)
        getAssetByID(http, nxid, (res, err) => {
            if (err) {
                errorHandler(err)
            }
            let rawRes = JSON.parse(JSON.stringify(res)) as AssetSchema
            console.log(rawRes)
            oldAsset.value = JSON.parse(JSON.stringify(rawRes))
            oldAsset.value.rails = rawRes.rails
            console.log(oldAsset.value.rails)
            oldAsset.value.live = rawRes.live
            console.log(rawRes.live)
            console.log(typeof (JSON.parse(JSON.stringify(res)).live))
            getPartsOnAsset(http, oldAsset.value.asset_tag!, (res, err) => {
                if (err) {
                    errorHandler(err)
                }
                partsOnAsset.value = res as LoadedCartItem[]
            })
        })
        getUserInventory(http, (res, err) => {
            if (err) {
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

function addToAsset(item: LoadedCartItem) {
    console.log()
    let found = false
    if (item.quantity >= 1) {
        item.quantity -= 1
        for (let existingItem of partsOnAsset.value) {
            if (existingItem.part.nxid == item.part.nxid) {
                found = true
                existingItem.quantity += 1;
            }
        }
        if (!found) {
            displayMessage(`Added ${item.part.manufacturer} ${item.part.name} to asset`)
            partsOnAsset.value.push({ part: JSON.parse(JSON.stringify(item.part)), quantity: 1 })
        }
        if (item.quantity < 1) {
            inventory.value.splice(inventory.value.indexOf(item), 1)
        }
    } else {
        errorHandler("Not enough in inventory")
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
    for (let i = 0; i < partsOnAsset.value.length; i++) {
        if (part.part._id == partsOnAsset.value[i].part._id) {
            partsOnAsset.value.splice(i, 1)
            break;
        }
    }
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
        :displayMessage="displayMessage" :inventorySearch="true" @assetSubmit="assetSubmit" @plusPart="addToAsset"
        @minusPart="minusPart" @deletePart="deletePart" />
</template>
