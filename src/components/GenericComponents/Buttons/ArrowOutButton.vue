<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGArrowOut from '../SVG/SVGArrowOut.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGArrowOut/>
  </ButtonComponent>
</template>
