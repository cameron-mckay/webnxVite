<script setup lang="ts">
import { PartSchema } from '../plugins/interfaces';
import PartManagerComponent from './PartManagerComponent.vue';

const emit = defineEmits(['advancedSearch'])

function search(part: PartSchema) {
    emit("advancedSearch", part)
}
</script>
<template>
    <div class="w-full h-full top-0 left-0 absolute z-50 pointer-events-none">
        <div class="p-4 rounded-xl block bg-zinc-300 top-40 mx-auto mt-32 max-w-xl shadow-lg z-50 pointer-events-auto" @click="">
            <PartManagerComponent :title="'Advanced Search'" :submitText="'Search'" :strict="false" @partSubmit="search"/>
        </div>
    </div>
</template>
<style scoped>
input, select {
    @apply textbox;
}
</style>