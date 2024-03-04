<script setup lang="ts">
import SVGX from './SVG/SVGX.vue';
  interface Props {
    name: string
  }
  let { name } = defineProps<Props>()
</script>
<template>
  <div class="background-and-border inline-block hover:rounded-bl-md p-2 rounded-md mr-2">
    <div class="my-auto text-black dark:text-gray-200 inline-block align-middle" @click="$emit('remove')">
      <SVGX
        class="mr-2 h-6 w-6 rounded-md hover:bab-hover hover:rounded-bl-md active:bg-red-600"
      />
    </div>
    <p class="inline-block align-middle">{{name}}</p>
  </div>
</template>
