<script setup lang="ts">

import { onBeforeMount, ref, watch } from 'vue';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import InventoryPartComponent from '../../components/InventoryPartComponent.vue';
import { checkin } from '../../plugins/dbCommands/partManager';
import { getAllUsers, getUserInventoryByID } from '../../plugins/dbCommands/userManager';
import type { CartItem, LoadedCartItem, PartSchema, User, UserState } from '../../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

let users = ref([] as User[])
let currentUser = ref({} as User)
let inventory = ref([] as LoadedCartItem[])
let checkInList = ref([] as LoadedCartItem[])

onBeforeMount(() => {
    loadUsers()
})

function loadUsers() {
    getAllUsers(http, (data, err) => {
        if (err) {
            return errorHandler(err)
        }
        users.value = data as User[]
        users.value.push({ first_name: 'All', last_name: 'Techs', _id: 'all' })
        for (let user of users.value) {
            if (user.role == 'kiosk') {
                users.value.splice(users.value.indexOf(user), 1)
            }
        }
    })
}

async function loadInventory() {
    getUserInventoryByID(http, currentUser.value._id!, (data, err) => {
        if (err)
            return errorHandler(err)
        inventory.value = data as LoadedCartItem[]
        checkInList.value = [] as LoadedCartItem[]
    })
}


function localCheckin() {
    let unloadedParts = [] as CartItem[]
    for (let item of checkInList.value) {
        unloadedParts.push({ nxid: item.part.nxid!, quantity: item.quantity })
    }
    checkin(http, unloadedParts, currentUser.value._id!, (data, err) => {
        if (err) {
            return errorHandler(err)
        }
        setTimeout(() => {
            displayMessage("Successfully checked in.")
            loadInventory()
        }, 500)
    })
}

function moveToInventory(part: PartSchema, quantity: number) {
    let item = {} as LoadedCartItem
    for (let checkin_item of checkInList.value) {
        if (part.nxid == checkin_item.part.nxid) {
            item = checkin_item
            break
        }
    }
    if (item.quantity > 0) {
        item.quantity -= quantity
        for (let inventory_item of inventory.value) {
            if (inventory_item.part.nxid == item.part.nxid) {
                inventory_item.quantity += quantity
                break
            }
        }
        if (item.quantity == 0) {
            checkInList.value.splice(checkInList.value.indexOf(item), 1)
        }
    }
}

function moveToCheckin(part: PartSchema, quantity: number) {
    let item = {} as LoadedCartItem
    for (let inventory_item of inventory.value) {
        if (part.nxid == inventory_item.part.nxid) {
            item = inventory_item
            break
        }
    }
    if (item.quantity > 0) {
        item.quantity -= quantity
        let found = false
        for (let checkin_item of checkInList.value) {
            if (checkin_item.part.nxid == item.part.nxid) {
                found = true
                checkin_item.quantity += quantity
                break
            }
        }
        if (!found) {
            checkInList.value.push({ part: JSON.parse(JSON.stringify(item.part)), quantity })
        }
    }
}

watch(currentUser, () => {
    loadInventory()
})

</script>

<template>
    <form @submit.prevent="localCheckin">
        <div>
            <div class="flex justify-between">
                <h1 class="text-4xl mb-4">Check In:</h1>
                <div class="flex">
                    <p class="leading-[4] mr-2">User: </p>
                    <select required v-model="currentUser" class=" w-60">
                        <option disabled :value="{}"></option>
                        <option v-for="user in users" :value="user">{{ `${user.first_name} ${user.last_name}` }}
                        </option>
                    </select>
                </div>
            </div>
            <div v-if="inventory.length > 0">
                <h1 class="text-4xl mb-4">Your Inventory:</h1>
                <div
                    class="grid md:grid-cols-6 grid-cols-4 relative leading-10 text-center p-2 rounded-xl transition font-bold">
                    <p class="md:block hidden">NXID</p>
                    <p>Manufacturer</p>
                    <p>Name</p>
                    <p class="md:block hidden">Location</p>
                    <p>Quantity</p>
                    <p></p>
                </div>
                <InventoryPartComponent :isCurrentUser="false" v-for="item in inventory" :part="item.part"
                    :quantity="item.quantity" @movePart="moveToCheckin" />

            </div>
            <div v-else-if="JSON.stringify(currentUser) == JSON.stringify({})">
                <p>Please select a user to get started...</p>
            </div>
            <div v-else>
                <p>Inventory is empty...</p>
            </div>
            <div v-if="checkInList.length > 0">
                <h1 class="text-4xl mb-4">Checking In:</h1>
                <div
                    class="grid md:grid-cols-6 grid-cols-4 relative leading-10 text-center p-2 rounded-xl transition font-bold">
                    <p class="md:block hidden">NXID</p>
                    <p>Manufacturer</p>
                    <p>Name</p>
                    <p class="md:block hidden">Location</p>
                    <p>Quantity</p>
                    <p></p>
                </div>
                <InventoryPartComponent :isCurrentUser="true" v-for="item in checkInList" :part="item.part"
                    :quantity="item.quantity" @movePart="moveToInventory" />
                <div class="flex justify-center">
                    <input type="submit" class="submit mx-1" value="Check In">
                </div>
            </div>
        </div>
    </form>
</template>
