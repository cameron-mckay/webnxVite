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
let resetting = false

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
            // Save a copy for reset value
            assetCopy = JSON.parse(JSON.stringify(oldAsset.value))
            // Register watchers
            watch(() => oldAsset.value.asset_type, () => {
                if (!resetting) {
                    delete oldAsset.value.rails
                    delete oldAsset.value.live
                    delete oldAsset.value.public_port
                    delete oldAsset.value.private_port
                    delete oldAsset.value.ipmi_port
                    delete oldAsset.value.power_port
                    delete oldAsset.value.sid
                } else {
                    resetting = false
                }
            })
            watch(() => oldAsset.value.live, () => {
                if (!resetting) {
                    // If server and live, asset has rails
                    if (oldAsset.value.asset_type == "Server" && oldAsset.value.live) {
                        oldAsset.value.rails = true
                    } else {
                        delete oldAsset.value.rails
                    }
                }
            })
            // Get parts from api
            getPartsOnAsset(http, oldAsset.value.asset_tag!, (res, err) => {
                if (err) {
                    errorHandler(err)
                }
                // Set reactive array to API response
                partsOnAsset.value = res as LoadedCartItem[]
                // Save a copy for reset value
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
    console.log(oldAsset.value)
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
    // If part is not already in array (checks by reference not by value)
    if (partsOnAsset.value.indexOf(item) == -1) {
        // Set sentinel value
        let found = false
        // Loop through all parts on asset
        for (let existingItem of partsOnAsset.value) {
            // Check if part matches by value
            if (item.part._id == existingItem.part._id) {
                found = true
                item.quantity -= 1
                existingItem.quantity += 1
                break
            }
        }
        // If part isn't found, push it to the array
        if (!found) {
            partsOnAsset.value.push({ part: JSON.parse(JSON.stringify(item.part)), quantity: 1 });
            // Decrement quantity
            item.quantity -= 1
        }
        // If item quantity is now less than 1, splice it from the inventory array
        if (item.quantity < 1)
            inventory.value.splice(inventory.value.indexOf(item), 1)
    } else {
        // Set sentinel value
        let found = false
        // loop through inventory
        for (let existingItem of inventory.value) {
            // Find part that matches by value
            if (item.part._id == existingItem.part._id) {
                found = true
                // Increment item on asset
                item.quantity += 1
                // Decrement item in inventory
                existingItem.quantity -= 1
                // If inventory quanity is less than 1, splice it from the array
                if (existingItem.quantity < 1)
                    inventory.value.splice(inventory.value.indexOf(existingItem), 1)
                // Exit the loop
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
    resetting = true
    oldAsset.value = JSON.parse(JSON.stringify(assetCopy))
    partsOnAsset.value = JSON.parse(JSON.stringify(partsOnAssetCopy))
    inventory.value = JSON.parse(JSON.stringify(inventoryCopy))
}
</script>

<template>
    <AssetManagerComponent :http="http" :title="'Edit Asset:'" :submitText="'Update Asset'" :strict="true"
        :oldAsset="oldAsset" :parts="partsOnAsset" :errorHandler="errorHandler" :inventory="inventory"
        :displayMessage="displayMessage" :inventorySearch="true" @assetSubmit="assetSubmit" @plusPart="plusPart"
        @minusPart="minusPart" @deletePart="deletePart" @assetReset="reset" />
</template>
