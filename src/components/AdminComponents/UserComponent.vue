<script setup lang="ts">
import { User } from '../../plugins/interfaces';
import PencilButton from '../GenericComponents/Buttons/PencilButton.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
interface Props {
  user: User;
  edit?: boolean;
  add?: boolean;
}
const emit = defineEmits(['edit', 'add']);
const { user } = defineProps<Props>();
</script>
<template>
  <div class="group relative p-0">
    <div
      class="hover:bab-hover background-and-border relative col-span-5 my-1 grid grid-cols-3 p-1 text-center leading-8 hover:rounded-md md:col-span-5 md:grid-cols-5 md:p-2 md:leading-10"
    >
      <div class="hidden md:block">
        <p class="mb-auto mt-0">{{ user.email }}</p>
      </div>
      <div class="hidden md:block">
        <p class="mb-auto mt-0">{{ user.first_name }}</p>
      </div>
      <div class="hidden md:block">
        <p class="mb-auto mt-0">{{ user.last_name }}</p>
      </div>
      <div class="block md:hidden">
        <p class="mb-auto mt-0">{{ `${user.first_name} ${user.last_name}` }}</p>
      </div>
      <div>
      <p>{{ user.roles?.join(', ') }}</p>
      </div>
      <div class="flex justify-end mb-auto">
        <!-- Pencil -->
        <PencilButton v-if="edit==true" v-on:click="$emit('edit')"/>
        <PlusButton v-if="add==true" v-on:click="$emit('add')"/>
      </div>
    </div>
  </div>
</template>
