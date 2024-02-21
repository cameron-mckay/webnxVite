<script setup lang="ts">
import { NotificationSchema, NotificationTypes, UserState } from '../../plugins/interfaces';
import NotificationComponent from './NotificationComponent.vue';
import { ref, watch } from 'vue';
import { Store } from 'vuex';
import { getPublicKey, registerEndpoint } from '../../plugins/dbCommands/notifications';
import { urlBase64ToUint8Array } from '../../plugins/CommonMethods';
import { AxiosInstance } from 'axios';
// Define props
interface Props {
  notifications: Array<NotificationSchema>;
  store: Store<UserState>;
  http: AxiosInstance;
}
// Get messages from app
const { notifications, store, http } = defineProps<Props>();
let interval: NodeJS.Timer
let intervalCreated = false
// Frame time of 60fps
const UPDATE_INTERVAL = 16.6
let perms = ref(Notification.permission)
let hidePopup1 = ref(false)
let hidePopup2 = ref(false)

// Delete message from array
function deleteNotification(notification: NotificationSchema) {
  let i = notifications.indexOf(notification);
  notifications.splice(i, 1);
}

watch(notifications, ()=>{
  // If notifications exist and the interval does not exist
  if(notifications.length>0 && !intervalCreated) {
    // Set interval as created
    intervalCreated = true
    // Create the interval
    interval = setInterval(()=>{
      // Loop through all notifs
      for(let notif of notifications) {
        // Decrement the time left
        notif.ms_left! -= UPDATE_INTERVAL
        // If they are out of time, delete
        if(notif.ms_left!<=0) {
          notifications.splice(notifications.indexOf(notif),1)
        }
      }
    },UPDATE_INTERVAL)
  }
  // If there are no notifcations left
  else if (notifications.length == 0){
    // Set the interval created to false
    intervalCreated = false
    // Clear the interval
    clearInterval(interval)
  }
})

function requestNotifications() {
  Notification.requestPermission()
    .then(()=>{
      perms.value = Notification.permission
      if(Notification.permission === "granted")
        // Get the registration from service worker
        navigator.serviceWorker.ready
          .then((reg) => {
            return reg.pushManager.getSubscription()
              .then(async (sub)=>{
                if(sub)
                  return sub
                const key = await getPublicKey(http)
                const convertedKey = urlBase64ToUint8Array(key)
                return reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: convertedKey
                });
              })
          })
          .then((sub) => {
            // Send registration info to server
            registerEndpoint(http, sub, (data, err) =>{
              if(err)
                return
            })
          })
    })
}

</script>
<template>
  <div
    class="pointer-events-none fixed top-12 left-0 z-50 mx-auto block w-full"
  >
    <NotificationComponent
      v-if="perms==='default'&&store.state.isAuth&&!hidePopup1"
      class="max-w-md mx-8"
      :notification="{
        text: 'Click to enable push notifications...',
        type: NotificationTypes.Info,
      }"
      @click="requestNotifications"
      @delete="()=>{
        hidePopup1 = true
      }"
    />
    <NotificationComponent
      v-if="perms==='denied'&&store.state.isAuth&&!hidePopup2"
      class="max-w-md mx-8"
      :notification="{
        text: 'You have denied push notification access.  Please allow notifications in site settings...',
        type: NotificationTypes.Error,
      }"
      @delete="()=>{
        hidePopup2 = true
      }"
    />
    <NotificationComponent
      class="max-w-md mx-8"
      v-for="notification in notifications"
      :notification="notification"
      @delete="deleteNotification(notification)"
    />
  </div>
</template>
