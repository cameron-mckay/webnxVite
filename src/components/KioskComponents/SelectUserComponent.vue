<script setup lang="ts">
import { ref } from 'vue';
import { User } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';

interface Props {
  users: User[]
}

let { users } = defineProps<Props>()
let user = ref<User>({})
</script>
<template>
  <FullScreenPopupComponent>
    <h1 class="my-auto text-4xl">Select User:</h1>
    <form
      id="form"
      @submit.prevent="$emit('select', user)"
      class="grid grid-cols-2"
    >
      <label>User: </label>
      <select
        required
        v-model="user"
        class="textbox m-1"
      >
        <option v-for="u of users" :value="u">{{u.first_name}} {{u.last_name}}</option>
      </select>
      <input class="submit col-span-2" type="submit" value="Claim Kit" />
    </form>
  </FullScreenPopupComponent>
</template>
