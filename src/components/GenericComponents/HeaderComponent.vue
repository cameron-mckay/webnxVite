<template>
  <div>
    <div
      id="header"
      class="header-color fixed top-0 z-20 flex w-full justify-between shadow-md"
    >
      <div class="flex justify-center shrink-0">
        <!-- Hamburger nav -->
        <svg
          class="header-button-colors h-10 w-10 shrink-0 p-2"
          v-if="overflow"
          v-on:click="toggle"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path
            v-if="!showMenu"
            fill="currentColor"
            d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32 14.3 32 32z"
          />
          <path
            v-else
            fill="currentColor"
            stroke="currentColor"
            d="M0 256a56 56 0 1 1 112 0A56 56 0 1 1 0 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"
          />
        </svg>
        <!-- Header logo -->
        <RouterLink
          to="/"
          class="shrink-0"
        >
          <img
            class="h-10 w-full p-2"
            alt="WebNX Logo"
            src="../../assets/logo.webp"
          />
        </RouterLink>
        <!-- Desktop nav -->
        <div class="justify-center flex"
          :class="{ 'opacity-0': hide_text }"
          v-if="!overflow"
        >
          <RouterLink
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/parts"
          >
            Parts
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('create_build_kit')||store.state.user.roles?.includes('request_build_kit')||store.state.user.roles?.includes('claim_build_kit')||store.state.user.roles?.includes('is_kiosk')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/buildKit/search"
          >
            Build Kits
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('view_assets')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/assets"
          >
            Assets
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('view_pallets')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/pallets"
          >
            Pallets
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('view_boxes')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/boxes"
          >
            Boxes
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('manage_orders')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/orders"
          >
            Orders
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('request_parts')||store.state.user.roles?.includes('fulfill_part_requests')"
            v-show="store.state.parts.size > 0"
            class="header-button-colors w-36 text-center leading-10 transition"
            to="/requestParts"
          >
            Request Parts ({{ store.getters.getTotalNumItems }})
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('request_parts')||store.state.user.roles?.includes('fulfill_part_requests')"
            v-show="store.state.parts.size < 1"
            class="header-button-colors w-36 text-center leading-10 transition"
            to="/requestParts"
          >
            Request Parts
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('fulfill_part_requests')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/clerk/partRequests"
          >
            Requests
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('is_kiosk')"
            v-show="store.state.parts.size > 0"
            class="header-button-colors w-28 text-center leading-10 transition"
            to="/cart"
          >
            {{ `Check Out(${store.getters.getTotalNumItems})` }}
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('is_kiosk')"
            v-show="store.state.parts.size < 1"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/cart"
          >
            Check Out
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('is_kiosk')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/checkin"
          >
            Check In
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('own_parts')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/inventory"
          >
            Inventory
          </RouterLink>
          <RouterLink
            v-if="!store.state.user.roles?.includes('is_kiosk')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/avail"
          >
            Available
          </RouterLink>
          <RouterLink
            v-if="store.state.user.roles?.includes('sell_on_ebay')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/ebay/sell"
          >
            eBay
          </RouterLink>
            <RouterLink
            v-if="store.state.user.roles?.includes('view_manage_menu')"
            class="header-button-colors w-24 text-center leading-10 transition"
            to="/manage"
          >
            Manage
          </RouterLink>
        </div>
      </div>
      <div class="flex">

        <RouterLink
          class="flex header-button-colors"
          to="/notifications"
        >
          <p
            v-show="store.state.notificationCount > 0"
            class="text-center leading-10 transition pl-2 select-none"
          >
            {{ store.state.notificationCount }}
          </p>
          <SVGBell
            v-if="store.state.notificationCount == 0"
            class="h-10 w-10 p-2 shrink-0"
          />
          <SVGBellSolid
            v-else
            class="h-10 w-10 p-2 shrink-0"
          />
        </RouterLink>
        <div
          class="header-button-colors flex justify-center"
          v-on:click="toggleProfile"
        >
          <p class="mr-2 pl-2 leading-10 block text-nowrap whitespace-nowrap"
            v-if="!overflow"
          >
            {{ store.state.user.first_name + ' ' + store.state.user.last_name }}
          </p>
          <svg
            class="user-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
          >
            <path
              fill="currentColor"
              stroke="currentColor"
              d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
            />
          </svg>
        </div>
      </div>
    </div>
    <div
      class="fixed top-0 z-30 h-full w-full"
      v-on:click="toggleProfile"
      v-if="showProfile"
    ></div>
    <div
      class="pointer-events-none fixed top-10 z-40 flex w-full justify-end"
      v-if="showProfile"
    >
      <div
        class="nx-border-color header-color pointer-events-auto w-fit rounded-bl-md border-l-2 border-b-2 p-2 shadow-lg"
      >
        <p class="cursor-default rounded-md p-2 font-bold md:hidden">
          {{ store.state.user.first_name + ' ' + store.state.user.last_name }}
        </p>
        <div class="flex w-full">
          <p class="cursor-default p-2">Dark Mode</p>
          <div>
            <label
              class="relative my-2 ml-2 mr-5 inline-flex cursor-pointer items-center"
            >
              <input type="checkbox" class="peer sr-only" v-model="dark" />
              <div
                class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-gray-700"
              ></div>
            </label>
          </div>
        </div>
        <p
          class="hover:hover-color cursor-pointer rounded-md p-2"
          v-on:click="revokeLogin"
          href="#"
        >
          Logout
        </p>
      </div>
    </div>
    <!-- Mobile nav menu -->
    <div
      v-if="overflow&&showMenu"
      v-on:click="toggle"
      class="fixed top-12 z-50 flex h-[calc(100%-2.5rem)] w-full flex-col justify-center text-2xl"
    >
      <RouterLink
        class="mobile-nav-button"
        to="/parts"
      >
        Parts
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('create_build_kit')||store.state.user.roles?.includes('request_build_kit')||store.state.user.roles?.includes('claim_build_kit')||store.state.user.roles?.includes('is_kiosk')"
        class="mobile-nav-button"
        to="/buildKit/search"
      >
        Build Kits
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('view_assets')"
        class="mobile-nav-button"
        to="/assets"
      >
        Assets
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('view_pallets')"
        class="mobile-nav-button"
        to="/pallets"
      >
        Pallets
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('view_boxes')"
        class="mobile-nav-button"
        to="/boxes"
      >
        Boxes
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('manage_orders')"
        class="mobile-nav-button"
        to="/orders"
      >
        Orders
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('request_parts')||store.state.user.roles?.includes('fulfill_part_requests')"
        v-show="store.state.parts.size > 0"
        class="mobile-nav-button"
        to="/requestParts"
      >
        Request Parts ({{ store.getters.getTotalNumItems }})
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('request_parts')||store.state.user.roles?.includes('fulfill_part_requests')"
        v-show="store.state.parts.size < 1"
        class="mobile-nav-button"
        to="/requestParts"
      >
        Request Parts
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('fulfill_part_requests')"
        class="mobile-nav-button"
        to="/clerk/partRequests"
      >
        Requests
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('is_kiosk')"
        v-show="store.state.parts.size > 0"
        class="mobile-nav-button"
        to="/cart"
      >
        {{ `Check Out(${store.getters.getTotalNumItems})` }}
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('is_kiosk')"
        v-show="store.state.parts.size < 1"
        class="mobile-nav-button"
        to="/cart"
      >
        Check Out
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('is_kiosk')"
        class="mobile-nav-button"
        to="/checkin"
      >
        Check In
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('own_parts')"
        class="mobile-nav-button"
        to="/inventory"
      >
        Inventory
      </RouterLink>
      <RouterLink
        v-if="!store.state.user.roles?.includes('is_kiosk')"
        class="mobile-nav-button"
        to="/avail"
      >
        Available
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('sell_on_ebay')"
        class="mobile-nav-button"
        to="/ebay/sell"
      >
        eBay
      </RouterLink>
      <RouterLink
        v-if="store.state.user.roles?.includes('view_manage_menu')"
        class="mobile-nav-button"
        to="/manage"
      >
        Manage
      </RouterLink>
      <div class="h-full"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Store } from 'vuex';
