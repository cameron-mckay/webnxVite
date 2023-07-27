<script setup lang="ts">
import { User } from '../../plugins/interfaces';
import PencilButton from '../GenericComponents/PencilButton.vue';
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
        <PencilButton v-on:click="$emit('edit')"/>
      </div>
    </div>
  </div>
</template>
