<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGBox from '../SVG/SVGBox.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGBox/>
  </ButtonComponent>
</template>
