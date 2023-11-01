<script setup lang="ts">
interface Props {
  active: boolean
  red?: boolean
}
let { active, red } = defineProps<Props>()
</script>
<template>
  <svg
    v-if="red"
    xmlns="http://www.w3.org/2000/svg"
    class="toggle-button hover:toggle-button-hover-red active:toggle-button-active-red flex justify-center"
    :class="{ 'toggle-button-inactive': !active, 'toggle-button-active-red': (active) }"
    viewBox="0 0 448 512"
  >
    <slot></slot>
  </svg>
  <svg
    v-else
    xmlns="http://www.w3.org/2000/svg"
    class="toggle-button hover:toggle-button-hover active:toggle-button-active flex justify-center"
    :class="{ 'toggle-button-inactive': !active, 'toggle-button-active': active }"
    viewBox="0 0 448 512"
  >
    <slot></slot>
  </svg>
</template>
