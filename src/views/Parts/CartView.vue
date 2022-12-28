<script setup lang="ts">
import CartItemComponent from '../../components/CartItemComponent.vue';

import { onBeforeMount, ref, Ref } from 'vue';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import { checkout, getPartByID } from '../../plugins/dbCommands/partManager';
import { getAllUsers } from '../../plugins/dbCommands/userManager';
import type { LoadedCartItem, PartSchema, User, UserState } from '../../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

let parts: Ref<Array<LoadedCartItem>> = ref([])
let users = ref([] as User[])
let currentUser = ref({} as User)

onBeforeMount(() => {
    loadCart()
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

async function loadCart() {
    parts.value = []
    for (const item of store.state.cart) {
        getPartByID(http, item.nxid, store.state.user.building!, "Parts Room", (data, err) => {
            if (err) {
                return errorHandler(err)
            }
            let part = data as PartSchema
            parts.value.push({ part, quantity: store.getters.getQuantity(part.nxid) })
        })
    }
}

async function deletePart(id: string) {
    store.commit("removeAll", id);
    loadCart()
}

async function addOne(id: string) {
    getPartByID(http, id, store.state.user.building!, "Parts Room", (data, err) => {
        let part = data as PartSchema
        if (part.quantity! > store.getters.getQuantity(id)) {
            store.commit("addOne", id)
        } else {
            errorHandler("Not enough stock.")
        }
    })
}

async function subOne(id: string) {
    store.commit("removeOne", id)
    if (store.getters.getQuantity(id) == 0) {
        loadCart()
    }
}

function localCheckout() {
    checkout(http, store.state.cart, currentUser.value._id!, (data, err) => {
        if (err) {
            return errorHandler(err)
        }
        displayMessage("Successfully checked out.")
        store.commit("emptyCart")
        loadCart()
    })
}

</script>

<template>
    <form @submit.prevent="localCheckout">
        <div v-if="parts.length != 0">

            <div class="flex justify-between">
                <h1 class="text-4xl mb-4">Check Out:</h1>
                <div class="flex">
                    <p class="leading-[4] mr-2">User: </p>
                    <select required v-model="currentUser" class=" w-60">
                        <option disabled :value="''"></option>
                        <option v-for="user in users" :value="user">{{ `${user.first_name} ${user.last_name}` }}
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
            <CartItemComponent v-for="item in parts" v-bind:key="item.part.nxid" :part="item.part"
                :quantity="item.quantity" @plus='addOne(item.part._id!)' @minus='subOne(item.part.nxid!)'
                @delete='deletePart(item.part.nxid!)' />
            <div class="flex justify-center">
                <input type="submit" class="submit mx-1" value="Check Out">
                <!-- <input type="button" @click="localCheckin" class="submit mx-1" value="Check In"> -->
            </div>
        </div>
        <div v-else>
            <h1 class="text-4xl mb-4">Check Out:</h1>
            <p>List is empty...</p>
        </div>
    </form>
</template>
