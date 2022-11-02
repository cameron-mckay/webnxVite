<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { User } from '../plugins/interfaces';
import { getAllUsers, updateUser } from '../plugins/dbCommands'
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
        <div class="grid grid-cols-5 relative leading-10 text-center p-2 transition text-sm font-bold">
            <p>Email</p>
            <p>First Name</p>
            <p>Last Name</p>
            <p>Admin</p>
        </div>
        <UserComponent class="grid grid-cols-5 relative leading-10 text-center p-2 transition text-sm" v-for="user in users" :user="user" @edit="toggleEdit(user)"/>
        <div v-if="editUser" class="w-full h-full absolute top-0 left-0 z-40 bg-zinc-700 opacity-50" @click="toggleEdit({})"></div>
        <div v-if="editUser" class="w-full h-full absolute top-0 left-0 z-50 pointer-events-none">
            <div class="p-4 rounded-xl block bg-zinc-300 top-40 mx-auto mt-32 max-w-xl shadow-lg z-50 pointer-events-auto">
                <UserManagerComponent class="pointer-events-auto" :user="currentUser" @update="localUpdateUser"/>
            </div>
        </div>
    </div>
</template>