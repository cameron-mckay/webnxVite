<template>
  <div class="background-and-border p-4">
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      Notification Test
    </PageHeaderWithBackButton>
    <form class="flex justify-between" @submit.prevent="submit">
      <label>Text: </label>
      <input
        id="searchBox"
        class="search ml-0"
        type="text"
        v-model="text"
        placeholder="🔍 keywords..."
      />
      <label>Type: </label>
      <select
        v-model="type"
        class="textbox"
      >
        <option v-for="option in NotificationTypes" :value="option">{{ option }}</option>
      </select>
      <label>Remote?</label>
      <input type="checkbox" v-model="remote"/>
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
import { sendNotifiction } from '../../plugins/dbCommands/notifications';
interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError) => void;
  displayMessage: (message: string, type: NotificationTypes) => void;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let type = ref(NotificationTypes.Info)
let text = ref("")
let remote = ref(false)

function submit() {
  if(remote.value)
    sendNotifcationRemote()
  else
    sendNotificationLocal()
}

function sendNotificationLocal() {
  displayMessage(text.value, type.value)
}

function sendNotifcationRemote() {
  console.log("nope")
}
</script>
