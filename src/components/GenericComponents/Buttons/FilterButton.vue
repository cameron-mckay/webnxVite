<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGFilter from '../SVG/SVGFilter.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGFilter/>
  </ButtonComponent>
</template>
