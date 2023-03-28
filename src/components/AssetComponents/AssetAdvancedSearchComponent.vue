<script setup lang="ts">
import { ref } from "vue";
import type { AssetSchema, LoadedCartItem } from "../../plugins/interfaces";
import FullScreenPopupComponent from "../GenericComponents/FullScreenPopupComponent.vue";
import AssetManagerComponent from "./AssetManagerComponent.vue";

// Props interface
let partsOnAsset = [] as LoadedCartItem[];
let oldAsset = ref({} as AssetSchema);
</script>

<template>
  <FullScreenPopupComponent>
    <AssetManagerComponent
      :title="'Advanced Search:'"
      :submitText="'Search'"
      :strict="false"
      :oldAsset="oldAsset"
      :parts="partsOnAsset"
      @assetSubmit="$emit('assetSearch', oldAsset)"
    />
  </FullScreenPopupComponent>
</template>
