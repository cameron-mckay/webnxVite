<script setup lang="ts">
interface Props {
  numPages: number
  pageNum: number
}
let { numPages, pageNum } = defineProps<Props>()
</script>
<template>
  <div class="ml-auto flex justify-end">
    <a class="mx-1" id="link" @click="$emit('loadPage', 1)" v-if="pageNum>2">1</a>
    <a class="mx-1" v-if="pageNum>2">...</a>
    <a class="mx-1" id="link" v-for="n in ((numPages-(pageNum+1))>5)?5:(numPages-pageNum-2>=0?numPages-pageNum-2:0)" @click="n+pageNum+1<numPages?$emit('loadPage',n+pageNum+1):()=>{}">
      {{ n+pageNum+1 }}
    </a>
    <a class="mx-1" v-if="(numPages-pageNum)>7">...</a>
    <a class="mx-1" id="link" @click="$emit('loadPage', numPages)">{{ numPages}}</a>
  </div>
</template>
