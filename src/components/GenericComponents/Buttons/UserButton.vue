<script setup lang="ts">
import ButtonComponent from '../BaseButtonComponent.vue'
import SVGUser from '../SVG/SVGUser.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <ButtonComponent :title="title">
    <SVGUser/>
  </ButtonComponent>
</template>
