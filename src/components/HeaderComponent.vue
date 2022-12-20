<template>
    <div class="flex fixed w-full top-0 justify-between bg-zinc-300 shadow-lg z-10">
        <div class="flex justify-center">
            <img class="h-10 p-2" alt="WebNX Logo" src="../assets/logo.png">
            <RouterLink class="transiton leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/parts">
                Parts</RouterLink>
            <RouterLink v-if="store.state.user.role != 'kiosk'"
                class="transiton leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/assets">Assets
            </RouterLink>
            <!-- <RouterLink to="/assets">Assets</RouterLink> -->
            <RouterLink v-if="store.state.user.role == 'kiosk'" v-show="store.state.cart.length > 0"
                class="transition leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/cart">{{
                        `Cart(${store.getters.getTotalNumItems})`
                }}</RouterLink>
            <RouterLink v-if="store.state.user.role == 'kiosk'" v-show="store.state.cart.length < 1"
                class="transition leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/cart">Cart
            </RouterLink>
            <RouterLink v-if="store.state.user.role == 'kiosk'"
                class="transition leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/checkin">Check
                In
            </RouterLink>
            <RouterLink v-if="store.state.user.role != 'kiosk'"
                class="transiton leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/inventory">
                Inventory</RouterLink>
            <RouterLink v-if="store.state.user.role == 'inventory' || store.state.user.role == 'admin'"
                class="transition leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/manage">Manage
            </RouterLink>
            <RouterLink v-if="store.state.user.role == 'admin'"
                class="transition leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/admin">Admin
            </RouterLink>
        </div>
        <div class="flex justify-center">
            <p class="leading-10">{{ store.state.user.first_name + " " + store.state.user.last_name }}</p>
            <img class="h-10 rounded-full p-1" alt="profile picture" :src="profilePicture">
            <a class="leading-10" v-on:click="logout" href="#">Logout</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from 'axios';
import { onBeforeMount } from 'vue';
import { Store } from 'vuex';
import { UserState } from '../plugins/interfaces';
import router from '../router';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>
}
const { http, store } = defineProps<Props>()

let profilePicture = "https://st3.depositphotos.com/6672868/13701/v/600/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"

onBeforeMount(() => {
    store.commit("updateUserData")
})

async function logout() {
    await store.commit("logout", http)
    router.push("/login")
}

</script>
