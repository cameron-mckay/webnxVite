<template>
  <div class="card mx-auto max-w-sm shadow-xl md:max-w-sm">
    <img
      class="mx-auto mb-4 h-fit w-fit"
      alt="WebNX logo"
      src="../assets/logo.webp"
    />
    <form class="text-center" @submit.prevent="login">
      <input
        class="textbox my-1 mx-0"
        type="email"
        id="email"
        v-model="form.email"
        placeholder="Email"
        required
        autofocus
      />
      <input
        class="textbox my-1 mx-0"
        type="password"
        v-model="form.password"
        placeholder="Password"
        required
      />
      <RouterLink id="link" to="/forgotPassword">Forgot password</RouterLink>
      <input class="submit my-1 w-full" type="submit" value="Login" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState, User } from '../plugins/interfaces';
import { checkAuth, getCurrentUser } from '../plugins/dbCommands/userManager';
import { getPublicKey, registerEndpoint } from '../plugins/dbCommands/notifications';
import { urlBase64ToUint8Array } from '../plugins/CommonMethods';

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
  email: '',
  password: '',
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
      .post('/api/login', { email, password })
      .then((res) => {
        // If login is successful
        // Store cookie in local storage
        localStorage.setItem('token', res.data.token);
        // Add token to headers
        http.defaults.headers['Authorization'] = res.data.token;

        checkAuth(http, async (data, err) => {
          // If not authenticated
          if (err)
            return
          // If authenticated, set status
          getCurrentUser(http, (data, err) => {
            if (err) {
              // Error occured - update nothing
              store.commit('logout')
              return
            }
            // Success - update global user component
            let user = data as User
            store.commit("updateUserData", user)
            displayMessage('Successfully logged in.');
            if(Notification.permission === "granted" && 'serviceWorker' in navigator)
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
                  registerEndpoint(http, sub, (data, err) =>{
                    if(err)
                      return errorHandler(err)
                  })
                })
          });
        });

        // Save user data to vuex store
        router.push('/');
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
    .post('/api/auth')
    .then(() => {
      // Go to home
      store.state.isAuth = true;
      router.push('/');
    })
    .catch((err: Error | AxiosError) => {
      // Go to login
    });
}
</script>
