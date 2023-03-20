<template>
  <div class="card max-w-sm md:max-w-sm">
    <img class="mx-auto mb-4" alt="WebNX logo" src="../assets/logo.png" />
    <form class="text-center" @submit.prevent="login">
      <input
        class="textbox"
        type="email"
        id="email"
        v-model="form.email"
        placeholder="Email"
        required
        autofocus
      />
      <input
        class="textbox"
        type="password"
        v-model="form.password"
        placeholder="Password"
        required
      />
      <input class="submit" type="submit" value="Login" />
    </form>
  </div>
</template>

<script setup lang="ts">
// IMPORTS!!!!! YAY
import { onMounted } from "vue";

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from "axios";
import { Router } from "vue-router";
import type { Store } from "vuex";
import type { UserState } from "../plugins/interfaces";

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError) => void;
  displayMessage: (message: string) => void;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS

// Form data binding
let form = {
  email: "",
  password: "",
};

// Lifecycle hook
onMounted(() => {
  redirectIfLoggedIn();
});

// Send login to API
async function login() {
  // Get email and password from input fields
  let { email, password } = form;
  // If they are not empty
  if (email && password) {
    // Send username and password to API
    await http
      .post("/api/login", { email, password })
      .then((res) => {
        // If login is successful
        // Store cookie in local storage
        localStorage.setItem("token", res.data.token);
        // Add token to headers
        http.defaults.headers["Authorization"] = res.data.token;
        // Save user data to vuex store
        store.commit("updateUserData");
        store.commit("authenticate");
        router.push("/");
      })
      .catch((err: Error | AxiosError) => {
        // Error
        errorHandler(err);
      });
  }
}

// Redirects if token is already present
async function redirectIfLoggedIn() {
  await http
    .post("/api/auth")
    .then(() => {
      // Go to home
      store.state.isAuth = true;
      router.push("/");
    })
    .catch((err: Error | AxiosError) => {
      // Go to login
    });
}
</script>
