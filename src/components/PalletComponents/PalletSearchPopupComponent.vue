<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { AssetSchema, PalletSchema, PartSchema, TextSearchPage } from '../../plugins/interfaces';
import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import AdvancedSearchComponent from '../../components/AssetComponents/AssetAdvancedSearchComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import Cacher from '../../plugins/Cacher';
import PalletComponent from './PalletComponent.vue';
import { getPalletsByData, getPalletsByTextSearch } from '../../plugins/dbCommands/palletManager';
import { DEFAULT_BUILDING, TEXT_SEARCH_PAGE_SIZE } from '../../plugins/Constants';

// Default building is Ogden - 3
let pallets: Ref<PalletSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)
let http = Cacher.getHttp()
onBeforeMount(()=>{
  searchObject.disableRouter()
})

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string) {
  return new Promise<TextSearchPage>((res)=>{
    getPalletsByTextSearch(http, searchString, pageNum, (data: any, err) => {
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

function advancedSearchCallback(buildingNum: number, pageNum: number, searchObject: PalletSchema) {
  return new Promise<TextSearchPage>((res)=>{
    searchObject['advanced'] = 'true';
    searchObject['pageNum'] = pageNum;
    searchObject['pageSize'] = TEXT_SEARCH_PAGE_SIZE;
    // Send request to api
    getPalletsByData(http, searchObject, (data, err) => {
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

function displayResults(page: PalletSchema[]) {
  pallets.value = page
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
        <p class="mt-auto">Pallet Tag</p>
        <p class="mt-auto">Building</p>
        <p class="mt-auto">Location</p>
      </template>
      <template v-slot:searchResults>
        <PalletComponent
          :add="true"
          @addAction="$emit('addAction', pallet)"
          v-for="pallet in pallets"
          v-bind:key="pallet._id"
          :pallet="pallet"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
