<script setup lang="ts">
import { ref } from 'vue';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import FilterTag from '../GenericComponents/FilterTag.vue';
import ServerButton from '../GenericComponents/Buttons/ServerButton.vue';
import AssetSearchPopupComponent from './AssetSearchPopupComponent.vue';
import type { AxiosError, AxiosInstance } from 'axios';
import type { AssetSchema, PartSchema }from '../../plugins/interfaces'


interface Props {
  http: AxiosInstance;
  filterMap: Map<string, AssetSchema>;
}

let { filterMap } = defineProps<Props>()

let filterVisible = ref(false)
function togglePopup() {
  filterVisible.value = !filterVisible.value
}

</script>
<template>
  <div>
    <ServerButton class="mt-auto md:mb-0 mb-2" @click="togglePopup"/>
    <FullScreenPopupComponent
      v-show="filterVisible"
      @toggle="togglePopup"
    >
      <h1 class="my-auto text-4xl mb-2">Filter Assets</h1>
      <FilterTag class="mb-2" v-for="part of Array.from(filterMap.keys())" :name="part" @remove="filterMap.delete(part)"/>
      <AssetSearchPopupComponent
        :http="http"
        :errorHandler="(err: Error | AxiosError | string) => {}"
        :displayMessage="(message: string) => {}"
        @addAssetAction="(asset: AssetSchema)=>{filterMap.set(asset.asset_tag!, asset)}"
      />
    </FullScreenPopupComponent>
  </div>
</template>
