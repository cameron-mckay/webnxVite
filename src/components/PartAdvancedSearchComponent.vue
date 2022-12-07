<script setup lang="ts">
import FullScreenPopupComponent from './FullScreenPopupComponent.vue';
import PartManagerComponent from './PartManagerComponent.vue';
import type { PartSchema } from '../plugins/interfaces';
import { AxiosInstance } from 'axios';

interface Props {
    http: AxiosInstance
}

const { http } = defineProps<Props>()
const emit = defineEmits(['partSearch'])

function search(part: PartSchema) {
    emit("partSearch", part)
}
</script>

<template>
    <FullScreenPopupComponent>
        <PartManagerComponent :http="http" :oldPart="{}" :title="'Advanced Search'" :submitText="'Search'" @partSubmit="search" :strict="false"/>
    </FullScreenPopupComponent>
</template>