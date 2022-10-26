<template>
    <div class="login" v-on:keyup.enter="register">
        <div class="card">

            <img alt="WebNX logo" src="../assets/logo.png">
            <form @submit.prevent="register">
                <input type="first_name" id="first_name" v-model="form.first_name" placeholder="First name" required>
                <input type="last_name" v-model="form.last_name" placeholder="Last name" required>
                <input type="email" v-model="form.email" placeholder="Email" required>
                <input type="password" v-model="form.password" placeholder="Password" required>
                <input type="password" v-model="form.password2" placeholder="Confirm password" required>
                <button v-on:click="register" type="submit">Register</button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { AxiosResponse } from 'axios';
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


// Bound to form data
var form = {
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
            errorHandler(err)
        });
}

async function focus() {
    // Focus first name entry field
    document.getElementById("first_name")!.focus();
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