<script setup lang="ts">
import { StreamBarcodeReader } from 'vue-barcode-reader';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import { ref } from 'vue'

const emit = defineEmits(['decoded']);
let loading = ref(true)
function onDecode(nxid: string) {
  emit('decoded', nxid);
}

function loaded() {
  loading.value = false
}
</script>

<template>
  <FullScreenPopupComponent>
    <h1 class="mb-4 text-4xl">QR Scanner:</h1>
    <p class="hidden pb-4 text-center md:block">
      This won't work with front facing cameras or webcams
    </p>
    <div v-if="loading" class="my-4 flex justify-center">
      <div class="loader text-center"></div>
    </div>
    <StreamBarcodeReader @decode="onDecode" @loaded="loaded"></StreamBarcodeReader>
  </FullScreenPopupComponent>
</template>
