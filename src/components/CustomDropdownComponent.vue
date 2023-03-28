<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

interface Props {
  required: boolean;
  options: Array<string>;
  defaultValue?: string;
}
// Define props, default value is copied by value when destructured
const props = defineProps<Props>();
// Destructure props
const { required, options, defaultValue } = props;
// Define emitter events
const emit = defineEmits(["updateValue"]);

// Custom text field option
let custom = ref(false);
// String value for drop down
let textValue = ref("");
// Temp variable
let prevValue = "";

// Leave custom mode
function closeCustom() {
  // Set value to the first option
  textValue.value = prevValue;
  // Disable custom value
  custom.value = false;
}

onMounted(async () => {
  // Check if default value is present
  if (defaultValue) {
    // Check if default value exists in options
    if (options.indexOf(defaultValue) == -1) {
      // Enable custom value
      custom.value = true;
    }
    // Text value is used as model for drop down regardless
    // of if custom value is present
    textValue.value = defaultValue;
  }
  // Enable watcher on text value
  watch(textValue, (value, oldValue) => {
    // If drop down is set to custom
    if (textValue.value === "Custom" && !custom.value) {
      // Save previous value for if custom gets cleared
      prevValue = oldValue;
      // Set text value to blank string
      textValue.value = "";
      // Enable custom value
      custom.value = true;
    }
    // Emit value update when textValue changes
    emit("updateValue", textValue.value);
  });
  // Enable watcher on props, since they can change after
  // mount depending on loading conditions
  watch(props, () => {
    // If default value is now present
    if (props.defaultValue) {
      // Set value to default
      textValue.value = props.defaultValue;
    }
  });
});
</script>
<template>
  <select
    v-if="!custom"
    :required="required"
    v-model="textValue"
    class="textbox m-1"
  >
    <option disabled value="">Select</option>
    <option value="Custom">Custom</option>
    <option v-for="option in options" :value="option">{{ option }}</option>
  </select>
  <div class="flex" v-else>
    <input
      :required="true"
      type="text"
      v-model="textValue"
      class="textbox m-1"
    />
    <!-- X icon -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 384 512"
      class="button-icon hover:button-icon-hover active:button-icon-active mt-1 mr-0 h-8 w-8 md:h-10 md:w-10"
      v-on:click="closeCustom"
    >
      <path
        fill="currentColor"
        stroke="currentColor"
        d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
      />
    </svg>
  </div>
</template>
