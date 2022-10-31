<template>
  <HeaderComponent v-if="store.state.isAuth" :http="http" />
  <ErrorComponent :messages="errorMessages" />
  <MessageComponent :messages="messages" />
  <router-view class="max-w-3xl mx-auto bg-zinc-300 p-4 rounded-2xl mt-16 shadow-xl" :http='http' :store='store' :errorHandler='errorHandler' :router='router'
    :displayMessage='displayMessage' />
</template>


<script setup lang="ts">
// Vue components
import HeaderComponent from './components/HeaderComponent.vue'
import ErrorComponent from './components/ErrorComponent.vue'
import MessageComponent from './components/MessageComponent.vue'

// Import dependencies
import { inject, onBeforeMount, ref, Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import type { AxiosInstance, AxiosError } from 'axios';
import { injectionKey } from './plugins/axios'
import { useStore } from './plugins/store'
import { checkAuth } from './plugins/dbCommands'

// Global instances passed through props
const http = inject<AxiosInstance>(injectionKey)!
const router = useRouter()
const route = useRoute()
const store = useStore()

var messages: Ref<string[]> = ref([])
var errorMessages: Ref<string[]> = ref([])

// Before app is mounted
onBeforeMount(() => {
  // Check if user is authenticated
  checkAuth(http, (data, err) => {
    // If not authenticated
    console.log("test")
    if (err) {
      // set status
      store.commit("deauthenticate")
      // redirect
      if (route.name != "register") {
        router.push("login")
      }
      // return
      return
    }
    // If authenticated, set status
    displayMessage("Successfully logged in.")
    store.commit("authenticate")
  })
})

// Error handler
async function errorHandler(err: AxiosError | string) {
  if (typeof err == "string") {
    errorMessages.value.push(err)
  } else {
    // Show message in error component
    if (err.response) {
      var errData = err.response.data
      errorMessages.value.push(String(errData))
    }
    else {
      errorMessages.value.push(String(err))
    }
  }
  // Hide after 5 seconds 
  setTimeout(() => {
    errorMessages.value.shift()
  }, 5000)
}


// Error handler
async function displayMessage(message: string) {
  // Add message to queue
  messages.value.push(message)
  // Delete after 5 seconds 
  setTimeout(() => {
    messages.value.shift()
  }, 5000)
}
</script>