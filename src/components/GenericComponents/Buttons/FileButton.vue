<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGFileUpArrow from '../SVG/SVGFileUpArrow.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGFileUpArrow/>
  </ButtonComponent>
</template>
