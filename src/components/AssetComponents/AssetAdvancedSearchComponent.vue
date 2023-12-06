<script setup lang="ts">
import type { AssetSchema } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import AssetManagerComponent from './AssetManagerComponent.vue';
interface Props {
  startAsset?: AssetSchema
}
let { startAsset } = defineProps<Props>()
const emit = defineEmits(['assetSearch']);
function submit(asset: AssetSchema) {
  emit("assetSearch", asset)
}
</script>
<template>
  <FullScreenPopupComponent>
    <AssetManagerComponent
      :title="'Advanced Search:'"
      :submitText="'Search'"
      :strict="false"
      :oldAsset="startAsset?startAsset:{}"
      :clear-on-reset="true"
      @assetSubmit="submit"
    />
  </FullScreenPopupComponent>
</template>
