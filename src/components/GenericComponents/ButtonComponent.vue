<script setup lang="ts">
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <a :title="title"
    class="button-icon hover:button-icon-hover active:button-icon-active flex justify-center"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 512"
    >
      <slot></slot>
    </svg>
  </a>
</template>
