<script setup lang="ts">
import { CheckInRequest, User, PartSchema, CheckInQueuePart, CheckInEvent } from '../../plugins/interfaces'
import XToggleButton from '../GenericComponents/Buttons/XToggleButton.vue';
import CheckToggleButton from '../GenericComponents/Buttons/CheckToggleButton.vue';
import { ref } from 'vue';

interface Props {
  event: CheckInEvent
  user: User
  kiosks: User[]
  parts: Map<string, PartSchema>
}

let { event, user, parts } = defineProps<Props>()

</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="flex justify-between">
      <h1 class="text-2xl leading-8 md:leading-10">
        {{ new Date(event.date).toLocaleString() }}
      </h1>
      <p>
        {{ user.first_name + " " + user.last_name }}
      </p>
    </div>
    <div>
      <div
        class="relative grid grid-cols-3 md:grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
      >
        <p class="mt-auto hidden md:block">NXID</p>
        <p class="mt-auto">Name</p>
        <p class="mt-auto">Quantity/SN</p>
        <p class="mt-auto">Approved</p>
      </div>
      <div v-for="p of event.parts" class="my-2 background-and-border group-hover:bab-hover grid grid-cols-3 md:grid-cols-4 p-1 text-center leading-8 md:p-2 md:leading-10">
        <div class="md:col-span-2 flex flex-wrap md:grid md:grid-cols-2">
          <p class="w-full md:w-auto hidden md:block">{{ p.nxid ? p.nxid : "PNX0000000" }}</p>
          <p class="w-full md:w-auto">{{ parts.has(p.nxid) && parts.get(p.nxid)!.name ? parts.get(p.nxid)!.manufacturer + " " + parts.get(p.nxid)!.name : "DELETED PART" }}</p>
        </div>
        <p>{{ p.serial ? p.serial : p.quantity }}</p>
        <div class="flex justify-center">
            <XToggleButton v-if="!p.approved" :active="true"/>
            <CheckToggleButton v-else :active="true"/>
          </div>
      </div>
    </div>
  </div>
</template>
