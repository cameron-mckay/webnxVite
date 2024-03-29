<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { PartSchema, TextSearchPage } from '../../plugins/interfaces';
import { getPartsByData, getPartsByTextSearch } from '../../plugins/dbCommands/partManager';

import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import AdvancedSearchComponent from '../../components/PartComponents/PartAdvancedSearchComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';
import Cacher from '../../plugins/Cacher';
import AssetPartComponent from './PartOnAssetComponent.vue';

interface Props {
  hideHeader?: boolean
  showQuantity?: boolean
}

// Default building is Ogden - 3
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)
let http = Cacher.getHttp()
let { hideHeader, showQuantity } = defineProps<Props>()
onBeforeMount(()=>{
  searchObject.disableRouter()
})

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string) {
  return new Promise<TextSearchPage>((res)=>{
    getPartsByTextSearch(http, searchString, pageNum, 3, (data: any, err) => {
      if (err) {
        // Send error to error handler
        return res({pages: 0, total: 0, items: []})
      }
      // Typecast response
      let response = data as TextSearchPage
      // Resolve promise
      res(response);
    });
  })
}

function advancedSearchCallback(buildingNum: number, pageNum: number, searchObject: PartSchema) {
  return new Promise<TextSearchPage>((res)=>{
    searchObject['advanced'] = 'true';
    searchObject['pageNum'] = pageNum;
    searchObject['pageSize'] = 50;
    // Send request to api
    getPartsByData(http, searchObject, (data, err) => {
      if (err) {
        // Send error to error handler
        return res({pages: 0, total: 0, items: []})
      }
      let response = data as TextSearchPage
      // Resolve promise
      res(response);
    });
  })
}

// Toggle advanced search
function toggleAdvanced() {
  // Negate
  showAdvanced.value = !showAdvanced.value;
}

async function advancedSearchButtonPressed(part: PartSchema) {
  searchObject.newAdvancedSearch(3, 1, part)
  toggleAdvanced()
}

function displayResults(page: PartSchema[]) {
  parts.value = page
}

</script>
<template>
  <div>
    <PageHeaderComponent class="mb-4" v-if="hideHeader!=true">Part Search</PageHeaderComponent>
    <TextSearchComponent
      :search-object="searchObject"
      @display-results="displayResults"
    >
      <template v-slot:searchIcons>
        <SlidersButton @click="toggleAdvanced"/>
        <AdvancedSearchComponent
          v-if="showAdvanced"
          :startPart="searchObject.getAdvancedSearchObjectFromRouter() as PartSchema"
          @toggle="toggleAdvanced"
          @partSearch="advancedSearchButtonPressed"
        />
      </template>
      <template v-slot:searchHeader>
        <p>NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p v-if="showQuantity">Quantity</p>
      </template>
      <template v-slot:searchResults>
        <AssetPartComponent
          v-for="part in parts"
          v-bind:key="part._id"
          @addPartAction="$emit('addPartAction', part)"
          :part="part"
          :showQuantity="showQuantity"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
