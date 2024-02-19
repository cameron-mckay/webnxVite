<script setup lang="ts">
import { Notification, NotificationTypes } from '../../plugins/interfaces';
import SVGRoundX from './SVG/SVGRoundX.vue';
import SVGWarning from './SVG/SVGWarning.vue';
import SVGInfo from './SVG/SVGInfo.vue';
import SVGX from './SVG/SVGX.vue';
import { watch } from 'vue';
// Define props
interface Props {
  notifications: Array<Notification>;
}
// Get messages from app
const { notifications } = defineProps<Props>();
let interval: NodeJS.Timer
let intervalCreated = false
// Frame time of 60fps
const UPDATE_INTERVAL = 16.6
const NOTIFICATION_TIME = 5000

// Delete message from array
function deleteNotification(notification: Notification) {
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
    <div
      class="pointer-events-auto mx-8 mb-1 w-fit transition header-color shadow-md"
      v-for="notification in notifications"
    >
      <div class="p-2 flex">
        <div>
          <!-- Icon Here -->
          <SVGRoundX
            class="m-1 w-8 h-8 text-red-500"
            v-if="notification.type==NotificationTypes.Error"
          />
          <SVGWarning
            class="m-1 w-8 h-8 text-yellow-400"
            v-else-if="notification.type==NotificationTypes.Warning"
          />
          <SVGInfo
            class="m-1 w-8 h-8 text-green-400"
            v-else
          />
        </div>
        <div class="mx-4">
          <p class="text-2xl font-bold">{{ notification.type }}</p>
          <p class="max-w-md break-words">{{ notification.text }}</p>
        </div>
        <div>
          <SVGX
            class="h-8 w-8 rounded-md p-2 text-black dark:text-gray-200 hover:hover-color active:active-color"
            v-on:click="deleteNotification(notification)"
          />
          <p class="text-center w-full hover-color rounded-md mt-1" v-if="notification.quantity>1">{{notification.quantity}}</p>
        </div>
      </div>
      <div class="h-1 bg-black dark:bg-gray-200" :style="{ width: `${(notification.ms_left/NOTIFICATION_TIME)*100}%` }"></div>
    </div>
  </div>
</template>
