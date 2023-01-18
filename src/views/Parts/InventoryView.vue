<script setup lang="ts">
import { Ref, onMounted, ref, watch } from 'vue';
import InventoryPartComponent from '../../components/InventoryPartComponent.vue';
import { movePart } from '../../plugins/dbCommands/partManager';
import { getAllUsers, getUserInventoryByID } from '../../plugins/dbCommands/userManager';
import { LoadedCartItem, PartRecord, PartSchema, User } from '../../plugins/interfaces';

import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

let items = ref([] as LoadedCartItem[])
let transferList = ref([] as LoadedCartItem[])
let isCurrentUser = ref(true)
let currentUser = ref({} as User)
let transferUser = ref({} as User)
let users = ref([] as User[])
let processingMove = false

function loadInventory() {
    // Get user inventory
    getUserInventoryByID(http, currentUser.value._id!, (data, err) => {
        if (err) {
            return errorHandler(err)
        }
        // Push to reactive var
        items.value = data as LoadedCartItem[]
    })
}

onMounted(async () => {
    // Check if store is loaded
    if (store.state.user._id == undefined) {
        // Wait .5 seconds if not loaded
        setTimeout(firstLoad, 500)
    } else {
        // Loaded - continue
        firstLoad()
    }
})

function firstLoad() {
    // Set user to current user
    currentUser.value = store.state.user
    // Load inventory
    loadInventory()
    // If admin - get other users
    if (store.state.user.role == 'admin') {
        // Get all userse
        getAllUsers(http, (data, err) => {
            if (err) {
                return errorHandler(err)
            }
            // Push to reactive var
            users.value = data as User[]
            // Find and remove current user or kiosks
            for (let i = 0; i < users.value.length; i++) {
                // Delete
                if (users.value[i]._id == store.state.user._id || users.value[i].role == "kiosk") {
                    // remove current user and kiosk
                    users.value.splice(i, 1)
                    // Change the index since array size has changed
                    i--
                }
            }
        })
    }
}

function moveFromInventory (part: PartSchema, quantity: number) {
    move(items, transferList, part, quantity)
}

function moveFromTransferList (part: PartSchema, quantity: number) {
    move(transferList, items, part, quantity)
}

function move(array1: Ref<LoadedCartItem[]>, array2: Ref<LoadedCartItem[]>, part: PartSchema, quantity: number) {
    // Find the part in the list
    for (let item of array1.value) {
        // Check if nxid matches
        if (item.part.nxid == part.nxid) {
            // Found, change quantity
            item.quantity -= quantity;
            // Splice if quantity less than 1
            if (item.quantity < 1)
                array1.value.splice(array1.value.indexOf(item), 1)
            // Early return from loop
            break
        }
    }
    // Set index to sentinel value
    let index = -1
    // Loop through second array
    for (let item of array2.value) {
        // Check if nxid matches
        if (item.part.nxid == part.nxid) {
            // Update index when found
            index = array2.value.indexOf(item)
            // Early return from loop
            break
        }
    }
    // If found, add quantity to existing item
    if (index != -1) 
        array2.value[index].quantity += quantity
    // If not found, push new item to array
    else
        array2.value.push({part, quantity})
}

function submit() {
    if (!processingMove) {
        processingMove = true
        let from = {
            owner: currentUser.value._id,
            building: currentUser.value.building,
            nxid: ""
        }
        let to = {
            owner: transferUser.value._id,
            building: transferUser.value.building,
            nxid: ""
        } as PartRecord
        for (let item of transferList.value) {
            from.nxid = item.part.nxid!
            to.nxid = item.part.nxid!
            movePart(http, to, from, item.quantity, (data, err) => {
                if (err) {
                    // Handle errors
                    errorHandler(err)
                }
            })
        }
        transferList.value = []
        processingMove = false
    }
}

watch(currentUser, () => {
    isCurrentUser.value = currentUser.value._id === store.state.user._id ? true : false
    loadInventory()
    transferList.value = []
    transferUser.value = currentUser.value._id != store.state.user._id ? store.state.user : { _id: 'all', building: store.state.user.building }
})

</script>
<template>
    <div>
        <form @submit.prevent="submit">
        <div>
            <div class="flex justify-between">
                <h1 class="text-4xl mb-4 inline-block" v-if="currentUser._id != 'all'">{{ currentUser.first_name }}'s
                Inventory</h1>
            <h1 class="text-4xl mb-4 inline-block" v-else>All Tech's Inventory</h1>
                <div class="flex">
                    <p class="leading-[4] mr-2">User: </p>
                    <select required v-model="currentUser" class=" w-60">
                        <option disabled :value="{}"></option>
                        <option :value="store.state.user" selected>Your Inventory</option>
                        <option :value="{ _id: 'all' }">All Tech's</option>
                        <option v-for="user in users" :value="user">{{ `${user.first_name} ${user.last_name}` }}
                        </option>
                    </select>
                </div>
            </div>
            <div v-if="items.length > 0">
                
                <div
                    class="grid md:grid-cols-6 grid-cols-4 relative leading-10 text-center p-2 rounded-xl transition font-bold">
                    <p class="md:block hidden">NXID</p>
                    <p>Manufacturer</p>
                    <p>Name</p>
                    <p class="md:block hidden">Location</p>
                    <p>Quantity</p>
                    <p></p>
                </div>
                <InventoryPartComponent :isCurrentUser="false" v-for="item in items" :part="item.part"
                    :quantity="item.quantity" @movePart="moveFromInventory" />

            </div>
            <div v-else-if="JSON.stringify(currentUser) == JSON.stringify({})">
                <p>Please select a user to get started...</p>
            </div>
            <div v-else>
                <p>Inventory is empty...</p>
            </div>
            <div v-if="transferList.length > 0">
                <div class="flex justify-between">
                    <h1 class="text-4xl mb-4 inline-block">Transfer List</h1>
                    <div class="flex">
                        <p class="leading-[4] mr-2">To: </p>
                        <select required v-model="transferUser" class=" w-60">
                            <option v-if="currentUser._id != store.state.user._id" :value="store.state.user" :disabled="store.state.user._id==currentUser._id" selected>Your Inventory</option>
                            <option v-if="currentUser._id != 'all'" :value="{ _id: 'all', building: store.state.user.building }" :disabled="currentUser._id=='all'" selected>All Tech's</option>
                            <option v-if="store.state.user.role == 'admin'||store.state.user.role == 'clerk'" v-for="user in users" :disabled="user._id==currentUser._id" :value="user">{{ `${user.first_name} ${user.last_name}` }}
                            </option>
                        </select>
                    </div>
                </div>  
                <div
                    class="grid md:grid-cols-6 grid-cols-4 relative leading-10 text-center p-2 rounded-xl transition font-bold">
                    <p class="md:block hidden">NXID</p>
                    <p>Manufacturer</p>
                    <p>Name</p>
                    <p class="md:block hidden">Location</p>
                    <p>Quantity</p>
                    <p></p>
                </div>
                <InventoryPartComponent :isCurrentUser="true" v-for="item in transferList" :part="item.part"
                    :quantity="item.quantity" @movePart="moveFromTransferList" />
                <div class="flex justify-center">
                    <input type="submit" class="submit mx-1" value="Move Parts">
                </div>
            </div>
        </div>
    </form>
    </div>
</template>
