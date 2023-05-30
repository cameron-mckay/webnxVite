<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

interface Props {
  required: boolean;
  placeholder?: string;
  defaultValue?: string[]|string;
}
// Define props, default value is copied by value when destructured
const props = defineProps<Props>();
// Destructure props
const { defaultValue, required, placeholder } = props;
// Define emitter events
const emit = defineEmits(['updateValue']);

// String value for drop down
let textValues = ref(['']);
onMounted(()=>{
  // Check for default value
  if(defaultValue){
    // Check if array
    if(Array.isArray(defaultValue)){
      textValues.value = defaultValue 
    }
    // Check if string
    else if(typeof(defaultValue)=='string') {
      textValues.value[0] = defaultValue
    }
  }
  watch(textValues.value, (value, oldValue) => {
    // Emit value update when textValue changes
    emit('updateValue', textValues.value);
  });
})
</script>
<template>
  <div>
    <div v-for="(item, index) of textValues.length" class="flex">
      <input
        :required="required"
        type="text"
        v-model="textValues[index]"
        class="textbox m-1"
        :placeholder="placeholder"
      />
        <!-- Plus -->
        <svg
          v-if="index == textValues.length - 1"
          v-on:click='textValues.push("")'
          class="button-icon hover:button-icon-hover active:button-icon-active mt-1 mr-0 h-8 w-8 md:h-10 md:w-10"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
          />
        </svg>

      <!-- X icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 384 512"
        v-else
        class="button-icon hover:button-icon-hover active:button-icon-active mt-1 mr-0 h-8 w-8 md:h-10 md:w-10"
        v-on:click="textValues.splice(index, 1)"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
        />
      </svg>
    </div>
  </div>
</template>
