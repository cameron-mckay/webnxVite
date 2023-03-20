<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

interface Props {
  required: boolean;
  options: Array<string>;
  defaultValue?: string;
}

const props = defineProps<Props>();
const { required, options, defaultValue } = props;
const emit = defineEmits(["updateValue"]);

let custom = ref(false);
let textValue = ref("");

function closeCustom() {
  textValue.value = "";
  custom.value = false;
}

onMounted(async () => {
  if (defaultValue) {
    if (options.indexOf(defaultValue) == -1) {
      custom.value = true;
    }
    textValue.value = defaultValue;
  }
  watch(textValue, () => {
    if (textValue.value === "Custom") {
      textValue.value = "";
      custom.value = true;
    }
    emit("updateValue", textValue.value);
  });
  watch(props, () => {
    if (props.defaultValue) {
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
      class="inline-blockactive:bg-red-600 m-1 h-8 w-8 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-red-500"
      src="../assets/x-solid.svg"
      v-on:click="closeCustom"
    />
  </div>
</template>
