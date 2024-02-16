<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGLeftArrow from '../SVG/SVGLeftArrow.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGLeftArrow/>
  </ButtonComponent>
</template>
