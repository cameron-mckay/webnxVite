<script setup lang="ts">
import SVGInfo from './SVG/SVGInfo.vue';
interface Props {
  title?: string
}
let { title } = defineProps<Props>()
</script>
<template>
  <a :title="title" class="my-auto">
    <SVGInfo
      class="w-6 h-6 my-auto text-green-400 hover:text-green-600 transition background-color rounded-full"
    />
  </a>
</template>
