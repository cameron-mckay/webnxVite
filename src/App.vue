<template>
  <HeaderComponent v-if="store.state.isAuth" :http="http" />
  <MessageComponent :messages="messages" :errors="errorMessages"/>
  <router-view class="max-w-3xl mx-auto bg-zinc-300 p-4 rounded-2xl mt-16 shadow-xl" :http='http' :store='store' :errorHandler='errorHandler' :router='router'
    :displayMessage='displayMessage' />
</template>


<script setup lang="ts">
// Vue components
import HeaderComponent from './components/HeaderComponent.vue'
import MessageComponent from './components/MessageComponent.vue'

// Import dependencies
import { inject, onBeforeMount, ref, Ref } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import type { AxiosInstance, AxiosError } from 'axios';
import { injectionKey } from './plugins/axios'
import { useStore } from './plugins/store'
import { checkAuth } from './plugins/dbCommands'
import type { Message } from './plugins/interfaces'

// Global instances passed through props
const http = inject<AxiosInstance>(injectionKey)!
const router = useRouter()
const route = useRoute()
const store = useStore()

var messages: Ref<Message[]> = ref([])
var errorMessages: Ref<Message[]> = ref([])

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
  // string variable for message text
  let message:string
  // if error is already a string
  if (typeof err == "string") {
    message = err
  }
  // If error is axios error
  else if (err.response) {
    // Cast as string
    message = String(err.response.data)
  }
  // If error is ES error
  else {
    // Cast as string
    message = String(err)
  }
  // Create sentinel value
  let match = false
  // Reference to message for timeout
  let messageRef:Message
  // Search through all messages
  for (const existingMessage of errorMessages.value)
  {
    // If message already exists
    if(message == existingMessage.text){
      // Increment
      existingMessage.quantity += 1
      // Set sentinel flag
      match = true
      // Store reference to message
      messageRef = existingMessage
    }
  }
  // If message does not exist
  if(!match) {
    // Create new message
    errorMessages.value.push({ text: message, quantity: 1 } as Message)
    // Store reference
    messageRef = errorMessages.value[errorMessages.value.length - 1]
  }
  // Hide after 5 seconds 
  setTimeout(() => {
    // If last message
    if (messageRef.quantity < 2) {
      // Delete message
      let i = errorMessages.value.indexOf(messageRef)
      errorMessages.value.splice(i,1)
    }
    // If not last message
    else {
      // Decrement count
      messageRef.quantity -= 1
    }
  }, 5000)
}


// Error handler
async function displayMessage(message: string) {
  // Sentinel value
  let match = false
  // Reference to message for timeout
  let messageRef:Message
  // Search all messages
  for (const existingMessage of messages.value)
  {
    // If message aleady exists
    if(message == existingMessage.text){
      // Increment existing message
      existingMessage.quantity += 1
      // Set sentinel value
      match = true
      // Store a reference so we can delete or decrement after 5 seconds
      messageRef = existingMessage
    }
  }
  if(!match) {
    // If message doesn't already exist - create and push new
    messages.value.push({ text: message, quantity: 1 } as Message)
    // Keep a references so we can delete or decrement after 5 seconds
    messageRef = messages.value[messages.value.length - 1]
  }
  // Hide after 5 seconds 
  setTimeout(() => {
    // If last message - delete
    if (messageRef.quantity < 2) {
      let i = messages.value.indexOf(messageRef)
      messages.value.splice(i,1)
    }
    // If not last message
    else {
      messageRef.quantity -= 1
    }
  }, 5000)
}
</script>