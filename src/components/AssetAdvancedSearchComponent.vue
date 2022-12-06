<script setup lang="ts">
import FullScreenPopupComponent from './FullScreenPopupComponent.vue';
import AssetManagerComponent from './AssetManagerComponent.vue';
import type { PartSchema } from '../plugins/interfaces';

const emit = defineEmits(['assetSearch'])

function search(part: PartSchema) {
    emit("assetSearch", part)
}
</script>

<template>
    <FullScreenPopupComponent>
        <AssetManagerComponent :oldAsset="{}" :title="'Advanced Search'" :submitText="'Search'" @assetSubmit="search" :strict="false"/>
    </FullScreenPopupComponent>
</template>