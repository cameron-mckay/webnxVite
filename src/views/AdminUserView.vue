<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { User } from '../plugins/interfaces';
import { getAllUsers } from '../plugins/dbCommands'
import UserComponent from '../components/UserComponent.vue';
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState, PartSchema } from '../plugins/interfaces';

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


function editUser(user: User){

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
        <UserComponent class="grid grid-cols-5 relative leading-10 text-center p-2 transition text-sm" v-for="user in users" :user="user" @edit="editUser(user)"/>
    </div>
</template>