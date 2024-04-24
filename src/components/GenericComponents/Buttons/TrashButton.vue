<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGTrash from '../SVG/SVGTrash.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title" class="hover:bg-red-600 active:bg-red-700 dark:hover:bg-red-600 dark:active:bg-red-700">
    <SVGTrash/>
  </ButtonComponent>
</template>
