<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGPart from '../SVG/SVGPart.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGPart/>
  </ButtonComponent>
</template>
