<script setup lang="ts">
import { User } from "../plugins/interfaces";
interface Props {
  user: User;
}
const { user } = defineProps<Props>();
</script>
<template>
  <div
    class="hover:bab-hover background-and-border relative my-1 grid auto-cols-max p-2 text-center leading-10"
  >
    <p>{{ user.email }}</p>
    <p>{{ user.first_name }}</p>
    <p>{{ user.last_name }}</p>
    <p>{{ user.role }}</p>
    <div class="flex justify-end">
      <img
        class="h-10 w-10 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500"
        src="../assets/pencil-solid.svg"
        v-on:click="$emit('edit')"
      />
    </div>
  </div>
</template>
