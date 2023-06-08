<script setup lang="ts">
import { User } from '../../plugins/interfaces';
interface Props {
  user: User;
}
const emit = defineEmits(['edit']);
const { user } = defineProps<Props>();
</script>
<template>
  <div class="group relative p-0">
    <div
      class="hover:bab-hover background-and-border relative col-span-5 my-1 grid grid-cols-3 p-1 text-center leading-8 hover:rounded-md md:col-span-5 md:grid-cols-5 md:p-2 md:leading-10"
    >
      <p class="hidden md:grid">{{ user.email }}</p>
      <p class="hidden md:grid">{{ user.first_name }}</p>
      <p class="hidden md:grid">{{ user.last_name }}</p>
      <p class="grid md:hidden">{{ `${user.first_name} ${user.last_name}` }}</p>
      <p>{{ user.roles?.join(', ') }}</p>
      <div class="flex justify-end">
        <!-- Pencil -->
        <svg
          v-on:click="$emit('edit')"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>
