<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGListCheck from '../SVG/SVGListCheck.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGListCheck/>
  </ButtonComponent>
</template>
