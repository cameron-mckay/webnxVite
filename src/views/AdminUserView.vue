<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { User } from '../plugins/interfaces';
import { getAllUsers, updateUser } from '../plugins/dbCommands/userManager'
import UserComponent from '../components/UserComponent.vue';
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/interfaces';
import UserManagerComponent from '../components/UserManagerComponent.vue';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

let users:Ref<Array<User>> = ref([])
let editUser = ref(false)
let currentUser:Ref<User> = ref({})

function getUsers() {
    getAllUsers(http, (data, err) => {
        if(err) {
            return errorHandler(err)
        }
        users.value = data as Array<User>
    })
}

onMounted(()=>{
    getUsers()
})

function toggleEdit(user: User) {
    if(!editUser.value) {
        currentUser.value = user
        editUser.value = true
    } else {
        currentUser.value = {}
        editUser.value = false
    }
}

function localUpdateUser(user: User){
    console.log(user)
    updateUser(http, user, (data, err) => {
        if(err) {
            return errorHandler(err)
        }
        currentUser.value = {}
        toggleEdit({})
        displayMessage("Updated user.")
    })
}

</script>
<template>
    <div>
        <h1 class="text-4xl mb-4">User Manager</h1>
        <div class="grid grid-cols-5 relative leading-10 text-center p-2 transition text-sm font-bold">
            <p>Email</p>
            <p>First Name</p>
            <p>Last Name</p>
            <p>Admin</p>
        </div>
        <UserComponent class="grid grid-cols-5 relative leading-10 text-center p-2 transition text-sm" v-for="user in users" :user="user" @edit="toggleEdit(user)"/>
        <UserManagerComponent class="pointer-events-auto" :user="currentUser" :show="editUser" @toggle="toggleEdit" @update="localUpdateUser"/>
    </div>
</template>