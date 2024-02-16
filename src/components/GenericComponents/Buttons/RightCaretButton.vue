<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGRightCaret from '../SVG/SVGRightCaret.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGRightCaret/>
  </ButtonComponent>
</template>
