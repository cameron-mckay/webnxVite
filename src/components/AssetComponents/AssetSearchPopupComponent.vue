<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { AssetSchema, PartSchema, TextSearchPage } from '../../plugins/interfaces';
import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import AdvancedSearchComponent from '../../components/AssetComponents/AssetAdvancedSearchComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import AssetComponent from './AssetComponent.vue';
import Cacher from '../../plugins/Cacher';
import { getAssetsByData, getAssetsByTextSearch } from '../../plugins/dbCommands/assetManager';
import { DEFAULT_BUILDING, TEXT_SEARCH_PAGE_SIZE } from '../../plugins/Constants';

// Default building is Ogden - 3
let assets: Ref<AssetSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)
let http = Cacher.getHttp()
onBeforeMount(()=>{
  searchObject.disableRouter()
})

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string) {
  return new Promise<TextSearchPage>((res)=>{
    getAssetsByTextSearch(http, searchString, pageNum, (data: any, err) => {
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

function advancedSearchCallback(buildingNum: number, pageNum: number, searchObject: AssetSchema) {
  return new Promise<TextSearchPage>((res)=>{
    searchObject['advanced'] = 'true';
    searchObject['pageNum'] = pageNum;
    searchObject['pageSize'] = TEXT_SEARCH_PAGE_SIZE;
    // Send request to api
    getAssetsByData(http, searchObject, (data, err) => {
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
  searchObject.newAdvancedSearch(DEFAULT_BUILDING, 1, part)
  toggleAdvanced()
}

function displayResults(page: AssetSchema[]) {
  assets.value = page
}

</script>
<template>
  <div>
    <TextSearchComponent
      :search-object="searchObject"
      @display-results="displayResults"
    >
      <template v-slot:searchIcons>
        <SlidersButton @click="toggleAdvanced"/>
        <AdvancedSearchComponent
          v-if="showAdvanced"
          :start-asset="searchObject.getAdvancedSearchObjectFromRouter() as AssetSchema"
          @assetSearch="advancedSearchButtonPressed"
          @toggle="toggleAdvanced"
        />
      </template>
      <template v-slot:searchHeader>
        <p class="mt-auto">NXID</p>
        <p class="mt-auto md:block hidden">Building</p>
        <p class="mt-auto">Type</p>
        <p class="hidden md:block mt-auto">Chassis</p>
        <p class="hidden md:block mt-auto">Status</p>
      </template>
      <template v-slot:searchResults>
        <AssetComponent
          :add="true"
          @addPartAction="$emit('addAssetAction', asset)"
          v-for="asset in assets"
          v-bind:key="asset._id"
          :asset="asset"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
