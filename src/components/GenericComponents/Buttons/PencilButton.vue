<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGPencil from '../SVG/SVGPencil.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGPencil/>
  </ButtonComponent>
</template>
