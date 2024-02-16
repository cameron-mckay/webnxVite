<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGEye from '../SVG/SVGEye.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGEye/>
  </ButtonComponent>
</template>
