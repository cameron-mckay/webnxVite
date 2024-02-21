<script setup lang="ts">
import { NotificationSchema } from '../../plugins/interfaces';
import NotificationComponent from './NotificationComponent.vue';
import { watch } from 'vue';
// Define props
interface Props {
  notifications: Array<NotificationSchema>;
}
// Get messages from app
const { notifications } = defineProps<Props>();
let interval: NodeJS.Timer
let intervalCreated = false
// Frame time of 60fps
const UPDATE_INTERVAL = 16.6

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
        notif.ms_left -= UPDATE_INTERVAL
        // If they are out of time, delete
        if(notif.ms_left<=0) {
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

</script>
<template>
  <div
    class="pointer-events-none fixed top-12 left-0 z-50 mx-auto block w-full"
  >
    <NotificationComponent
      class="max-w-md mx-8"
      v-for="notification in notifications"
      :notification="notification"
      @delete="deleteNotification(notification)"
    />
  </div>
</template>
