<script setup lang="ts">
import type { PalletSchema } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import PalletManagerComponent from './PalletManagerComponent.vue';
interface Props {
  startPallet?: PalletSchema
}
let {startPallet} = defineProps<Props>()
const emit = defineEmits(['palletSearch']);
function submit(pallet: PalletSchema) {
  emit("palletSearch", pallet)
}
</script>
<template>
  <FullScreenPopupComponent>
    <PalletManagerComponent
      :title="'Advanced Search:'"
      :submitText="'Search'"
      :strict="false"
      :old-pallet="startPallet?startPallet:{} as PalletSchema"
      :clear-on-reset="true"
      @palletSubmit="submit"
    />
  </FullScreenPopupComponent>
</template>
