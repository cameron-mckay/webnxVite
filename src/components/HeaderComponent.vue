<template>
  <div>
    <div
      class="fixed top-0 z-10 flex w-full justify-between bg-gray-300 shadow-lg"
    >
      <div class="flex justify-center">
        <img
          class="h-10 w-10 p-1 hover:bg-zinc-400 active:bg-zinc-500 md:hidden"
          v-on:click="toggle"
          src="../assets/bars-solid.svg"
        />
        <img class="h-10 p-2" alt="WebNX Logo" src="../assets/logo.png" />
        <div class="hidden justify-center md:flex">
          <RouterLink
            class="transiton w-20 text-center leading-10 hover:bg-zinc-400 active:bg-zinc-500"
            to="/parts"
          >
            Parts</RouterLink
          >
          <RouterLink
            v-if="store.state.user.role != 'kiosk'"
            class="transiton w-20 text-center leading-10 hover:bg-zinc-400 active:bg-zinc-500"
            to="/assets"
          >
            Assets
          </RouterLink>
          <!-- <RouterLink to="/assets">Assets</RouterLink> -->
          <RouterLink
            v-if="store.state.user.role == 'kiosk'"
            v-show="store.state.cart.length > 0"
            class="w-28 text-center leading-10 transition hover:bg-zinc-400 active:bg-zinc-500"
            to="/cart"
          >
            {{ `Check Out(${store.getters.getTotalNumItems})` }}</RouterLink
          >
          <RouterLink
            v-if="store.state.user.role == 'kiosk'"
            v-show="store.state.cart.length < 1"
            class="w-20 text-center leading-10 transition hover:bg-zinc-400 active:bg-zinc-500"
            to="/cart"
          >
            Check Out
          </RouterLink>
          <RouterLink
            v-if="store.state.user.role == 'kiosk'"
            class="w-20 text-center leading-10 transition hover:bg-zinc-400 active:bg-zinc-500"
            to="/checkin"
          >
            Check In
          </RouterLink>
          <RouterLink
            v-if="store.state.user.role != 'kiosk'"
            class="transiton w-20 text-center leading-10 hover:bg-zinc-400 active:bg-zinc-500"
            to="/inventory"
          >
            Inventory</RouterLink
          >
          <RouterLink
            v-if="
              store.state.user.role == 'inventory' ||
              store.state.user.role == 'admin'
            "
            class="w-20 text-center leading-10 transition hover:bg-zinc-400 active:bg-zinc-500"
            to="/manage"
          >
            Manage
          </RouterLink>
          <RouterLink
            v-if="store.state.user.role == 'admin'"
            class="w-20 text-center leading-10 transition hover:bg-zinc-400 active:bg-zinc-500"
            to="/admin"
          >
            Admin
          </RouterLink>
        </div>
      </div>
      <div class="flex justify-center">
        <p class="leading-10">
          {{ store.state.user.first_name + " " + store.state.user.last_name }}
        </p>
        <img
          class="h-10 rounded-full p-1"
          alt="profile picture"
          :src="profilePicture"
        />
        <a class="leading-10" v-on:click="logout" href="#">Logout</a>
      </div>
    </div>
    <div
      v-if="showMenu"
      v-on:click="toggle"
      class="fixed top-10 z-50 flex h-[calc(100%-2.5rem)] w-full flex-col justify-center text-2xl md:hidden"
    >
      <RouterLink
        class="transiton bg-green-400 p-4 pl-10 leading-10 hover:bg-green-500 active:bg-green-600"
        to="/parts"
      >
        Parts</RouterLink
      >
      <RouterLink
        v-if="store.state.user.role != 'kiosk'"
        class="transiton bg-green-400 p-4 pl-10 leading-10 hover:bg-green-500 active:bg-green-600"
        to="/assets"
      >
        Assets
      </RouterLink>
      <!-- <RouterLink to="/assets">Assets</RouterLink> -->
      <RouterLink
        v-if="store.state.user.role == 'kiosk'"
        v-show="store.state.cart.length > 0"
        class="bg-green-400 p-4 pl-10 leading-10 transition hover:bg-green-500 active:bg-green-600"
        to="/cart"
      >
        {{ `Check Out(${store.getters.getTotalNumItems})` }}</RouterLink
      >
      <RouterLink
        v-if="store.state.user.role == 'kiosk'"
        v-show="store.state.cart.length < 1"
        class="bg-green-400 p-4 pl-10 leading-10 transition hover:bg-green-500 active:bg-green-600"
        to="/cart"
      >
        Check Out
      </RouterLink>
      <RouterLink
        v-if="store.state.user.role == 'kiosk'"
        class="bg-green-400 p-4 pl-10 leading-10 transition hover:bg-green-500 active:bg-green-600"
        to="/checkin"
      >
        Check In
      </RouterLink>
      <RouterLink
        v-if="store.state.user.role != 'kiosk'"
        class="transiton bg-green-400 p-4 pl-10 leading-10 hover:bg-green-500 active:bg-green-600"
        to="/inventory"
      >
        Inventory</RouterLink
      >
      <RouterLink
        v-if="
          store.state.user.role == 'inventory' ||
          store.state.user.role == 'admin'
        "
        class="active:bg-green-60 bg-green-400 p-4 pl-10 leading-10 transition hover:bg-green-500"
        to="/manage"
      >
        Manage
      </RouterLink>
      <RouterLink
        v-if="store.state.user.role == 'admin'"
        class="bg-green-400 p-4 pl-10 leading-10 transition hover:bg-green-500 active:bg-green-600"
        to="/admin"
      >
        Admin
      </RouterLink>
      <div class="h-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AxiosInstance } from "axios";
import { onBeforeMount, ref } from "vue";
import { Store } from "vuex";
import { UserState } from "../plugins/interfaces";
import router from "../router";

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
}
const { http, store } = defineProps<Props>();

let showMenu = ref(false);
let profilePicture =
  "https://st3.depositphotos.com/6672868/13701/v/600/depositphotos_137014128-stock-illustration-user-profile-icon.jpg";

onBeforeMount(() => {
  store.commit("updateUserData");
});

async function logout() {
  await store.commit("logout", http);
  router.push("/login");
}

function toggle() {
  showMenu.value = !showMenu.value;
}
</script>
