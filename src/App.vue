<template>
  <div>
    <HeaderComponent v-if="store.state.isAuth" :http="http" :store="store" />
    <MessageComponent :messages="messages" :errors="errorMessages" />
    <router-view
      class="my-16 mx-4 w-[calc(100%-2rem)] text-sm md:mx-auto md:max-w-5xl md:text-base"
      :http="http"
      :store="store"
      :errorHandler="errorHandler"
      :router="router"
      :displayMessage="displayMessage"
      :user_data="user_data"
      :routeLocation="route"
    />
  </div>
</template>
<script setup lang="ts">
// Vue components
import HeaderComponent from "./components/HeaderComponent.vue";
import MessageComponent from "./components/MessageComponent.vue";

// Import dependencies
import type { AxiosError, AxiosInstance } from "axios";
import { Ref, inject, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { injectionKey } from "./plugins/axios";
import { checkAuth } from "./plugins/dbCommands/userManager";
import type { Message, User } from "./plugins/interfaces";
import { useStore } from "./plugins/store";

// Global instances passed through props
const http = inject<AxiosInstance>(injectionKey)!;
const router = useRouter();
const route = useRoute();
const store = useStore();

// Global list of messages for the MessageComponent to render
var messages: Ref<Message[]> = ref([]);
var errorMessages: Ref<Message[]> = ref([]);
let user_data = ref({} as User);

onMounted(()=> {
  if (
    localStorage.getItem("theme") == "dark" ||
    (localStorage.getItem("theme") == null &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    setTimeout(()=>{
      document.documentElement.classList.add("dark");
    }, 100)
  } else { 
    setTimeout(()=>{
      localStorage.setItem("theme", "light")
    }, 100)
  }
})

// Before app is created
checkAuth(http, (data, err) => {
  // If not authenticated
  if (err) {
    // set status
    store.commit("deauthenticate");
    // redirect
    if (route.name != "Register") {
      router.push({ name: "Login" });
    }
    // return
    return;
  }
  // If authenticated, set status
  displayMessage("Successfully logged in.");
  store.commit("authenticate");
  store.commit("updateUserData");
  // Check if user is a non admin trying to access admin route
  user_data.value = data as User;
  router.beforeEach((to, from, next) => {
    // Make sure they are admin for admin routes
    if (user_data.value.role != "admin" && /\/admin\/*/.test(to.path)) {
      router.push({ name: "Parts" });
      errorHandler("You are not authorized to access this page.");
    }
    if (
      user_data.value.role != "admin" &&
      user_data.value.role != "inventory" &&
      /\/manage\/*/.test(to.path)
    ) {
      router.push({ name: "Parts" });
      errorHandler("You are not authorized to access this page.");
    }
    // This goes through the matched routes from last to first, finding the closest route with a title.
    // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
    // `/nested`'s will be chosen.
    document.title = `WebNX - ${to.name?.toString()}`;
    next();
  });
});

/**
 * @brief Briefly print an error to an on screen popup
 *
 * @param err
 */
async function errorHandler(err: AxiosError | string) {
  // string variable for message text
  let message: string;
  // if error is already a string
  if (typeof err == "string") {
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
async function displayMessage(message: string) {
  // Sentinel value
  let match = false;
  // Reference to message for timeout
  let messageRef: Message;
  // Search all messages
  for (const existingMessage of messages.value) {
    // If message aleady exists
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
</script>
