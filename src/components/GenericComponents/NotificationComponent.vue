<script setup lang="ts">
import { Notification, NotificationTypes } from '../../plugins/interfaces';
import SVGRoundX from './SVG/SVGRoundX.vue';
import SVGWarning from './SVG/SVGWarning.vue';
import SVGInfo from './SVG/SVGInfo.vue';
import SVGX from './SVG/SVGX.vue';
// Define props
interface Props {
  notifications: Array<Notification>;
}
// Get messages from app
const { notifications } = defineProps<Props>();

// Delete message from array
function deleteNotification(notification: Notification) {
  let i = notifications.indexOf(notification);
  notifications.splice(i, 1);
}
</script>
<template>
  <div
    class="pointer-events-none fixed top-12 left-0 z-50 mx-auto block w-full"
  >
    <div
      class="pointer-events-auto mx-8 mb-1 p-2 w-fit transition header-color shadow-md"
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
          <p class="text-center w-full" v-if="notification.quantity>1">{{notification.quantity}}</p>
        </div>
      </div>
    </div>
  </div>
</template>
