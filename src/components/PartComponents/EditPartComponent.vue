<script setup lang="ts">
import { ref } from 'vue';
import type { PartSchema } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import PartManagerComponent from './PartManagerComponent.vue';

interface Props {
  oldPart?: PartSchema;
  show: boolean;
}

const { oldPart, show } = defineProps<Props>();
const emit = defineEmits(['updatePart', 'deletePart']);

let showDelete = ref(false);

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
      :customResetText="'Reset Changes'"
      :strict="true"
      :oldPart="oldPart"
    />
    <div class="flex justify-center">
      <label class="mr-2">I want to delete this part</label>
      <input type="checkbox" v-model="showDelete" />
    </div>
    <div class="flex justify-center">
      <input
        class="submit col-span-2 mt-4 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        value="DELETE PART"
        v-if="showDelete"
        v-on:click="$emit('deletePart', oldPart?.nxid)"
      />
    </div>
  </FullScreenPopupComponent>
</template>
