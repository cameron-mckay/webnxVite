<script setup lang="ts">
import { ref } from 'vue';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import FilterTag from '../GenericComponents/FilterTag.vue';
import PalletButton from '../GenericComponents/Buttons/PalletButton.vue';
import type { AxiosError, AxiosInstance } from 'axios';
import type { PalletSchema }from '../../plugins/interfaces'
import PalletSearchPopupComponent from './PalletSearchPopupComponent.vue';


interface Props {
  http: AxiosInstance;
  filterMap: Map<string, PalletSchema>;
}

let { filterMap } = defineProps<Props>()

let filterVisible = ref(false)

function togglePopup() {
  filterVisible.value = !filterVisible.value
}

</script>
<template>
  <div>
    <PalletButton class="mt-auto md:mb-0 mb-2" @click="togglePopup"/>
    <FullScreenPopupComponent
      v-show="filterVisible"
      @toggle="togglePopup"
    >
      <h1 class="my-auto text-4xl mb-2">Filter Pallets</h1>
      <FilterTag class="mb-2" v-for="part of Array.from(filterMap.keys())" :name="part" @remove="filterMap.delete(part)"/>
      <PalletSearchPopupComponent
        :http="http"
        :errorHandler="(err: Error | AxiosError | string) => {}"
        :displayMessage="(message: string) => {}"
        @addAction="(pallet: PalletSchema)=>{filterMap.set(pallet.pallet_tag!, pallet)}"
      />
    </FullScreenPopupComponent>
  </div>
</template>
