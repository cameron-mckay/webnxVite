<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from 'vue';
import {
  AssetSchema, BuildKitSchema, User,
} from '../../plugins/interfaces';

interface Props {
  title: string;
  submitText: string;
  strict: boolean;
  oldKit: AssetSchema;
  untracked?: boolean;
  isAdmin?: boolean;
  clearOnReset?: boolean;
  kiosks: User[];
}

// Begin props
const {
  title,
  submitText,
  strict,
  oldKit,
  untracked,
  clearOnReset
} = defineProps<Props>();
// End props
let correction = ref(false)
let kitRef = ref({} as BuildKitSchema)
let kitCopy = {} as BuildKitSchema
let emit = defineEmits(['kitSubmit', 'kitReset', 'correctionChanged']);
let key = 0;
let selectedKiosk = ref()

onBeforeMount(()=>{
  if(oldKit)
    kitRef.value = JSON.parse(JSON.stringify(oldKit))
  if(untracked) {
    correction.value = true
  }
  kitCopy = JSON.parse(JSON.stringify(kitRef.value))
})

function submitForm() {
  if((untracked||correction.value)&&!window.confirm("Are you sure you want to submit?"))
    return
  kitRef.value.kiosk = selectedKiosk.value
  emit("kitSubmit", kitRef.value, correction.value)
}

function reset() {
  kitRef.value = {} as BuildKitSchema
  if(clearOnReset!=true)
    kitRef.value = JSON.parse(JSON.stringify(kitCopy))
  // Key swap to refresh custom drop downs
  key++
  emit("kitReset")
}

onMounted(()=>{
  document.getElementById("tag")?.focus()
})

</script>
<template>
  <div class="body" :key="key">
    <h1 class="mb-4 text-4xl leading-8 md:leading-10">{{ title }}</h1>
    <form
      id="form"
      @submit.prevent="submitForm"
      @reset.prevent="reset"
      class="grid grid-cols-2"
    >
      <label>Kit Name:</label>
      <input
        class="textbox m-1"
        id="tag"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="kitRef.kit_name"
        type="text"
      />
      <label>Kiosk:</label>
      <select
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="selectedKiosk"
        class="textbox m-1"
      >
        <option :value="undefined" selected disabled>Select</option>
        <option :value="kiosk._id" v-for="kiosk of kiosks">{{ kiosk.first_name }} {{ kiosk.last_name }}</option>
      </select>
      <div v-if="strict" class="col-span-2 my-4">
        <h1 class="inline-block text-4xl leading-8 md:leading-10">Notes:</h1>
        <textarea
          class="textbox m-1 h-40"
          v-model="kitRef.notes"
          placeholder="Drag to resize"
        />
      </div>
      <slot></slot>
      <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        value="Reset"
      />
      <input 
        class="submit col-span-2" type="submit" :value="submitText"
      />
    </form>
  </div>
</template>
