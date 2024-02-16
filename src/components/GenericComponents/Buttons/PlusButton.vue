<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGPlus from '../SVG/SVGPlus.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGPlus/>
  </ButtonComponent>
</template>
