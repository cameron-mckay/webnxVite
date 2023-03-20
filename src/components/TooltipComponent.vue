<script setup lang="ts">
interface Props {
  text: string;
}

const { text } = defineProps<Props>();
</script>
<template>
  <div class="group relative flex w-full flex-col items-center">
    <slot> </slot>
    <div
      class="pointer-events-none absolute top-10 mb-6 hidden flex-col items-center text-center transition group-hover:flex"
    >
      <div class="h-3 w-3 -rotate-45 bg-zinc-400"></div>
      <span
        class="whitespace-no-wrap relative z-10 -mt-2 rounded-lg bg-zinc-400 p-2 text-sm leading-none shadow-lg"
        >{{ text }}</span
      >
    </div>
  </div>
</template>
