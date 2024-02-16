<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGSingleArrowDown from '../SVG/SVGSingleArrowDown.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGSingleArrowDown/>
  </ButtonComponent>
</template>
