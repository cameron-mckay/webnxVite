<script setup lang="ts">
import { CheckInRequest, User, PartSchema, CheckInQueuePart } from '../../plugins/interfaces'
import XToggleButton from '../GenericComponents/Buttons/XToggleButton.vue';
import CheckToggleButton from '../GenericComponents/Buttons/CheckToggleButton.vue';
import { onMounted, ref } from 'vue';
import CustomDropdownComponent from '../GenericComponents/CustomDropdownComponent.vue';

interface Props {
  request: CheckInRequest
  user: User
  kiosks: User[]
  parts: Map<string, PartSchema>
}

let { request, user, kiosks, parts } = defineProps<Props>()

let requestCopy = ref(JSON.parse(JSON.stringify(request)) as CheckInRequest)
let emit = defineEmits(["submit"])

onMounted(()=>{
})

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
  <form class="background-and-border my-4 p-4" @submit.prevent="submit">
    <div class="flex justify-between">
      <h1 class="text-2xl leading-8 md:leading-10">
        {{ new Date(requestCopy.date).toLocaleString() }}
      </h1>
      <p>
        {{ user.first_name + " " + user.last_name }}
      </p>
    </div>
  
    <div
      class="grid grid-cols-5 text-center font-bold"
    >
      <p>NXID</p>
      <p>Name</p>
      <p>Shelf Location</p>
      <p>Quantity/SN</p>
      <p></p>
    </div>

    <div>
      <div v-for="p of requestCopy.parts" class="my-2 background-and-border group-hover:bab-hover grid grid-cols-4 md:grid-cols-5 p-1 text-center leading-8 md:p-2 md:leading-10">
        <div class="md:col-span-2 flex flex-wrap md:grid md:grid-cols-2">
          <p class="w-full md:w-auto">{{ p.nxid ? p.nxid : "PNX0000000" }}</p>
          <p class="w-full md:w-auto">{{ parts.has(p.nxid) ? parts.get(p.nxid)!.manufacturer + " " + parts.get(p.nxid)!.name : "DELETED PART" }}</p>
        </div>
        <div>
          <p class="mt-0 mb-auto">{{ parts.has(p.nxid) ? (parts.get(p.nxid)!.rack_num ? parts.get(p.nxid)!.rack_num : "" + parts.get(p.nxid)!.shelf_location!) : "DELETED PART" }}</p>
        </div>
        <div class="my-auto">
          <p>{{ p.serial ? p.serial : p.quantity }}</p>
          <div class="flex justify-center">
            <XToggleButton @click="deny(p)" :active="p.approved === false"/>
            <CheckToggleButton @click="approve(p)" :active="p.approved === true"/>
          </div>
          <div v-if="p.quantity&&p.quantity>1&&p.approved">
            <p class="leading-6">Approved count: {{ p.approvedCount }}</p>
            <input class="w-full h-2 rounded-md accent-green-400 cursor-pointer text-gray-200 dark:text-gray-700" type="range" min="1" :max="p.quantity" v-model="p.approvedCount"/>
          </div>
        </div>
        <CustomDropdownComponent
          :required="p.approved ? true : false"
          :disabled="!p.approved ? true : false"
          custom-name="Box"
          placeholder="BOX0000000"
          @updateValue="(value: string) => { p.newLocation = value }"
        >
          <option v-for="kiosk of kiosks" :value="kiosk.first_name + ' ' + kiosk.last_name">{{ kiosk.first_name + " " + kiosk.last_name }}</option>
        </CustomDropdownComponent>
      </div>
    </div>
    <div class="flex justify-center">
      <input type="submit" class="submit mb-0" value="Submit"/>
    </div>
  </form>
</template>
