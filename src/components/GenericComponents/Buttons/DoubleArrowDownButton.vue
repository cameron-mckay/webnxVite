<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGDoubleArrowDown from '../SVG/SVGDoubleArrowDown.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGDoubleArrowDown/>
  </ButtonComponent>
</template>
