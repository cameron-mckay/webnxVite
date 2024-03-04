<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGX from '../SVG/SVGX.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGX/>
  </ButtonComponent>
</template>
