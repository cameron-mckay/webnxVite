<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onMounted } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/interfaces';
import { submitNewPassword } from '../plugins/dbCommands/userManager'

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError) => void;
  displayMessage: (message: string) => void;
}

let { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS

// Bound to form data
let form = {
  password: '',
  password2: '',
};

let sending = false

// Lifecycle hook
onMounted(() => {
  redirectIfLoggedIn();
});

function updatePassword() {
  if(sending)
    return
  sending = true
  if(form.password != form.password2) {
    sending = false
    return errorHandler(new Error("Passwords do not match"))
  }
  let { userId, token } = router.currentRoute.value.query
  submitNewPassword(http, userId as string, token as string, form.password, (data, err) => {
    sending = false
    if(err) {
      return errorHandler(err)
    }
    displayMessage(data as string)
    router.push("/login")
  })
}

async function redirectIfLoggedIn() {
  await http
    .post('/api/auth')
    .then(() => {
      // Go to home
      router.push('/');
    })
    .catch((err: Error | AxiosError) => {
      // Go to login
    });
}
</script>
<template>
  <div
    class="card mx-auto max-w-sm shadow-xl md:max-w-sm"
  >
    <img
      class="mx-auto mb-4 h-fit w-fit"
      alt="WebNX logo"
      src="../assets/logo.webp"
    />
    <form class="text-center" @submit.prevent="updatePassword">
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
      <input class="submit w-full" type="submit" value="Update Password" />
    </form>
  </div>
</template>
