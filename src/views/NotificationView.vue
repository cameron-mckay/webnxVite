<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import LoaderComponent from '../components/GenericComponents/LoaderComponent.vue';
import PageHeaderComponent from '../components/GenericComponents/PageHeaderComponent.vue';
import type {
NotificationSchema,
  UserState,
} from '../plugins/interfaces';
import { onBeforeMount, ref } from 'vue';
import { getPastNotifications, getUnreadNotifications, markAsRead } from '../plugins/dbCommands/notifications';
import NotificationComponent from '../components/GenericComponents/NotificationComponent.vue';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let unreadNotifications = ref([] as NotificationSchema[])
let pastNotifications = ref([] as NotificationSchema[])
let loadingUnread = ref(false)
let loadingPast = ref(false)
let total = ref(0);

onBeforeMount(()=>{
  loadingPast.value = true
  loadUnread()
  loadMore()
  const bc = new BroadcastChannel("nx-push")
  bc.onmessage = (event) => {
    loadUnread()
  }
})

function loadUnread() {
  loadingUnread.value = true
  getUnreadNotifications(http, (data,err) => {
    if(err)
      return errorHandler(err)
    unreadNotifications.value = data as NotificationSchema[]
    loadingUnread.value = false
  })
}

function loadMore() {
  getPastNotifications(http, pastNotifications.value.length, (data: any, err) => {
    if(err)
      return errorHandler(err)
    pastNotifications.value = pastNotifications.value.concat(data.notifications as NotificationSchema[])
    total.value = data.total
    loadingPast.value = false
  })
}

function localMarkAsRead(notif: NotificationSchema) {
  markAsRead(http, notif._id!, (data, err) => {
    if(err)
      errorHandler(err)
    unreadNotifications.value.splice(unreadNotifications.value.indexOf(notif),1)
    pastNotifications.value.unshift(notif)
    // Sort by date
    pastNotifications.value = pastNotifications.value
    .sort((a: NotificationSchema, b: NotificationSchema) => { 
      if (Date.parse(a.date!.toString()) < Date.parse(b.date!.toString()))
        return 1
      return -1
    })
    store.commit("updateNotificationCount", store.state.notificationCount-1)
  })
}
</script>
<template>
  <div>
    <PageHeaderComponent>Notifications</PageHeaderComponent>
    <LoaderComponent v-if="loadingUnread" class="mt-16"/>
    <div v-else>
      <h1 class="text-xl" v-if="unreadNotifications.length>0">Unread:</h1>
      <NotificationComponent
        v-for="notification in unreadNotifications"
        :notification="notification"
        :hide_timer="true"
        @delete="localMarkAsRead(notification)"
        class="w-full"
      />
    </div>
    <LoaderComponent v-if="loadingPast" class="mt-16"/>
    <div v-else>
      <h1 class="text-xl" v-if="pastNotifications.length>0">Dismissed:</h1>
      <NotificationComponent
        v-for="notification in pastNotifications"
        :notification="notification"
        :hide_timer="true"
        :hide_x="true"
        class="w-full"
      />
      
      <div class="flex" v-if="total>pastNotifications.length">
        <input
          type="submit"
          class="submit col-span-2 mx-auto mt-4"
          @click="loadMore"
          value="Show More"
        />
      </div>
    </div>
  </div>
</template>
