<template>
    <div class="header">
        <div class="links">
            <img alt="WebNX Logo" src="../assets/logo.png">
            <RouterLink to="/parts">Parts</RouterLink>
            <RouterLink to="/assets">Assets</RouterLink>
        </div>
        <div class="user">
            <p>{{ store.state.user.first_name + " " + store.state.user.last_name }}</p>
            <img alt="profile picture" :src="profilePicture">
        </div>
    </div>
</template>

<script setup lang="ts">
import { useStore } from '../plugins/store'
import { onBeforeMount } from 'vue'
const store = useStore();

var user = {}
var profilePicture = "https://st3.depositphotos.com/6672868/13701/v/600/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"

onBeforeMount(() => {
    store.commit("updateUserData")
})

</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    height: 40px;
    background-color: #ebebebeb;
}

.links img {
    height: 30px;
    padding: 5px 0;
    margin: 0 20px;
}

.links {
    display: inline-block;
}

.links a {
    display: inline-block;
    text-decoration: none;
    height: 20px;
    line-height: 20px;
    vertical-align: top;
    padding: 10px 20px;
    color: black;
}

.links a:hover {
    background-color: #dededede;
}

.user {
    display: flex;
    height: 40px;
}

.user img {
    height: 30px;
    width: 30px;
    padding: 5px;
    border-radius: 20px;
}

.user p {
    margin: 0 20px;
    line-height: 40px;
    color: black;
}
</style>

