<template>
  <div>
    <HeaderComponent v-if="store.state.isAuth&&routeConfigured" :http="http" :store="store" :revokeLogin="revokeLogin" />
    <NotificationComponent :notifications="notifications"/>
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
import NotificationComponent from './components/GenericComponents/NotificationComponent.vue';
// Import dependencies
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, inject, onMounted, ref, onBeforeMount } from 'vue';
import { NavigationGuardNext, RouteLocationNormalized, useRoute, useRouter } from 'vue-router';
import { injectionKey } from './plugins/axios';
import { checkAuth, getCurrentUser } from './plugins/dbCommands/userManager';
import { Notification, NotificationTypes, User } from './plugins/interfaces';
import { useStore } from './plugins/store';
import Cacher from './plugins/Cacher';
import LoaderComponent from './components/GenericComponents/LoaderComponent.vue';
import { urlBase64ToUint8Array } from './plugins/CommonMethods'
import { getPublicKey, sendNotifiction } from './plugins/dbCommands/notifications';

// Global instances passed through props
const http = inject<AxiosInstance>(injectionKey)!;
const router = useRouter();
const store = useStore();

let routeConfigured = ref(false)

// Global list of messages for the MessageComponent to render
var notifications: Ref<Notification[]> = ref([]);

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
  navigator.serviceWorker.ready
    .then((reg) => {
      return reg.pushManager.getSubscription()
        .then(async (sub)=>{
          if(sub)
            return sub
          const key = await getPublicKey(http)
          const convertedKey = urlBase64ToUint8Array(key)
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          });
        })
    })
    .then((sub) => {
      sendNotifiction(http, sub, (data, err) =>{
        if(err)
          return errorHandler(err)
      })
    })
  console.log(navigator.serviceWorker)
  navigator.serviceWorker.addEventListener("push", (event: any) => {
    console.log("Push")
    const payload = event.data ? event.data.text() : 'no payload';
    displayMessage(payload, NotificationTypes.Info)
  })
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
    if(to.meta.allowedRoles) {
      let overlappedRoles = to.meta.allowedRoles.filter((value: string) => store.state.user.roles?.includes(value));
      if(overlappedRoles.length==0) {
        redirect()
      }
    }
    // Clear cache on page change
    if(from&&to.name!=from.name) {
      Cacher.validateCache()
      if(store.state.isAuth) {
        Cacher.loadAllUsersFromAPI()
      }
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
  displayMessage(message, NotificationTypes.Error)
}

/**
 * @brief Briefly display a message in an on screen popup
 *
 * @param message
 */
function displayMessage(message: string, type?: NotificationTypes) {
  if(!type)
    type = NotificationTypes.Info
  // Sentinel value
  let match = false;
  // Reference to message for timeout
  let messageRef: Notification;
  // Search all messages
  for (const existingMessage of notifications.value) {
    // If message already exists
    if (message == existingMessage.text && type == existingMessage.type) {
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
    notifications.value.push({ type: type, text: message, quantity: 1 } as Notification);
    // Keep a references so we can delete or decrement after 5 seconds
    messageRef = notifications.value[notifications.value.length - 1];
  }
  // Hide after 5 seconds
  setTimeout(() => {
    // If last message - delete
    if (messageRef.quantity < 2) {
      let i = notifications.value.indexOf(messageRef);
      if (i > -1) {
        notifications.value.splice(i, 1);
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
  if (!router.currentRoute.value.meta.unauthenticated) {
    router.replace({ query: undefined }).then(()=>{
      router.push({ name: 'Login' })
    })
  }
}

function firstLoadRevokeLogin() {
  // set status
  store.commit('logout', http);
  // redirect
  if (!router.currentRoute.value.meta.unauthenticated) {
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
