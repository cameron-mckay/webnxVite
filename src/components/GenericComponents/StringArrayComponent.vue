<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import SVGX from './SVG/SVGX.vue';
import SVGPlus from './SVG/SVGPlus.vue';
import PlusButton from './Buttons/PlusButton.vue';
import XButton from './Buttons/XButton.vue';

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
      <PlusButton
        v-if="index == 0"
        v-on:click='textValues.push("")'
      />
      <!-- X icon -->
      <XButton
        v-else
        v-on:click="textValues.splice(index, 1)"
      />
    </div>
  </div>
</template>
