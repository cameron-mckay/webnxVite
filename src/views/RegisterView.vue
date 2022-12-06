<template>
    <div class="card max-w-sm" v-on:keyup.enter="register">
        <img class="mx-auto mb-4" alt="WebNX logo" src="../assets/logo.png">
        <form class="text-center" @submit.prevent="register">
            <input class="textbox" type="first_name" id="first_name" v-model="form.first_name" placeholder="First name"
                required>
            <input class="textbox" type="last_name" v-model="form.last_name" placeholder="Last name" required>
            <input class="textbox" type="email" v-model="form.email" placeholder="Email" required>
            <input class="textbox" type="password" v-model="form.password" placeholder="Password" required>
            <input class="textbox" type="password" v-model="form.password2" placeholder="Confirm password" required>
            <input class="submit" type="submit" value="Register">
        </form>
    </div>
</template>

<script setup lang="ts">
import { AxiosResponse } from 'axios';
import { onMounted } from 'vue';
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/interfaces';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS


// Bound to form data
let form = {
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: ""
}

// Lifecycle hook
onMounted(() => {
    focus()
    redirectIfLoggedIn()
})

// Registers user with API
async function register() {
    // Get email and password from input fields
    let { first_name, last_name, email, password, password2 } = form
    // If they are not empty
    console.log("1")
    if (first_name && last_name && email && password && (password == password2)) {
        console.log("2")
        // Send username and password to API
        await http.post("/api/register", form).then((res: AxiosResponse) => {
            // If login is successful
            // Store cookie in local storage
            localStorage.setItem("token", res.data.token);
            // Add token to headers
            http.defaults.headers.common['Authorization'] = res.data.token
            // Save user data to vuex store
            store.commit("updateUserData")
            store.commit("authenticate")
            router.push("/")
        }).catch((err: Error | AxiosError) => {
            // Error
            errorHandler(err)
        })
    }
}

async function redirectIfLoggedIn() {
    await http.post("/api/auth")
        .then(() => {
            // Go to home
            router.push("/");
        })
        .catch((err: Error | AxiosError) => {
            // Go to login
        });
}

async function focus() {
    // Focus first name entry field
    document.getElementById("first_name")!.focus();
}

</script>