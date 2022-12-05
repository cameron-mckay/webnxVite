<script setup lang="ts">
import FullScreenPopupComponent from './FullScreenPopupComponent.vue';
import PartManagerComponent from './PartManagerComponent.vue';
import type { PartSchema } from '../plugins/interfaces';

const emit = defineEmits(['partSearch'])

function search(part: PartSchema) {
    emit("partSearch", part)
}
</script>

<template>
    <FullScreenPopupComponent>
        <PartManagerComponent :title="'Advanced Search'" :submitText="'Search'" @partSubmit="search" :strict="false"/>
    </FullScreenPopupComponent>
</template>
<style scoped>
input, select {
    @apply textbox;
}
</style>