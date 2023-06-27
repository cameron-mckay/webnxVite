<template>
  <div class="card mx-auto max-w-sm shadow-xl md:max-w-sm">
    <img
      class="mx-auto mb-4 h-fit w-fit"
      alt="WebNX logo"
      src="../assets/logo.webp"
    />
    <form class="text-center" @submit.prevent="sendEmail" v-if="!submitted">
      <input
        class="textbox my-1"
        type="email"
        id="email"
        v-model="form.email"
        placeholder="Email"
        required
        autofocus
      />
     <input class="submit my-1 w-full" type="submit" value="Submit" />
    </form>
    <div v-else>
      <p>A password reset link has been sent to your email.</p>
      <RouterLink id="link" to="/login">Return to login</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import type { AxiosError, AxiosInstance } from 'axios';
import { ref } from 'vue'
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/interfaces';
import { sendPasswordResetEmail } from '../plugins/dbCommands/userManager';

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
let submitted = ref(false)
// Form data binding
let form = {
  email: '',
};

// Lifecycle hook
onMounted(() => {
  redirectIfLoggedIn();
});

function sendEmail() {
  sendPasswordResetEmail(http, form.email, (data, err) => {
    if(err) {
      return errorHandler(err)
    }
    submitted.value = true
    displayMessage(data as string)
  })
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
