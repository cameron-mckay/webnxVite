<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGPallet from '../SVG/SVGPallet.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGPallet/>
  </ButtonComponent>
</template>
