<script setup lang="ts">
import LeftCaretButton from '../Buttons/LeftCaretButton.vue';
import RightCaretButton from '../Buttons/RightCaretButton.vue';
interface Props {
  numPages: number
  pageNum: number
}

let { numPages, pageNum } = defineProps<Props>()

</script>
<template>
    <div
      v-if="numPages > 1"
      class="float-right flex select-none"
    >
      <p class="my-auto mr-3 inline-block leading-6">{{ `Page: ${pageNum}` }}</p>
      <LeftCaretButton 
        v-on:click="$emit('loadPage', pageNum-1)"
        v-if="pageNum > 1"
      />
      <div v-else class="button-icon opacity-0"></div>
      <!-- Right Caret -->
      <RightCaretButton
        v-if="pageNum<numPages"
        v-on:click="$emit('loadPage', pageNum+1)"
      />
      <div v-else class="button-icon mr-0 opacity-0"></div>
    </div>
</template>
