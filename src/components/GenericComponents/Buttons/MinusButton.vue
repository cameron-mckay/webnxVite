<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGMinus from '../SVG/SVGMinus.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGMinus/>
  </ButtonComponent>
</template>
