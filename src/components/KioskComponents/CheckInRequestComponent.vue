<script setup lang="ts">
import { CheckInRequest, User, PartSchema, CheckInQueuePart } from '../../plugins/interfaces'
import XToggleButton from '../GenericComponents/XToggleButton.vue';
import CheckToggleButton from '../GenericComponents/CheckToggleButton.vue';
import { ref } from 'vue';

interface Props {
  request: CheckInRequest
  user: User
  kiosks: User[]
  parts: Map<string, PartSchema>
}

let { request, user, kiosks, parts } = defineProps<Props>()

let requestCopy = ref(JSON.parse(JSON.stringify(request)) as CheckInRequest)
let emit = defineEmits(["submit"])

function approve(part: CheckInQueuePart) {
  part.approvedCount = part.quantity
  part.approved = true
  part.newLocation = kiosks[0].first_name + " " + kiosks[0].last_name
}

function deny(part: CheckInQueuePart) {
  part.approved = false
  part.approvedCount = 0
  delete part.newLocation
}

function submit() {
  emit("submit", JSON.parse(JSON.stringify(requestCopy.value)))
}

</script>
<template>
  <div class="background-and-border my-4 p-4">

    <div class="flex justify-between">
      <h1 class="mb-8 text-4xl leading-8 md:leading-10">
        {{ new Date(requestCopy.date).toLocaleString() }}
      </h1>
      <p>
        By:
        {{ user.first_name + " " + user.last_name }}
      </p>
    </div>

    <div>
      <div v-for="p of requestCopy.parts" class="my-2 background-and-border group-hover:bab-hover grid grid-cols-5 p-1 text-center leading-8 md:p-2 md:leading-10">
        <p>{{ p.nxid }}</p>
        <p>{{ parts.get(p.nxid)!.manufacturer + " " + parts.get(p.nxid)!.name }}</p>
        <p>{{ p.serial ? p.serial : p.quantity }}</p>
        <div class="my-auto">
          <div class="flex justify-center">
            <XToggleButton @click="deny(p)" :active="p.approved === false"/>
            <CheckToggleButton @click="approve(p)" :active="p.approved === true"/>
          </div>
          <div v-if="p.quantity&&p.quantity>1&&p.approved">
            <p class="leading-6">Approved count: {{ p.approvedCount }}</p>
            <input class="w-full h-2 rounded-lg accent-green-400 cursor-pointer text-gray-200 dark:text-gray-700" type="range" min="1" :max="p.quantity" v-model="p.approvedCount"/>
          </div>
        </div>
        <select class="textbox" v-model="p.newLocation" :disabled="!(p.approved === true)">
          <option v-for="kiosk of kiosks" :value="kiosk.first_name + ' ' + kiosk.last_name">{{ kiosk.first_name + " " + kiosk.last_name }}</option>
        </select>
      </div>
    </div>
    <div class="flex justify-center">
      <input type="submit" @click="submit" class="submit mb-0" value="Submit"/>
    </div>
  </div>
</template>
