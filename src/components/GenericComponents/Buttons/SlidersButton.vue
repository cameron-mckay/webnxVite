<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGSliders from '../SVG/SVGSliders.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGSliders/>
  </ButtonComponent>
</template>
