<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import { dateToHTML, getLastMonth, getTodaysDate, HTMLToDate } from "../../plugins/dateFunctions"

interface Props {
  startDateEpoch?: number
  endDateEpoch?: number
  showExport?: boolean
}

let { startDateEpoch, endDateEpoch, showExport } = defineProps<Props>()
let startDateRef = ref(dateToHTML(getLastMonth()))
let endDateRef = ref(dateToHTML(getTodaysDate()))

onBeforeMount(()=>{
  // Check if start date is valid
  if(startDateEpoch&&startDateEpoch<Date.now()&&endDateEpoch&&startDateEpoch<endDateEpoch)
    // Set start date
    startDateRef.value = dateToHTML(new Date(startDateEpoch))
  // Check if end date is valid
  if(startDateEpoch&&endDateEpoch&&endDateEpoch>startDateEpoch&&endDateEpoch<getTodaysDate().getTime())
    // Set end date
    endDateRef.value = dateToHTML(new Date(endDateEpoch))
})

</script>
<template>
  <form @submit.prevent="$emit('search', HTMLToDate(startDateRef), HTMLToDate(endDateRef))" class="flex flex-wrap">
    <div class="w-full md:w-auto flex">
      <div class="mb-2 md:m-0">
        <label>Start Date: </label>
        <br class="md:hidden">
        <input class="textbox w-auto md:mr-1" type="date" v-model="startDateRef" :max="endDateRef"/>
      </div>
      <div class="mb-2 md:m-0">
        <label class="md:m-2">End Date: </label>
        <br class="md:hidden">
        <input class="textbox w-auto md:mr-1" type="date" v-model="endDateRef" :min="startDateRef" :max="dateToHTML(getTodaysDate())"/>
      </div>
    </div>
    <slot>
    </slot>
    <input class="search-button mr-0 md:ml-1 mb-2 md:mb-0" type="submit" value="Go" />
    <input v-if="showExport" class="search-button mr-0 md:ml-1 mb-2 md:mb-0 bg-blue-400 hover:bg-blue-500 active:bg-blue-600" type="button" value="CSV" @click="$emit('export', HTMLToDate(startDateRef), HTMLToDate(endDateRef))"/>
  </form>
</template>
