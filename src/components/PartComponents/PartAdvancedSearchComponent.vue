<script setup lang="ts">
import type { PartSchema } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import PartManagerComponent from './PartManagerComponent.vue';

const emit = defineEmits(['partSearch']);

function search(part: PartSchema) {
  emit('partSearch', part);
}
</script>

<template>
  <FullScreenPopupComponent>
    <PartManagerComponent
      :oldPart="{}"
      :title="'Advanced Search'"
      :submitText="'Search'"
      @partSubmit="search"
      :strict="false"
    />
  </FullScreenPopupComponent>
</template>
