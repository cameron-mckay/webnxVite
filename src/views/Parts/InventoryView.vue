<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
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
let isCurrentUser = ref(true)
let currentUser = ref({} as User)
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
            for (let user of users.value) {
                // Delete
                if (user._id == store.state.user._id || user.role == 'kiosk')
                    users.value.splice(users.value.indexOf(user), 1)
            }
        })
    }
}

function move(part: PartSchema, quantity: number) {
    // If request is not already in progress - continue
    if (!processingMove) {
        // set flag
        processingMove = true
        // Create from record
        let from = {
            owner: currentUser.value._id,
            building: currentUser.value.building,
            nxid: part.nxid
        } as PartRecord
        // create to record
        let to = {} as PartRecord
        if (isCurrentUser.value) {
            // Move to all techs
            to = {
                owner: 'all',
                nxid: part.nxid,
                building: store.state.user.building,
                location: "All Techs"
            }
            from.location = "Tech Inventory"
        } else {
            // Move to current users inventory
            to = {
                owner: store.state.user._id,
                nxid: part.nxid,
                building: store.state.user.building,
                location: "Tech Inventory"
            }
        }
        // Send request to API
        movePart(http, to, from, quantity, (data, err) => {
            if (err) {
                // Handle errors
                errorHandler(err)
                processingMove = false
            }
            // Search every inventory item
            for (let i = 0; i < items.value.length; i++) {
                // If updated part
                if (items.value[i].part._id === part._id) {
                    // Update quantity
                    items.value[i].quantity -= quantity
                    // If quantity is less than 1
                    if (items.value[i].quantity < 1) {
                        // Remove item from array
                        items.value.splice(i, 1)
                    }
                    // Break from loop
                    break;
                }
            }
            // Update flag
            processingMove = false
            displayMessage("Moved " + quantity + " parts")
        })
    }
}
watch(currentUser, () => {
    isCurrentUser.value = currentUser.value._id === store.state.user._id ? true : false
    loadInventory()
})

setInterval(() => {
    loadInventory()
}, 10000)

</script>
<template>
    <div>
        <div class="flex justify-between">
            <h1 class="text-4xl mb-4 inline-block" v-if="currentUser._id != 'all'">{{ currentUser.first_name }}'s
                Inventory</h1>
            <h1 class="text-4xl mb-4 inline-block" v-else>All Tech's Inventory</h1>
            <select v-model="currentUser" class="inline-block w-40">
                <option :value="store.state.user" selected>Your Inventory</option>
                <option :value="{ _id: 'all' }">All Tech's</option>
                <option v-if="store.state.user.role == 'admin'" v-for="user in users" :value="user">{{
        `${user.first_name} ${user.last_name} `
}}</option>
            </select>
        </div>
        <div v-if="items.length > 0"
            class="grid md:grid-cols-6 grid-cols-5 relative leading-10 text-center p-2 rounded-xl transition font-bold">
            <p class="md:block hidden">NXID</p>
            <p>Manufacturer</p>
            <p>Name</p>
            <p>Location</p>
            <p>Quantity</p>
            <p></p>
        </div>
        <InventoryPartComponent :isCurrentUser="currentUser._id == store.state.user._id ? true : false"
            v-for="item in items" :part="item.part" :quantity="item.quantity" @movePart="move" />
    </div>
</template>
