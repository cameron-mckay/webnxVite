<script setup lang="ts">
// Vue components
import HeaderComponent from './components/HeaderComponent.vue'
import ErrorComponent from './components/ErrorComponent.vue';

// Import dependencies
import { inject, onBeforeMount, ref } from 'vue';
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

var errorMessage = ref('')
var isError = ref(false)

// Before app is mounted
onBeforeMount(() => {
  // Check if user is authenticated
  console.log("test")
  checkAuth(http, (data, err) => {
    // If not authenticated
    if (err) {
      console.log("error")
      // set status
      store.commit("deauthenticate")
      // redirect
      if (route.name != "register") {
        router.push("login")
      }
      // return
      return
    }
    console.log("okay")
    // If authenticated, set status
    store.commit("authenticate")
  })
})

// Error handler
async function errorHandler(err: AxiosError) {
  // Show message in error component
  if (err.response) {
    var errData = err.response.data
    errorMessage.value = String(errData)
  }
  else {
    errorMessage.value = String(err)
  }
  isError.value = true
  // Hide after 5 seconds 
  setTimeout(() => {
    isError.value = false
  }, 5000)
}

</script>

<template>
  <HeaderComponent v-if="store.state.isAuth" />
  <ErrorComponent v-if="isError" :message="errorMessage" />
  <router-view :http='http' :store='store' :errorHandler='errorHandler' :router='router' />
</template>

<style>
body {
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

.body {
  padding: 2em;
  border-radius: 20px;
  margin: 1em auto;
  max-width: 800px;
  background-color: #ebebebeb;
}
</style>
