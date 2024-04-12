<script setup lang="ts">
import { ref } from 'vue';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import FilterTag from '../GenericComponents/FilterTag.vue';
import BoxButton from '../GenericComponents/Buttons/BoxButton.vue';
import type { AxiosError, AxiosInstance } from 'axios';
import type { BoxSchema }from '../../plugins/interfaces'
import BoxSearchPopupComponent from './BoxSearchPopupComponent.vue';


interface Props {
  http: AxiosInstance;
  filterMap: Map<string, BoxSchema>;
}

let { filterMap } = defineProps<Props>()

let filterVisible = ref(false)

function togglePopup() {
  filterVisible.value = !filterVisible.value
}

</script>
<template>
  <div>
    <BoxButton class="mt-auto md:mb-0 mb-2" @click="togglePopup"/>
    <FullScreenPopupComponent
      v-show="filterVisible"
      @toggle="togglePopup"
    >
      <h1 class="my-auto text-4xl mb-2">Filter Boxes</h1>
      <FilterTag class="mb-2" v-for="part of Array.from(filterMap.keys())" :name="part" @remove="filterMap.delete(part)"/>
      <BoxSearchPopupComponent
        :http="http"
        :errorHandler="(err: Error | AxiosError | string) => {}"
        :displayMessage="(message: string) => {}"
        @addAction="(box: BoxSchema)=>{filterMap.set(box.box_tag!, box)}"
      />
    </FullScreenPopupComponent>
  </div>
</template>
