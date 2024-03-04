<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGQR from '../SVG/SVGQR.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGQR/>
  </ButtonComponent>
</template>
