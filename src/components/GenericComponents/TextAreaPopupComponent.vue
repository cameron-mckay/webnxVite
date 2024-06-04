<script setup lang="ts">
import { ref } from 'vue';
import FullScreenPopupComponent from './FullScreenPopupComponent.vue';

interface Props {
  title: string
  placeholder?: string
  submitText?: string
}

let { title, placeholder, submitText } = defineProps<Props>()

let input = ref("")
let emit = defineEmits(['submit'])

function submitString() {
  emit('submit', input.value)
}

</script>
<template>
  <FullScreenPopupComponent>
    <h1 class="my-auto text-4xl mb-4">{{ title }}</h1>
    <form
      id="form"
      @submit.prevent="submitString"
    >
      <textarea
        class="textbox m-1"
        required
        v-model="input"
        :placeholder="placeholder"
      />
      <input class="submit col-span-2 mx-auto block" type="submit" :value="submitText ? submitText : 'Submit'" />
    </form>
  </FullScreenPopupComponent>
</template>
