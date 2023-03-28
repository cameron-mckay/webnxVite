<script setup lang="ts">
import { StreamBarcodeReader } from "vue-barcode-reader";
import FullScreenPopupComponent from "../GenericComponents/FullScreenPopupComponent.vue";

const emit = defineEmits(["decoded"]);

function onDecode(nxid: string) {
  emit("decoded", nxid);
}
</script>

<template>
  <FullScreenPopupComponent>
    <h1 class="mb-4 text-4xl">QR Scanner:</h1>
    <p class="hidden pb-4 text-center md:block">
      This won't work with front facing cameras or webcams
    </p>
    <StreamBarcodeReader @decode="onDecode"> </StreamBarcodeReader>
  </FullScreenPopupComponent>
</template>
