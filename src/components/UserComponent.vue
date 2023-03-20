<script setup lang="ts">
import { User } from "../plugins/interfaces";
interface Props {
  user: User;
}
const { user } = defineProps<Props>();
</script>
<template>
  <div
    class="relative grid auto-cols-max rounded-lg p-2 text-center leading-10 hover:bg-zinc-400"
  >
    <p>{{ user.email }}</p>
    <p>{{ user.first_name }}</p>
    <p>{{ user.last_name }}</p>
    <p>{{ user.role }}</p>
    <img
      class="h-10 w-10 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500"
      src="../assets/pencil-solid.svg"
      v-on:click="$emit('edit')"
    />
  </div>
</template>
