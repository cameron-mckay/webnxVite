<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import SVGX from './SVG/SVGX.vue';

interface Props {
  required: boolean;
  options?: Array<string>;
  defaultValue?: string;
  customName?: string;
  regex?: string;
  disabled?: boolean
  placeholder?: string
  customAtTop?: boolean
  clearPrevOnClose?: boolean
  hideCustom?: boolean
}
// Destructure props
let { required, options, defaultValue, regex, customName, disabled, placeholder, customAtTop, clearPrevOnClose, hideCustom } = defineProps<Props>();
// Define emitter events
const emit = defineEmits(['updateValue']);

// Custom text field option
let custom = ref(false);
// String value for drop down
let textValue = ref('');
// Temp variable
let prevValue = '';
let id = ref("")

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

// Leave custom mode
function closeCustom() {
  if(disabled)
    return
  // Set value to the first option
  textValue.value = clearPrevOnClose ? "" : prevValue;
  // Disable custom value
  custom.value = false;
}

function getDefaultValue() {
  // This is dumb.  Vue doesn't have the methods I need so I'm going vanilla
  // Creating an absurdly large random number so there is 0 change of dupes
  // Duplicates would cause getElementById to fail
  id.value = "customDrop"+getRandomInt(Date.now())
  // This is even dumber.  Using timeouts to wait for the component refresh
  setTimeout(()=>{
    // List of all the options
    let values = [];
    // Mmmmmm vanilla....
    let el = document.getElementById(id.value)
    if(el&&el.children) {
      let { children } = el
      // Check for children of drop down
      if(children&&children.length) {
        // Add all of the values to the array
        for(let i = 0; i < children.length; i++) {
          values.push((children.item(i) as any).value)
        }
        // Filter out non options
        values = values.filter((v)=>v!=""&&v!="Custom"&&v!=customName)
      }
    }
    console.log(values)
    let defaultIsCustom = false
    // Check if default value exists in options
    if (values.indexOf(defaultValue) == -1) {
      // Enable custom value
      custom.value = true;
      if(defaultValue=="Custom")
        defaultIsCustom = true
    }
    // Text value is used as model for drop down regardless
    // of if custom value is present
    textValue.value = defaultIsCustom ? "" :  defaultValue!;
  })
}

onMounted(async () => {
  if (defaultValue) {
    getDefaultValue()
  }
  // Enable watcher on text value
  watch(textValue, (_, oldValue) => {
    console.log("TEST")
    // If drop down is set to custom
    if (textValue.value === 'Custom' && !custom.value && !hideCustom) {
      // Save previous value for if custom gets cleared
      prevValue = oldValue;
      // Set text value to blank string
      textValue.value = '';
      // Enable custom value
      custom.value = true;
    }
    // Emit value update when textValue changes
    emit('updateValue', textValue.value);
  });
});
</script>
<template>
  <select
    v-if="!custom"
    :required="required"
    v-model="textValue"
    class="textbox m-1"
    :id="id"
    :disabled="disabled"
  >
    <option disabled value="">Select</option>
    <option value="Custom" v-if="customAtTop&&!hideCustom">{{ customName ? customName : "Custom" }}</option>
    <option v-for="option in options" :value="option">{{ option }}</option>
    <slot></slot>
    <option value="Custom" v-if="!customAtTop&&!hideCustom">{{ customName ? customName : "Custom" }}</option>
  </select>
  <div class="flex" v-else>
    <input
      :required="required"
      type="text"
      v-model="textValue"
      class="textbox m-1"
      :pattern="regex"
      :disabled="disabled"
      :placeholder="placeholder"
    />
    <!-- X icon -->
    <SVGX
      class="button-icon hover:button-icon-hover active:button-icon-active mt-1 mr-0 h-8 w-8 md:h-10 md:w-10"
      v-on:click="closeCustom"
    />
  </div>
</template>
