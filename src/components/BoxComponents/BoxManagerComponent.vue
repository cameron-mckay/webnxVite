<script setup lang="ts">
import { ref, onMounted, watch, onBeforeMount } from 'vue';
import {
BoxSchema,
} from '../../plugins/interfaces';
import CustomDropdownComponent from '../GenericComponents/CustomDropdownComponent.vue';
// Begin props
interface Props {
  title: string;
  submitText: string;
  strict: boolean;
  oldBox: BoxSchema;
  untracked?: boolean;
  isAdmin?: boolean;
  clearOnReset?: boolean;
}
const {
  title,
  submitText,
  strict,
  oldBox,
  untracked,
  isAdmin,
  clearOnReset
} = defineProps<Props>();
// End props
let correction = ref(false)
let boxRef = ref({} as BoxSchema)
let boxCopy = {} as BoxSchema
let emit = defineEmits(['boxSubmit', 'boxReset', 'correctionChanged']);
let key = 0

function submitForm() {
  if((untracked||correction.value)&&!window.confirm("Are you sure you want to submit?"))
    return
  emit("boxSubmit", boxRef.value, correction.value)
}

function reset() {
  boxRef.value = {} as BoxSchema
  if(clearOnReset!=true)
    boxRef.value = JSON.parse(JSON.stringify(boxCopy))
  // Key swap to refresh custom drop downs
  key++
  emit("boxReset")
}

watch(correction, ()=>{
  emit("correctionChanged", correction.value)
})

onBeforeMount(()=>{
  if(oldBox)
    boxRef.value = JSON.parse(JSON.stringify(oldBox))
  if(untracked) {
    correction.value = true
  }
  boxCopy = JSON.parse(JSON.stringify(boxRef.value))
})

onMounted(()=>{
  document.getElementById("tag")?.focus()
})

</script>
<template>
  <div class="body" :key="key">
    <h1 class="mb-4 text-4xl leading-8 md:leading-10">{{ title }}</h1>
    <div class="flex" v-if="isAdmin">
      <label class="mr-1">Correction mode:</label>
      <input type="checkbox" v-model="correction" class="text-white my-1">
    </div>
    <form
      id="form"
      @submit.prevent="submitForm"
      @reset.prevent="reset"
      class="grid grid-cols-2"
    >
      <label>Box Tag:</label>
      <input
        v-on:keydown.enter.prevent
        class="textbox m-1"
        id="tag"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="boxRef.box_tag"
        type="text"
        pattern="BOX([0-9]{7})"
        placeholder="BOX0000000"
      />
      <label>Building:</label>
      <CustomDropdownComponent
        :required="strict"
        :options="['3', '1', '4']"
        @updateValue="(value: string) => { boxRef.building = parseInt(value) }"
        :defaultValue="boxRef.building?.toString()"
      />
      <label>Location:</label>
      <input
        v-on:keydown.enter.prevent
        class="textbox m-1"
        :required="strict"
        v-model="boxRef.location"
        type="text"
        placeholder="Location"
      />
      <div v-if="strict" class="col-span-2 my-4">
        <h1 class="inline-block text-4xl leading-8 md:leading-10">Notes:</h1>
        <textarea
          class="textbox m-1 h-40"
          v-model="boxRef.notes"
          placeholder="Drag to resize"
        />
      </div>
      <slot 
        v-on:keydown.enter.prevent
      >
      </slot>
    <input
      class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
      type="reset"
      value="Reset"
    />
    <input 
      v-on:keydown.enter.prevent
      class="submit col-span-2" type="submit" :value="submitText"
    />
    </form>
  </div>
</template>
