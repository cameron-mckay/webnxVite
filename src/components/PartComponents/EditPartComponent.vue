<script setup lang="ts">
import type { PartSchema } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import PartManagerComponent from './PartManagerComponent.vue';

interface Props {
  oldPart?: PartSchema;
  show: boolean;
}

const { oldPart, show } = defineProps<Props>();
const emit = defineEmits(['updatePart', 'deletePart']);

function submit(part: PartSchema, image: File) {
  emit('updatePart', part, image);
}
</script>
<template>
  <FullScreenPopupComponent :show="show">
    <PartManagerComponent
      class="pointer-events-auto"
      :title="'Edit Part: '"
      @partSubmit="submit"
      :submitText="'Update'"
      :strict="true"
      :oldPart="oldPart"
    />
    <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700 w-full"
        type="reset"
        value="DELETE PART"
        v-on:click="$emit('deletePart', oldPart?.nxid)"
      />
  </FullScreenPopupComponent>
</template>
