<script setup lang="ts">
import type { PartSchema } from "../plugins/interfaces";
import FullScreenPopupComponent from "./FullScreenPopupComponent.vue";
import PartManagerComponent from "./PartManagerComponent.vue";

interface Props {
  oldPart?: PartSchema;
  show: boolean;
}

const { oldPart } = defineProps<Props>();
const emit = defineEmits(["updatePart"]);

function submit(part: PartSchema) {
  emit("updatePart", part);
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
  </FullScreenPopupComponent>
</template>
