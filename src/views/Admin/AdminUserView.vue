<script setup lang="ts">
import { Ref, onMounted, ref } from "vue";
import UserComponent from "../../components/UserComponent.vue";
import { getAllUsers, updateUser } from "../../plugins/dbCommands/userManager";
import { User } from "../../plugins/interfaces";
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from "axios";
import { Router } from "vue-router";
import type { Store } from "vuex";
import UserManagerComponent from "../../components/UserManagerComponent.vue";
import type { UserState } from "../../plugins/interfaces";

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, errorHandler, displayMessage } = defineProps<Props>();
// END OF PROPS

let users: Ref<Array<User>> = ref([]);
let editUser = ref(false);
let currentUser: Ref<User> = ref({});

function getUsers() {
  getAllUsers(http, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    users.value = data as Array<User>;
  });
}

function toggleEdit(user: User) {
  if (!editUser.value) {
    currentUser.value = user;
    editUser.value = true;
  } else {
    currentUser.value = {};
    editUser.value = false;
  }
}

function localUpdateUser(user: User) {
  updateUser(http, user, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    currentUser.value = {};
    toggleEdit({});
    displayMessage("Updated user.");
  });
}

onMounted(() => {
  getUsers();
});
</script>
<template>
  <div>
    <h1 class="mb-4 text-4xl">User Manager</h1>
    <div
      class="relative grid grid-cols-3 p-2 text-center text-sm font-bold leading-8 transition md:grid-cols-5 md:leading-10"
    >
      <p class="hidden md:grid">Email</p>
      <p class="hidden md:grid">First Name</p>
      <p class="hidden md:grid">Last Name</p>
      <p class="grid md:hidden">Name</p>
      <p>Role</p>
    </div>
    <UserComponent
      class="relative grid grid-cols-5 p-2 text-center text-sm leading-10 transition"
      v-for="user in users"
      :user="user"
      @edit="toggleEdit(user)"
    />
    <UserManagerComponent
      v-if="editUser"
      class="pointer-events-auto"
      :user="currentUser"
      :show="editUser"
      @toggle="toggleEdit"
      @update="localUpdateUser"
    />
  </div>
</template>
