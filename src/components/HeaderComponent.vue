<template>
  <div>
    <div
      class="header-color fixed top-0 z-20 flex w-full justify-between shadow-md"
    >
      <div class="flex justify-center">
        <svg 
          class="header-button-colors h-10 w-10 p-1 md:hidden"
          v-on:click="toggle"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512">
          <path fill="currentColor" d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"/>
        </svg>

        <img class="h-10 p-2" alt="WebNX Logo" src="../assets/logo.png" />
        <div class="hidden justify-center md:flex">
          <RouterLink
            class="transiton header-button-colors w-20 text-center leading-10"
            to="/parts"
          >
            Parts</RouterLink
          >
          <RouterLink
            v-if="store.state.user.role != 'kiosk'"
            class="transiton header-button-colors w-20 text-center leading-10"
            to="/assets"
          >
            Assets
          </RouterLink>
          <!-- <RouterLink to="/assets">Assets</RouterLink> -->
          <RouterLink
            v-if="store.state.user.role == 'kiosk'"
            v-show="store.state.cart.length > 0"
            class="header-button-colors w-28 text-center leading-10 transition"
            to="/cart"
          >
            {{ `Check Out(${store.getters.getTotalNumItems})` }}</RouterLink
          >
          <RouterLink
            v-if="store.state.user.role == 'kiosk'"
            v-show="store.state.cart.length < 1"
            class="header-button-colors w-20 text-center leading-10 transition"
            to="/cart"
          >
            Check Out
          </RouterLink>
          <RouterLink
            v-if="store.state.user.role == 'kiosk'"
            class="header-button-colors w-20 text-center leading-10 transition"
            to="/checkin"
          >
            Check In
          </RouterLink>
          <RouterLink
            v-if="store.state.user.role != 'kiosk'"
            class="transiton header-button-colors w-20 text-center leading-10"
            to="/inventory"
          >
            Inventory</RouterLink
          >
          <RouterLink
            v-if="
              store.state.user.role == 'inventory' ||
              store.state.user.role == 'admin'
            "
            class="header-button-colors w-20 text-center leading-10 transition"
            to="/manage"
          >
            Manage
          </RouterLink>
          <RouterLink
            v-if="store.state.user.role == 'admin'"
            class="header-button-colors w-20 text-center leading-10 transition"
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
        class="mobile-nav-button"
        to="/parts"
      >
        Parts</RouterLink
      >
      <RouterLink
        v-if="store.state.user.role != 'kiosk'"
        class="mobile-nav-button"
        to="/assets"
      >
        Assets
      </RouterLink>
      <!-- <RouterLink to="/assets">Assets</RouterLink> -->
      <RouterLink
        v-if="store.state.user.role == 'kiosk'"
        v-show="store.state.cart.length > 0"
        class="mobile-nav-button"
        to="/cart"
      >
        {{ `Check Out(${store.getters.getTotalNumItems})` }}</RouterLink
      >
      <RouterLink
        v-if="store.state.user.role == 'kiosk'"
        v-show="store.state.cart.length < 1"
        class="mobile-nav-button"
        to="/cart"
      >
        Check Out
      </RouterLink>
      <RouterLink
        v-if="store.state.user.role == 'kiosk'"
        class="mobile-nav-button"
        to="/checkin"
      >
        Check In
      </RouterLink>
      <RouterLink
        v-if="store.state.user.role != 'kiosk'"
        class="mobile-nav-button"
        to="/inventory"
      >
        Inventory</RouterLink
      >
      <RouterLink
        v-if="
          store.state.user.role == 'inventory' ||
          store.state.user.role == 'admin'
        "
        class="mobile-nav-button"
        to="/manage"
      >
        Manage
      </RouterLink>
      <RouterLink
        v-if="store.state.user.role == 'admin'"
        class="mobile-nav-button"
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
