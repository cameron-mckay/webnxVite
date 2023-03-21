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
        class="button-icon"
        src="../assets/pencil-solid.svg"
        v-on:click="$emit('edit')"
      />
    </div>
  </div>
</template>
