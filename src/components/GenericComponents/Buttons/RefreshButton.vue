<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGRefresh from '../SVG/SVGRefresh.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGRefresh/>
  </ButtonComponent>
</template>
