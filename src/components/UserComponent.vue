<script setup lang="ts">
import { User } from '../plugins/interfaces';
interface Props {
    user: User
}
const { user } = defineProps<Props>()
</script>
<template>
    <div class="grid auto-cols-max relative leading-10 text-center hover:bg-zinc-400 
        p-2 rounded-lg">
        <p>{{ user.email }}</p>
        <p>{{ user.first_name }}</p>
        <p>{{ user.last_name }}</p>
        <p>{{ user.role }}</p>
        <img class="h-10 w-10 p-2 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
            src="../assets/pencil-solid.svg" v-on:click="$emit('edit')">
    </div>
</template>
