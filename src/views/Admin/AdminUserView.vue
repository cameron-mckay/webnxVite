<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import UserComponent from '../../components/AdminComponents/UserComponent.vue';
import { getAllUsers, updateUser } from '../../plugins/dbCommands/userManager';
import { User } from '../../plugins/interfaces';
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import UserManagerComponent from '../../components/AdminComponents/UserManagerComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import type { UserState } from '../../plugins/interfaces';

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
let loading = ref(false);

function getUsers() {
  loading.value = true;
  getAllUsers(http, (data, err) => {
    loading.value = false;
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
    displayMessage('Updated user.');
  });
}

onMounted(() => {
  getUsers();
});
</script>
<template>
  <div>
    <PageHeaderWithBackButton :router="router" prevPath="'/manage'">
      User Manager
    </PageHeaderWithBackButton>
    <div
      class="relative grid grid-cols-3 p-2 text-center text-sm font-bold leading-8 transition md:grid-cols-5 md:leading-10"
    >
      <p class="hidden md:grid">Email</p>
      <p class="hidden md:grid">First Name</p>
      <p class="hidden md:grid">Last Name</p>
      <p class="grid md:hidden">Name</p>
      <p>Role</p>
    </div>
    <LoaderComponent v-if="loading"/>
    <div v-else class="md:animate-bottom">
      <UserComponent
        class="relative grid grid-cols-5 text-center text-sm leading-10 transition"
        v-for="user in users"
        :user="user"
        :edit="true"
        @edit="toggleEdit(user)"
      />
    </div>
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