import { UserState } from '../../plugins/interfaces';
import SVGBell from './SVG/SVGBell.vue';
import SVGBellSolid from './SVG/SVGBellSolid.vue';
document.documentElement.classList.remove('dark');
interface Props {
  store: Store<UserState>;
  revokeLogin: () => void;
}
const { store, revokeLogin } = defineProps<Props>();

let showMenu = ref(false);
let dark = ref(false);
let showProfile = ref(false);
let overflow = ref(false)
let hide_text = ref(false)
let last_update = Date.now()

function handleResize() {
  let local_update = Date.now()
  last_update = local_update
  overflow.value = true
  setTimeout(()=>{
    if(local_update<last_update)
      return
    hide_text.value = true
    overflow.value = false
    setTimeout(()=>{
      let header = document.getElementById("header")!
      let headerWidth = header.offsetWidth
      let childWidth = 0;
      for (let i = 0; i < header.children?.length; i++) {
        childWidth += header.children.item(i)!.getBoundingClientRect().width
      }
      if(childWidth > headerWidth) {
        overflow.value = true
      }
      hide_text.value = false
    },0)
  },100)
}

onMounted(() => {
  if (
    localStorage.getItem('theme') == 'dark' ||
    (localStorage.getItem('theme') == null &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    dark.value = true;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', '#18181b');
    // Fixes weird login bug
    if (!document.documentElement.classList.contains('dark'))
      document.documentElement.classList.add('dark');
  } else {
    dark.value = false;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', '#d1d5db');
  }
  // Enable watcher
  window.addEventListener('resize', handleResize)
  setTimeout(handleResize,100)
  watch(dark, () => {
    updateTheme();
  });
});

function toggle() {
  showMenu.value = !showMenu.value;
  // Prevent overlapping
  if (showMenu.value) showProfile.value = false;
}

function toggleProfile() {
  showProfile.value = !showProfile.value;
  // Prevent overlapping
  if (showProfile.value) showMenu.value = false;
}

function updateTheme() {
  // Check status of switch
  if (dark.value) {
    // Add dark mode class to document
    document.documentElement.classList.add('dark');
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', '#18181b');
    // Save preference to localStorage

    localStorage.setItem('theme', 'dark');
  } else {
    // Remove dark mode class from document
    document.documentElement.classList.remove('dark');
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', '#d1d5db');
    // Save preference to localStorage
    localStorage.setItem('theme', 'light');
  }
}
</script>
