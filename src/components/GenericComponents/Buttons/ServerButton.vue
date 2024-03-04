<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGServer from '../SVG/SVGServer.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGServer/>
  </ButtonComponent>
</template>
