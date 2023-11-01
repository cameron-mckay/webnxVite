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
      class="hover:bab-hover background-and-border relative col-span-3 my-1 grid grid-cols-3 p-1 text-center leading-8 hover:rounded-md md:p-2 md:leading-10"
    >
      <p>{{ user.email }}</p>
      <p>{{ `${user.first_name} ${user.last_name}` }}</p>
      <div class="flex justify-end">
        <!-- Pencil -->
        <PencilButton v-if="edit==true" v-on:click="$emit('edit')"/>
        <PlusButton v-if="add==true" v-on:click="$emit('add')"/>
      </div>
    </div>
  </div>
</template>
