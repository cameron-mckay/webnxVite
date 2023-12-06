<script setup lang="ts">
import type { PartSchema } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import PartManagerComponent from './PartManagerComponent.vue';
interface Props {
  startPart?: PartSchema
}

let { startPart } = defineProps<Props>()

const emit = defineEmits(['partSearch']);

function search(part: PartSchema) {
  emit('partSearch', part);
}
</script>

<template>
  <FullScreenPopupComponent>
    <PartManagerComponent
      :oldPart="startPart?startPart:{}"
      :title="'Advanced Search'"
      :submitText="'Search'"
      :clear-on-reset="true"
      @partSubmit="search"
      :strict="false"
    />
  </FullScreenPopupComponent>
</template>
