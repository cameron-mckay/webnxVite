<template>
    <div class="login" v-on:keyup.enter="login">
        <div class="card">
            <img alt="WebNX logo" src="../assets/logo.png">
            <input type="email" id="email" v-model="form.email" placeholder="Email" required>
            <input type="password" v-model="form.password" placeholder="Password" required>
            <button v-on:click="login" type="submit">Login</button>
        </div>
    </div>
</template>

<script setup lang="ts">
// IMPORTS!!!!! YAY
import { onMounted } from 'vue';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/store';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

// Form data binding
var form = {
    email: "",
    password: ""
}

// Lifecycle hook
onMounted(() => {
    focus();
    redirectIfLoggedIn()
})

// Send login to API
async function login() {
    // Get email and password from input fields
    let { email, password } = form
    // If they are not empty
    if (email && password) {
        // Send username and password to API
        await http.post("/api/login", { email, password })
            .then((res) => {
                // If login is successful
                // Store cookie in local storage
                localStorage.setItem("token", res.data.token);
                // Add token to headers
                http.defaults.headers.common['Authorization'] = res.data.token
                // Save user data to vuex store
                store.commit("updateUserData")
                store.commit("authenticate")
                if (window.history.length > 2) {
                    // if user was redirected to login
                    router.go(-1)
                }
                else {
                    // if login was accessed directly
                    router.push("/")
                }
            }).catch((err: Error | AxiosError) => {
                // Error
                errorHandler(err);
            })
    }
}

// Redirects if token is already present
async function redirectIfLoggedIn() {
    await http.post("/api/auth")
        .then(() => {
            // Go to home
            store.state.isAuth = true;
            router.push("/");
        })
        .catch((err: Error | AxiosError) => {
            // Go to login
            errorHandler(err)
        });
}

// Auto focus email box
function focus() {
    // Focus email entry field
    document.getElementById("email")!.focus();
}
</script>

<style scoped>
.login {
    font-family: sans-serif;
    background-color: #ebebebeb;
    margin: auto;
    max-width: 300px;
    padding: 25px;
    border-radius: 20px;
}

.login {
    display: flex;
    justify-content: center;
}

.login input {
    display: block;
    margin: 10px 0;
    border-radius: 20px;
    border: 2px solid grey;
    padding: 5px;
    width: calc(100% - 14px);
}

.login input:focus {
    border-color: #8ebd00;
    outline: none;
}

.login button {
    background-color: #8ebd00;
    border: none;
    padding: 5px 10px;
    color: white;
    border-radius: 5px;
    transition: ease-in .1s;
}

.login button:hover {
    transition: ease-in .1s;
    background-color: #668800;
}
</style>