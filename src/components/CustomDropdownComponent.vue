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
  <select v-if="!custom" :required="required" v-model="textValue">
    <option disabled value="">Select</option>
    <option value="Custom">Custom</option>
    <option v-for="option in options" :value="option">{{ option }}</option>
  </select>
  <div v-else>
    <input
      :required="true"
      type="text"
      v-model="textValue"
      class="w-[calc(100%-3.25rem)]"
    />
    <img
      class="button-icon"
      src="../assets/x-solid.svg"
      v-on:click="closeCustom"
    />
  </div>
</template>
