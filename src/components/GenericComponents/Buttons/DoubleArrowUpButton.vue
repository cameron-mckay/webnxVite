<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGDoubleArrowUp from '../SVG/SVGDoubleArrowUp.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGDoubleArrowUp/>
  </ButtonComponent>
</template>
