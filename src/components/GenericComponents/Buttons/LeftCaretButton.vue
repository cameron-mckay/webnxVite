<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGLeftCaret from '../SVG/SVGLeftCaret.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGLeftCaret/>
  </ButtonComponent>
</template>
