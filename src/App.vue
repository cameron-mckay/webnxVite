<template>
  <div>
    <HeaderComponent v-if="store.state.isAuth&&routeConfigured" :http="http" :store="store" :revokeLogin="revokeLogin" />
    <MessageComponent :messages="messages" :errors="errorMessages" />
    <LoaderComponent v-if="!routeConfigured"/>
    <router-view
      v-else
      class="my-16 mx-4 w-[calc(100%-2rem)] text-sm md:mx-auto md:max-w-5xl md:text-base"
      :http="http"
      :store="store"
      :router="router"
      :errorHandler="errorHandler"
      :displayMessage="displayMessage"
      :revokeLogin="revokeLogin"
    />
  </div>
</template>
<script setup lang="ts">
// Vue components
import HeaderComponent from './components/GenericComponents/HeaderComponent.vue';
import MessageComponent from './components/GenericComponents/MessageComponent.vue';

// Import dependencies
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, inject, onMounted, ref, onBeforeMount } from 'vue';
import { NavigationGuardNext, RouteLocationNormalized, useRoute, useRouter } from 'vue-router';
import { injectionKey } from './plugins/axios';
import { checkAuth, getCurrentUser } from './plugins/dbCommands/userManager';
import type { Message, User } from './plugins/interfaces';
import { useStore } from './plugins/store';
import Cacher from './plugins/Cacher';
import LoaderComponent from './components/GenericComponents/LoaderComponent.vue';

// Global instances passed through props
const http = inject<AxiosInstance>(injectionKey)!;
const router = useRouter();
const store = useStore();

let routeConfigured = ref(false)

// Global list of messages for the MessageComponent to render
var messages: Ref<Message[]> = ref([]);
var errorMessages: Ref<Message[]> = ref([]);

