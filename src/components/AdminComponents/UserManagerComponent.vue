<script setup lang="ts">
import { Ref, ref } from 'vue';
import { User } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';

interface Props {
  user: User;
}
const emit = defineEmits(['update']);

const props = defineProps<Props>();

let user: Ref<User> = ref({});
user.value = props.user;
</script>
<template>
  <FullScreenPopupComponent>
    <h1 class="mb-4 text-4xl leading-8 md:leading-10">Edit User:</h1>
    <form @submit.prevent="$emit('update', user)" class="grid grid-cols-2">
      <label>Email:</label>
      <input class="textbox my-1" type="email" v-model="user.email" />
      <label>First Name:</label>
      <input class="textbox my-1" type="text" v-model="user.first_name" />
      <label>Last Name:</label>
      <input class="textbox my-1" type="text" v-model="user.last_name" />
      <label>Role:</label>
      <select class="textbox my-1" v-model="user.role">
        <option>tech</option>
        <option>sales</option>
        <option>testing **NOT IMPLEMENTED**</option>
        <option>ebay **NOT IMPLEMENTED**</option>
        <option>kiosk</option>
        <option>inventory</option>
        <option>admin</option>
      </select>
      <label>Building:</label>
      <select class="textbox my-1" v-model="user.building">
        <option>1</option>
        <option>3</option>
        <option>4</option>
      </select>
      <label>Enabled:</label>
      <select class="textbox my-1" v-model="user.enabled">
        <option :value="true">Yes</option>
        <option :value="false">No</option>
      </select>
      <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        value="Reset"
      />
      <input class="submit col-span-2" type="submit" value="Update" />
    </form>
  </FullScreenPopupComponent>
</template>
