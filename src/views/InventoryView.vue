<script setup lang="ts">
import InventoryPartComponent from '../components/InventoryPartComponent.vue';
import { getUserInventory, getAllTechsInventory, getAllUsers, getUserInventoryByID } from '../plugins/dbCommands/userManager';
import { LoadedCartItem, User } from '../plugins/interfaces';
import { ref, onMounted, watch } from 'vue'

import type { AxiosInstance, AxiosError } from 'axios';
import type { Store } from 'vuex'
import type { Router } from 'vue-router';
import type { UserState } from '../plugins/interfaces';

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

function loadInventory() {
    getUserInventoryByID(http, currentUser.value._id!, (data, err)=>{
        if(err) {
            return errorHandler(err)
        }
        items.value = data as LoadedCartItem[]
    })
}

onMounted(async ()=>{
    if(store.state.user._id == undefined) {
        setTimeout(firstLoad, 500)
    } else {
        firstLoad()
    }
})

function firstLoad() {
    currentUser.value = store.state.user
    loadInventory()
    if(store.state.user.admin) {
        console.log("ADMIn")
        getAllUsers(http, (data, err) => {
            if(err) {
                return errorHandler(err)
            }
            users.value = data as User[]
        })
    }
}


watch(currentUser, ()=>{
    isCurrentUser.value = currentUser.value._id === store.state.user._id? true:false
    loadInventory()
})

</script>
<template>
    <div>
        <div class="flex justify-between">
            <h1 class="text-4xl mb-4 inline-block" v-if="currentUser._id != 'all'">{{ currentUser.first_name }}'s Inventory</h1>
            <h1 class="text-4xl mb-4 inline-block" v-else>All Tech's Inventory</h1>
            <select v-model="currentUser" class="inline-block w-40">
                <option :value="store.state.user" selected>My Inventory</option>
                <option :value="{_id: 'all'}">All Tech's</option>
                <option v-if="store.state.user.admin" v-for="user in users" :value="user">{{ `${user.first_name} ${user.last_name} `}}</option>
            </select>
        </div>
        <InventoryPartComponent :isCurrentUser="currentUser._id == store.state.user._id? true : false " v-for="item in items" :part="item.part" :quantity="item.quantity"/>
    </div>
</template>