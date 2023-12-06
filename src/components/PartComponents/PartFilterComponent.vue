<script setup lang="ts">
import { ref } from 'vue';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import FilterTag from '../GenericComponents/FilterTag.vue';
import PartButton from '../GenericComponents/Buttons/PartButton.vue';
import type { AxiosError, AxiosInstance } from 'axios';
import AssetPartSearchComponent from '../AssetComponents/SearchPartOnAssetComponent.vue'
import type { PartSchema }from '../../plugins/interfaces'


interface Props {
  http: AxiosInstance;
  filterMap: Map<string, PartSchema>;
}

let { filterMap } = defineProps<Props>()

let filterVisible = ref(false)
function togglePopup() {
  filterVisible.value = !filterVisible.value
}

</script>
<template>
  <div>
    <PartButton class="mt-auto md:mb-0 mb-2" @click="togglePopup"/>
    <FullScreenPopupComponent
      v-show="filterVisible"
      @toggle="togglePopup"
    >
      <h1 class="my-auto text-4xl mb-2">Filter Parts</h1>
      <FilterTag class="mb-2" v-for="part of Array.from(filterMap.keys())" :name="part" @remove="filterMap.delete(part)"/>
      <AssetPartSearchComponent
        :http="http"
        :errorHandler="(err: Error | AxiosError | string) => {}"
        :displayMessage="(message: string) => {}"
        @addPartAction="(part: PartSchema)=>{filterMap.set(part.nxid!, part)}"
      />
    </FullScreenPopupComponent>
  </div>
</template>
