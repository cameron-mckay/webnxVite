<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onMounted } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/interfaces';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError) => void;
  displayMessage: (message: string) => void;
}

let { http, router, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS

// Bound to form data
let form = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password2: '',
};

// Lifecycle hook
onMounted(() => {
  focus();
  redirectIfLoggedIn();
});

// Registers user with API
function register() {
  // Get email and password from input fields
  let { first_name, last_name, email, password, password2 } = form;
  // If they are not empty
  if (first_name && last_name && email && password && password == password2) {
    // Send username and password to API
    http
      .post('/api/register', form)
      .then(() => {
        displayMessage(
          'Your account must be enabled by an admin before you can log in.'
        );
        router.push('/login');
      })
      .catch((err: Error | AxiosError) => {
        // Error
        errorHandler(err);
      });
  }
}

async function redirectIfLoggedIn() {
  await http
    .post('/api/auth')
    .then(() => {
      // Go to home
      router.push('/');
    })
    .catch(() => {
      // Go to login
    });
}

async function focus() {
  // Focus first name entry field
  document.getElementById('first_name')!.focus();
}
</script>
<template>
  <div
    class="card mx-auto max-w-sm shadow-xl md:max-w-sm"
    v-on:keyup.enter="register"
  >
    <img
      class="mx-auto mb-4 h-fit w-fit"
      alt="WebNX logo"
      src="../assets/logo.webp"
    />
    <form class="text-center" @submit.prevent="register">
      <input
        class="textbox my-1 mx-0"
        type="first_name"
        id="first_name"
        v-model="form.first_name"
        placeholder="First name"
        required
      />
      <input
        class="textbox my-1 mx-0"
        type="last_name"
        v-model="form.last_name"
        placeholder="Last name"
        required
      />
      <input
        class="textbox my-1 mx-0"
        type="email"
        v-model="form.email"
        placeholder="Email"
        required
      />
      <input
        class="textbox my-1 mx-0"
        type="password"
        v-model="form.password"
        placeholder="Password"
        required
      />
      <input
        class="textbox my-1 mx-0"
        type="password"
        v-model="form.password2"
        placeholder="Confirm password"
        required
      />
      <input class="submit w-full" type="submit" value="Register" />
    </form>
  </div>
</template>
