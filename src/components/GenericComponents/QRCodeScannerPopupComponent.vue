<script setup lang="ts">
import { StreamBarcodeReader } from 'vue-barcode-reader';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import LoaderComponent from './LoaderComponent.vue';
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
    <LoaderComponent v-if="loading"/>
    <StreamBarcodeReader @decode="onDecode" @loaded="loaded"/>
  </FullScreenPopupComponent>
</template>
