<script setup lang="ts">
import { Ref, ref } from 'vue';
import { User } from '../plugins/interfaces';
import FullScreenPopupComponent from './FullScreenPopupComponent.vue';


interface Props {
    user: User
}

const props = defineProps<Props>()

let user: Ref<User> = ref({})
user.value = props.user

</script>
<template>
    <FullScreenPopupComponent v-smooth-resize="{ delay: 50, transition: 800, fineTune: 27 }">
        <h1>Edit User:</h1>
        <form @submit.prevent="$emit('update', user)" class="grid grid-cols-2">
            <label>Email</label>
            <input type="email" v-model="user.email">
            <label>First Name:</label>
            <input type="text" v-model="user.first_name">
            <label>Last Name:</label>
            <input type="text" v-model="user.last_name">
            <label>Role:</label>
            <select v-model="user.role">
                <option>tech</option>
                <option>kiosk</option>
                <option>inventory</option>
                <option>admin</option>
            </select>
            <input class="col-span-2 submit bg-red-500 hover:bg-red-600 active:bg-red-700" type="reset" value="Reset">
            <input class="col-span-2 submit" type="submit" value="Update">
        </form>
    </FullScreenPopupComponent>
</template>
