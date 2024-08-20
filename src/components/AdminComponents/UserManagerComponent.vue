<script setup lang="ts">
import { Ref, ref } from 'vue';
import { User } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';

interface Props {
  title: string;
  submitText: string;
  passwordRequired: boolean;
  user: User;
}
const emit = defineEmits(['update']);

const props = defineProps<Props>();
// All possible roles
const roles = [
  'persist_login',
  'is_kiosk',
  'own_parts',
  'request_parts',
  'create_build_kit',
  'request_build_kit',
  'claim_build_kit',
  'view_assets',
  'edit_assets',
  'correct_assets',
  'view_pallets',
  'edit_pallets',
  'correct_pallets',
  'view_boxes',
  'edit_boxes',
  'correct_boxes',
  'check_out_parts',
  'sell_on_ebay',
  'building_transfer',
  'manage_others_inventory',
  'view_audit_date',
  'view_analytics',
  'process_checkins',
  'fulfill_part_requests',
  'create_parts',
  'manage_parts',
  'manage_users',
  'transfer_out_testing',
  'view_manage_menu',
  'delete_parts',
  'manage_orders',
  'debug',
  'bypass_ebay_serial'
];
let user: Ref<User> = ref({});
user.value = props.user;

function toggleRole(role: string) {
  if(!user.value.roles)
    user.value.roles = []
  if(user.value.roles?.includes(role)) {
    return user.value.roles.splice(user.value.roles.indexOf(role), 1)
  }
  user.value.roles?.push(role)
}

function submit() {
  user.value.roles = user.value.roles?.filter((v)=>roles.includes(v))
  emit('update', user.value)
}

</script>
<template>
  <FullScreenPopupComponent>
    <h1 class="mb-4 text-4xl leading-8 md:leading-10">{{props.title}}</h1>
    <form @submit.prevent="submit" class="grid grid-cols-2">
      <label>Email:</label>
      <input class="textbox my-1" type="email" v-model="user.email" />
      <label>First Name:</label>
      <input class="textbox my-1" type="text" v-model="user.first_name" />
      <label>Last Name:</label>
      <input class="textbox my-1" type="text" v-model="user.last_name" />
      <label class="col-span-2">Roles:</label>
      <div class="col-span-2">
        <div class="ml-4 flex" v-for="role in roles">
          <input type="checkbox" v-on:click="toggleRole(role)" class="text-white my-1" :checked='user.roles?.includes(role)'>
          <p>{{ role }}</p>
        </div>
      </div>
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
      <label>Password:</label>
      <input
        class="textbox my-1"
        type="password"
        v-model="user.password"
        :required="props.passwordRequired"
        :placeholder="props.passwordRequired == true ? 'Password' : 'Leave blank for unchanged...'"
      />
      <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        value="Reset"
      />
      <input class="submit col-span-2" type="submit" :value="props.submitText" />
    </form>
  </FullScreenPopupComponent>
</template>
