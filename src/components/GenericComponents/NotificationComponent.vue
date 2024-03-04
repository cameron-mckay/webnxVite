<script setup lang="ts">
import { NotificationSchema, NotificationTypes } from '../../plugins/interfaces';
import SVGRoundX from './SVG/SVGRoundX.vue';
import SVGWarning from './SVG/SVGWarning.vue';
import SVGInfo from './SVG/SVGInfo.vue';
import SVGBullhorn from './SVG/SVGBullhorn.vue';
import SVGQuestion from './SVG/SVGQuestion.vue'
import SVGX from './SVG/SVGX.vue';

interface Props {
  notification: NotificationSchema
  hide_timer?: boolean
  hide_x?: boolean
}

let { notification, hide_timer, hide_x } = defineProps<Props>()
const NOTIFICATION_TIME = 5000
</script>
<template>
  <div
    class="pointer-events-auto w-fit transition background-and-border shadow-md p-0 m-0 mb-1 "
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
        <SVGBullhorn
          class="text-black dark:text-gray-200 m-1 w-8 h-8"
          v-else-if="notification.type==NotificationTypes.Alert"
        />
        <SVGQuestion
          class="text-black dark:text-gray-200 m-1 w-8 h-8"
          v-else-if="notification.type==NotificationTypes.Question"
        />
        <SVGInfo
          class="m-1 w-8 h-8 text-green-400"
          v-else
        />
      </div>
      <div class="mx-4">
        <p class="text-2xl font-bold">{{ notification.type }}</p>
        <p class="break-words">{{ notification.text }}</p>
      </div>
      <div
        class="ml-auto"
      >
        <SVGX
          id="x"
          v-if="hide_x!=true"
          class="h-8 w-8 rounded-md p-2 text-black dark:text-gray-200 hover:hover-color active:active-color ml-auto"
          v-on:click="$emit('delete')"
        />
        <p
          class="text-center w-full hover-color rounded-md mt-1 p-1"
          v-if="notification.quantity&&notification.quantity>1"
        >
          {{ notification.quantity }}
        </p>
        <p
          class="text-center w-full hover-color rounded-md mt-1 p-1"
          v-if="notification.date"
        >
          {{ new Date(Date.parse(notification.date!.toString())).toLocaleString() }}
        </p>
      </div>
    </div>
    <div
      v-if="hide_timer!=true&&notification.ms_left"
      class="h-1 bg-black dark:bg-gray-200"
      :style="{ width: `${(notification.ms_left/NOTIFICATION_TIME)*100}%` }"
    >
    </div>
  </div>
</template>
