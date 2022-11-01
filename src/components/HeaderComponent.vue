<template>
    <div class="flex fixed w-full top-0 justify-between bg-zinc-300 shadow-lg z-50">
        <div class="flex justify-center">
            <img class="h-10 p-2" alt="WebNX Logo" src="../assets/logo.png">
            <RouterLink class="transiton leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/parts">Parts
            </RouterLink>
            <!-- <RouterLink to="/assets">Assets</RouterLink> -->
            <RouterLink class="transition leading-10 hover:bg-zinc-400 active:bg-zinc-500 w-20 text-center" to="/cart">Cart
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
import { useStore } from '../plugins/store'
import { onBeforeMount } from 'vue'
import type { AxiosInstance } from 'axios';
import router from '../router';
const store = useStore();
interface Props {
    http: AxiosInstance
}
const { http } = defineProps<Props>()

var profilePicture = "https://st3.depositphotos.com/6672868/13701/v/600/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"

onBeforeMount(() => {
    store.commit("updateUserData")
})

async function logout() {
    await store.commit("logout", http)
    router.push("/login")
}

</script>