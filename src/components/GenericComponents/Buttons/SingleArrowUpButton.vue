<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGSingleArrowUp from '../SVG/SVGSingleArrowUp.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGSingleArrowUp/>
  </ButtonComponent>
</template>
