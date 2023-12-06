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
      class="select-none flex justify-end flex-col"
    >
    <p class="mb-2 mr-2 inline-block leading-6 text-right">{{ `Page: ${pageNum}` }}</p>
    <div class="justify-end flex ml-4">
      <LeftCaretButton 
        class="mt-auto mb-0"
        v-on:click="$emit('loadPage', pageNum-1)"
        v-if="pageNum > 1"
      />
      <div v-else class="button-icon opacity-0"></div>
      <!-- Right Caret -->
      <RightCaretButton
        class="mt-auto mb-0"
        v-if="pageNum<numPages"
        v-on:click="$emit('loadPage', pageNum+1)"
      />
      <div v-else class="button-icon mr-0 opacity-0"></div>
    </div>
    </div>
</template>
