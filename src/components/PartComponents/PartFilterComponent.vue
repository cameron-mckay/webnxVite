<script setup lang="ts">
import { ref } from 'vue';
import FilterButton from '../GenericComponents/FilterButton.vue'
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import FilterTag from '../GenericComponents/FilterTag.vue';
import type { AxiosError, AxiosInstance } from 'axios';
import AssetPartSearchComponent from '../AssetComponents/SearchPartOnAssetComponent.vue'
import type { PartSchema }from '../../plugins/interfaces'


interface Props {
  http: AxiosInstance;
  filterMap: Map<string, PartSchema>;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

let { filterMap } = defineProps<Props>()

let filterVisible = ref(false)
function togglePopup() {
  filterVisible.value = !filterVisible.value
}

function addToFilters(part: PartSchema) {
  filterMap.set(part.nxid!, part)
}

</script>
<template>
  <FilterButton class="mr-4" @click="togglePopup"/>
  <FullScreenPopupComponent
    v-show="filterVisible"
    @toggle="togglePopup"
  >
    <h1 class="my-auto text-4xl mb-2">Filter Parts</h1>
    <FilterTag class="mb-2" v-for="part of Array.from(filterMap.keys())" :name="part" @remove="filterMap.delete(part)"/>
    <AssetPartSearchComponent
      :http="http"
      :errorHandler="errorHandler!"
      :displayMessage="displayMessage!"
      @addPartAction="addToFilters"
    />
  </FullScreenPopupComponent>
</template>
