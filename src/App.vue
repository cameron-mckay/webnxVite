<template>
  <div>
    <HeaderComponent v-if="store.state.isAuth&&routeConfigured" :http="http" :store="store" :revokeLogin="revokeLogin" />
    <NotificationCenterComponent :notifications="notifications"
      :store="store"
      :http="http"
      :router="router"
      :errorHandler="errorHandler"
    />
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
import NotificationCenterComponent from './components/GenericComponents/NotificationCenterComponent.vue';
// Import dependencies
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, inject, onMounted, ref, onBeforeMount } from 'vue';
import { NavigationGuardNext, RouteLocationNormalized, useRouter } from 'vue-router';
import { injectionKey } from './plugins/axios';
import { checkAuth, getCurrentUser } from './plugins/dbCommands/userManager';
import { NotificationSchema, NotificationTypes, User } from './plugins/interfaces';
import { useStore } from './plugins/store';
import Cacher from './plugins/Cacher';
import LoaderComponent from './components/GenericComponents/LoaderComponent.vue';
import { urlBase64ToUint8Array } from './plugins/CommonMethods'
import { getPublicKey, getUnreadNotifications, registerEndpoint } from './plugins/dbCommands/notifications';

// Global instances passed through props
const http = inject<AxiosInstance>(injectionKey)!;
const router = useRouter();
const store = useStore();
const NOTIFICATION_TIME = 5000

let routeConfigured = ref(false)

// Global list of messages for the MessageComponent to render
var notifications: Ref<NotificationSchema[]> = ref([]);

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
  getUnreadNotifications(http,(data: any, err)=>{
    if(err)
      return errorHandler(err)
    store.commit("updateNotificationCount", data.length!)
  })
  // Listens for notifications from service worker
  const notificationChannel = new BroadcastChannel("nx-notification")
  notificationChannel.onmessage = (event) => {
    if(store.state.isAuth) {
      const data = event.data
      displayMessage(data.text, data.type, data.link)
      getUnreadNotifications(http,(data: any, err)=>{
        if(err)
          return errorHandler(err)
        store.commit("updateNotificationCount", data.length!)
      })
    }
  }
  const payloadChannel = new BroadcastChannel("nx-payload")
  payloadChannel.onmessage = (event) => {
    if(store.state.isAuth) {
      const data = event.data
      if(data.type == "notificationUpdate") {
        getUnreadNotifications(http,(data: any, err)=>{
          if(err)
            return errorHandler(err)
          store.commit("updateNotificationCount", data.length!)
        })
      }
    }
  }
  // Get the registration from service worker
  if(navigator.serviceWorker)
    navigator.serviceWorker.ready
      .then(async (reg) => {
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
        // Send registration info to server
        registerEndpoint(http, sub, (_, err) =>{
          if(err)
            return errorHandler(err)
        })
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
        return firstLoadRevokeLogin()
      }
      // Success - update global user component
      let user = data as User
      store.commit("updateUserData", user)
      displayMessage('Successfully logged in.');
      configureRouter()
      if(Notification.permission === "granted")
        // Get the registration from service worker
        navigator.serviceWorker.ready
          .then(async (reg) => {
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
            // Send registration info to server
            registerEndpoint(http, sub, (_, err) =>{
              if(err)
                return errorHandler(err)
            })
          })
    });
  });
})

function checkRoute(to: RouteLocationNormalized, from?: RouteLocationNormalized, next?: NavigationGuardNext) {
  checkAuth(http, (data, err)=>{
    // If login is no long valid
    if (store.state.isAuth&&(err||data=="You must login to continue.")) {
      errorHandler("Login expired.")
      return revokeLogin()
    }
    getUnreadNotifications(http,(data: any, err)=>{
      if(err)
        return errorHandler(err)
      store.commit("updateNotificationCount", data.length!)
    })
    // If route has required roles
    if(to.meta.allowedRoles) {
      // Check for overlap with route and user roles
      let overlappedRoles = to.meta.allowedRoles.filter((value: string) => store.state.user.roles?.includes(value));
      // If no overlap, redirect
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
    // Set tab title
    document.title = `WebNX${to.name?" - "+to.name.toString():""}`;
    // If there is a next location, go to it
    if(next)
      next();
  })
}

function configureRouter() {
  // Check current route
  checkRoute(router.currentRoute.value)
  // Enable route checks
  router.beforeEach(checkRoute);
  // Set router as configured
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
function displayMessage(message: string, type?: NotificationTypes, link?: string) {
  if(!type)
    type = NotificationTypes.Info
  // Sentinel value
  let match = false;
  // Search all messages
  for (const existingMessage of notifications.value) {
    // If message already exists
    if (message == existingMessage.text && type == existingMessage.type) {
      // Increment existing message
      existingMessage.quantity! += 1;
      existingMessage.ms_left = NOTIFICATION_TIME
      // Set sentinel value
      match = true;
    }
  }
  if (!match) {
    // If message doesn't already exist - create and push new
    notifications.value.push({ type: type, text: message, quantity: 1, ms_left: NOTIFICATION_TIME, link } as NotificationSchema);
  }
  if(!document.hasFocus()&&Notification.permission==="granted") {
    new Notification("WebNX Inventory", {
      body: message
    })
    .onclick = (async () => {
      if(link) {
        await router.push(link)
      }
      window.focus()
    })
  }
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
