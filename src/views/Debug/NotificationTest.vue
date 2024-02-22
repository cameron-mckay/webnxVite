<template>
  <div class="background-and-border p-4">
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      Notification Test
    </PageHeaderWithBackButton>
    <h1 class="text-2xl mt-4 mb-1">
      Local:
    </h1>
    <form class="flex justify-between" @submit.prevent="submit">
      <label>Text: </label>
      <input
        id="searchBox"
        class="search ml-0"
        type="text"
        v-model="text"
        placeholder="Notification text...."
      />
      <label>Type: </label>
      <select
        v-model="type"
        class="textbox"
      >
        <option v-for="option in NotificationTypes" :value="option">{{ option }}</option>
      </select>
      <input class="search-button mr-0" type="submit" value="Send" />
    </form>
    <h1 class="text-2xl mt-4 mb-1">
      Remote User:
    </h1>
    <form class="flex justify-between" @submit.prevent="submitUser">
      <label>Text: </label>
      <input
        id="searchBox"
        class="search ml-0"
        type="text"
        v-model="textRemoteUser"
        placeholder="Notification text...."
      />
      <label>Type: </label>
      <select
        v-model="typeRemoteUser"
        class="textbox"
      >
        <option v-for="option in NotificationTypes" :value="option">{{ option }}</option>
      </select>
      <label>User: </label>
      <select
        v-model="currentUser"
        class="textbox"
      >
        <option v-for="option in allUsers" :value="option._id">{{ option.first_name }} {{ option.last_name }}</option>
      </select>
      <input class="search-button mr-0" type="submit" value="Send" />
    </form>

    <h1 class="text-2xl mt-4 mb-1">
      Remote Role:
    </h1>
    <form class="flex justify-between" @submit.prevent="submitRole">
      <label>Text: </label>
      <input
        id="searchBox"
        class="search ml-0"
        type="text"
        v-model="textRemoteRole"
        placeholder="Notification text...."
      />
      <label>Type: </label>
      <select
        v-model="typeRemoteRole"
        class="textbox"
      >
        <option v-for="option in NotificationTypes" :value="option">{{ option }}</option>
      </select>
      <label>Role: </label>
      <input
        id="searchBox"
        class="search ml-0"
        type="text"
        v-model="remoteRole"
        placeholder="role...."
      />
      <input class="search-button mr-0" type="submit" value="Send" />
    </form>
    <h1 class="text-2xl mt-4 mb-1">
      Payload Remote Role:
    </h1>
    <form class="flex justify-between" @submit.prevent="submitUserPayload">
      <label>User: </label>
      <select
        v-model="payloadUser"
        class="textbox"
      >
        <option v-for="option in allUsers" :value="option._id">{{ option.first_name }} {{ option.last_name }}</option>
      </select>
      <input class="search-button mr-0" type="submit" value="Send" />
    </form>
    <h1 class="text-2xl mt-4 mb-1">
      Payload Remote Role:
    </h1>
    <form class="flex justify-between" @submit.prevent="submitRolePayload">
      <label>Role: </label>
      <input
        id="searchBox"
        class="search ml-0"
        type="text"
        v-model="payloadRole"
        placeholder="role...."
      />
      <input class="search-button mr-0" type="submit" value="Send" />
    </form>
  </div>
</template>
<script setup lang="ts">
import { AxiosInstance, AxiosError } from 'axios';
import { Store } from 'vuex';
import { NotificationTypes, UserState } from '../../plugins/interfaces';
import { Router } from 'vue-router';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import { ref } from 'vue';
import Cacher from '../../plugins/Cacher';
import { sendNotificationToRole, sendNotificationToUser, sendPayloadToRole, sendPayloadToUser } from '../../plugins/dbCommands/notifications';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError) => void;
  displayMessage: (message: string, type: NotificationTypes) => void;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
let allUsers = ref(Cacher.getAllUsers())
let type = ref(NotificationTypes.Info)
let text = ref("")
let typeRemoteUser = ref(NotificationTypes.Info)
let textRemoteUser = ref("")
let typeRemoteRole = ref(NotificationTypes.Info)
let textRemoteRole = ref("")
let currentUser = ref(allUsers.value[0]._id)
let remoteRole = ref("")
let payloadUser = ref("")
let payloadRole = ref("")

function submit() {
  displayMessage(text.value, type.value)
}

function submitUser() {
  sendNotificationToUser(http, currentUser.value!, textRemoteUser.value, typeRemoteUser.value, (data, err)=>{
    if(err)
      errorHandler(err)
  })
}

function submitRole() {
  sendNotificationToRole(http, remoteRole.value, textRemoteRole.value, typeRemoteRole.value, (data, err)=>{
    if(err)
      errorHandler(err)
  })
}

function submitUserPayload() {
  sendPayloadToUser(http, payloadUser.value, (data, err) => {
    if(err)
      errorHandler(err)
  })
}

function submitRolePayload() {
  sendPayloadToRole(http, payloadRole.value, (data, err) => {
    if(err)
      errorHandler(err)
  })
}
</script>