// Check theme
onMounted(() => {
  if (
    localStorage.getItem('theme') == 'dark' ||
    (localStorage.getItem('theme') == null &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

function redirect() {
  router.push({ name: 'Parts' }).then(()=>{
    errorHandler('You are not authorized to access this page.');
  });
}

// Before app is created
onBeforeMount(()=>{
  routeConfigured.value = false;
  Cacher.assignAxios(http)
  Cacher.assignRouter(router)
  Cacher.assignStore(store)
  Cacher.validateCache()
  Cacher.assignErrorHandler(errorHandler)
  checkAuth(http, async (data, err) => {
    // If not authenticated
    if (err||data=="You must login to continue.") {
      return firstLoadRevokeLogin()
    }
    Cacher.loadAllUsersFromAPI()
    // If authenticated, set status
    getCurrentUser(http, (data, err) => {
      if (err) {
        // Error occured - update nothing
        store.commit('logout')
        configureRouter()
        return
      }
      // Success - update global user component
      let user = data as User
      store.commit("updateUserData", user)
      displayMessage('Successfully logged in.');
      configureRouter()
    });
  });
})

function checkRoute(to: RouteLocationNormalized, from?: RouteLocationNormalized, next?: NavigationGuardNext) {
  checkAuth(http, (data, err)=>{
    if (store.state.isAuth&&(err||data=="You must login to continue.")) {
      errorHandler("Login expired.")
      return revokeLogin()
    }
    // Clear cache on page change
    if(from&&to.name!=from.name) {
      Cacher.validateCache()
      if(store.state.isAuth) {
        Cacher.loadAllUsersFromAPI()
      }
    }
    // Make sure they are admin for admin routes
    if (!store.state.user.roles?.includes('admin') && /\/admin\/*/.test(to.path)) {
      return redirect()
    }
    if (
      !(store.state.user.roles?.includes('admin')||
      store.state.user.roles?.includes('clerk')||
      store.state.user.roles?.includes('lead')) &&
      (/\/manage\/*/.test(to.path)||
      /\/manage/.test(to.path))
    ) {
      return redirect()
    }
    if (
      !(store.state.user.roles?.includes('admin')||
      store.state.user.roles?.includes('clerk')) &&
      /\/clerk\/*/.test(to.path)
    ) {
      return redirect()
    }
    if (!(store.state.user.roles?.includes('admin')||
      store.state.user.roles?.includes('ebay')) &&
      (/\/ebay\/*/.test(to.path)||
      /\/ebay/.test(to.path))
    ) {
      return redirect()
    }
    // This goes through the matched routes from last to first, finding the closest route with a title.
    // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
    // `/nested`'s will be chosen.
    document.title = `WebNX${to.name?" - "+to.name.toString():""}`;
    if(next)
      next();
  })
}

function configureRouter() {
  checkRoute(router.currentRoute.value)
  router.beforeEach(checkRoute);
  routeConfigured.value = true
}
/**
 * @brief Briefly print an error to an on screen popup
 *
 * @param err
 */
function errorHandler(err: AxiosError | string) {
  // string variable for message text
  let message: string;
  // if error is already a string
  if (typeof err == 'string') {
    message = err;
  }
  // If error is axios error
  else if (err.response) {
    // Cast as string
    message = String(err.response.data);
  }
  // If error is ES error
  else {
    // Cast as string
    message = String(err);
  }
  // Create sentinel value
  let match = false;
  // Reference to message for timeout
  let messageRef: Message;
  // Search through all messages
  for (const existingMessage of errorMessages.value) {
    // If message already exists
    if (message == existingMessage.text) {
      // Increment
      existingMessage.quantity += 1;
      // Set sentinel flag
      match = true;
      // Store reference to message
      messageRef = existingMessage;
    }
  }
  // If message does not exist
  if (!match) {
    // Create new message
    errorMessages.value.push({ text: message, quantity: 1 } as Message);
    // Store reference
    messageRef = errorMessages.value[errorMessages.value.length - 1];
  }
  // Hide after 5 seconds
  setTimeout(() => {
    // If last message
    if (messageRef.quantity < 2) {
      // Delete message
      let i = errorMessages.value.indexOf(messageRef);
      if (i > -1) {
        errorMessages.value.splice(i, 1);
      }
    }
    // If not last message
    else {
      // Decrement count
      messageRef.quantity -= 1;
    }
  }, 5000);
}

/**
 * @brief Briefly display a message in an on screen popup
 *
 * @param message
 */
function displayMessage(message: string) {
  // Sentinel value
  let match = false;
  // Reference to message for timeout
  let messageRef: Message;
  // Search all messages
  for (const existingMessage of messages.value) {
    // If message already exists
    if (message == existingMessage.text) {
      // Increment existing message
      existingMessage.quantity += 1;
      // Set sentinel value
      match = true;
      // Store a reference so we can delete or decrement after 5 seconds
      messageRef = existingMessage;
    }
  }
  if (!match) {
    // If message doesn't already exist - create and push new
    messages.value.push({ text: message, quantity: 1 } as Message);
    // Keep a references so we can delete or decrement after 5 seconds
    messageRef = messages.value[messages.value.length - 1];
  }
  // Hide after 5 seconds
  setTimeout(() => {
    // If last message - delete
    if (messageRef.quantity < 2) {
      let i = messages.value.indexOf(messageRef);
      if (i > -1) {
        messages.value.splice(i, 1);
      }
    }
    // If not last message
    else {
      messageRef.quantity -= 1;
    }
  }, 5000);
}

function revokeLogin() {
  // set status
  store.commit('logout', http);
  // redirect
  if (router.currentRoute.value.name != 'Register'&&router.currentRoute.value.name != 'Forgot Password') {
    router.replace({ query: undefined }).then(()=>{
      router.push({ name: 'Login' })
    })
  }
}

function firstLoadRevokeLogin() {
  // set status
  store.commit('logout', http);
  // redirect
  if (router.currentRoute.value.name != 'Register'&&router.currentRoute.value.name != 'Forgot Password') {
    router.replace({ query: undefined }).then(()=>{
      router.push({ name: 'Login' }).then(()=>{
        configureRouter();
      })
    })
  } else {
    configureRouter();
  }
}

</script>
