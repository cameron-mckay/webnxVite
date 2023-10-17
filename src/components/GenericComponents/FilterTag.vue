<script setup lang="ts">
  interface Props {
    name: string
  }
  let { name } = defineProps<Props>()
</script>
<template>
  <div class="background-and-border inline-block hover:rounded-bl-md p-2 rounded-md mr-2">
    <div class="my-auto text-black dark:text-gray-200 inline-block align-middle" @click="$emit('remove')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="mr-2 h-6 w-6 rounded-md hover:bab-hover hover:rounded-bl-md active:bg-red-600">
        <path 
          fill="currentColor"
          stroke="currentColor"
          d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
      </svg>
    </div>
    <p class="inline-block align-middle">{{name}}</p>
  </div>
</template>
