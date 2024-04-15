<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { AssetSchema, BoxSchema, PalletSchema, PartSchema, TextSearchPage } from '../../plugins/interfaces';
import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import AdvancedSearchComponent from '../../components/AssetComponents/AssetAdvancedSearchComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import Cacher from '../../plugins/Cacher';
import BoxComponent from './BoxComponent.vue'
import { getBoxesByData, getBoxesByTextSearch } from '../../plugins/dbCommands/boxManager';

// Default building is Ogden - 3
let boxes: Ref<BoxSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)
let http = Cacher.getHttp()
onBeforeMount(()=>{
  searchObject.disableRouter()
})

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string) {
  return new Promise<TextSearchPage>((res)=>{
    getBoxesByTextSearch(http, searchString, pageNum, (data: any, err) => {
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

function advancedSearchCallback(buildingNum: number, pageNum: number, searchObject: BoxSchema) {
  return new Promise<TextSearchPage>((res)=>{
    searchObject['advanced'] = 'true';
    searchObject['pageNum'] = pageNum;
    searchObject['pageSize'] = 50;
    // Send request to api
    getBoxesByData(http, searchObject, (data, err) => {
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

function displayResults(page: BoxSchema[]) {
  boxes.value = page
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
        <p class="mt-auto">Box Tag</p>
        <p class="mt-auto">Building</p>
        <p class="mt-auto">Location</p>
      </template>
      <template v-slot:searchResults>
        <BoxComponent
          :add="true"
          @addAction="$emit('addAction', box)"
          v-for="box in boxes"
          v-bind:key="box._id"
          :box="box"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
