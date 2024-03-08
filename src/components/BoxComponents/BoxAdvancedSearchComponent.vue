<script setup lang="ts">
import type { BoxSchema } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import BoxManagerComponent from './BoxManagerComponent.vue';
interface Props {
  startBox?: BoxSchema
}
let {startBox} = defineProps<Props>()
const emit = defineEmits(['boxSearch']);
function submit(box: BoxSchema) {
  emit("boxSearch", box)
}
</script>
<template>
  <FullScreenPopupComponent>
    <BoxManagerComponent
      :title="'Advanced Search:'"
      :submitText="'Search'"
      :strict="false"
      :old-box="startBox?startBox:{} as BoxSchema"
      :clear-on-reset="true"
      @boxSubmit="submit"
    />
  </FullScreenPopupComponent>
</template>
