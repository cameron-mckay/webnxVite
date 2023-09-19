
<script setup lang="ts">
import { ref } from 'vue';
import type { PalletSchema, AssetPart } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import PalletManagerComponent from './PalletManagerComponent.vue';

// Props interface
let partsOnAsset = [] as AssetPart[];
let palletRef = ref({} as PalletSchema);
let serialsRef = ref("");
const emit = defineEmits(['palletSearch']);
</script>

<template>
  <FullScreenPopupComponent>
    <PalletManagerComponent
      :title="'Advanced Search:'"
      :submitText="'Search'"
      :assets="[]"
      :strict="false"
      :palletRef="palletRef"
      :parts="partsOnAsset"
      :serialsRef="serialsRef"
      @palletSubmit="$emit('palletSearch', palletRef)"
    />
  </FullScreenPopupComponent>
</template>
