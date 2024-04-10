<script setup lang="ts">
import { AuditRecordSchema, PartSchema, User } from '../../plugins/interfaces';
interface Props {
  event: AuditRecordSchema
  user: User
  part: PartSchema
}

let { event, user, part } = defineProps<Props>()

</script>
<template>
  <div class="background-and-border my-4 p-4">
    <h1 class="text-2xl leading-8 md:leading-10">
      {{ new Date(event.date).toLocaleString() }}
    </h1>
    <div class="flex justify-between">
      <div class="grid grid-cols-2">
        <p class="detail-label">By: </p>
        <p class="detail-data">{{ user.first_name + " " + user.last_name }}</p>
        <p class="detail-label">Total Quantity: </p>
        <p class="detail-data">{{ event.total_quantity }}</p>
        <p class="detail-label">NXID: </p>
        <p class="detail-data">{{ part.nxid }}</p>
        <p class="detail-label">Name: </p>
        <p class="detail-data">{{ part.manufacturer }} {{ part.name }}</p>
        <div class="col-span-2" v-if="event.notes">
          <h1 class="text-2xl leading-8 md:leading-10">Notes:</h1>

          <pre class="notes-with-links whitespace-pre-wrap">{{event.notes}}</pre>
        </div>
      </div>
      <div>
        <div
          class="relative grid grid-cols-2 text-center font-bold leading-8 transition md:leading-10 mt-auto"
        >
          <p class="mt-auto">Kiosk</p>
          <p class="mt-auto">Quantity</p>
        </div>
        <div
          class="relative grid grid-cols-2 py-1 leading-8 transition md:leading-10 mt-auto background-and-border hover:bab-hover hover:rounded-bl-md p-2 m-1 text-center"
          v-for="kq in event.kiosk_quantities"
        >
          <p>{{ kq.kiosk }}</p>
          <p>{{ kq.quantity }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
