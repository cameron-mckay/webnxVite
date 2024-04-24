<script setup lang='ts'>
import SearchNavButtons from './SearchNavButtons.vue';
import SearchJumper from './SearchJumperComponent.vue';
interface Props {
  numPages: number
  pageNum: number
}
let { numPages, pageNum } = defineProps<Props>()
let emit = defineEmits(['loadPage'])
function loadPage(pageNum: number) {
  emit('loadPage', pageNum)
}
</script>
<template>
  <div
    v-if="numPages > 1"
    class="ml-auto select-none mb-4"
  >
    <SearchNavButtons :numPages="numPages" :pageNum="pageNum" @loadPage="loadPage"/>
    <SearchJumper :numPages="numPages" :pageNum="pageNum" @loadPage="loadPage"/>
  </div>
</template>
