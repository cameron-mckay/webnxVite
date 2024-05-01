<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { ref, Ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import { AssetSchema, BoxSchema, SortType, TextSearchPage, UserState } from '../../plugins/interfaces';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';

import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import PlusButton from '../../components/GenericComponents/Buttons/PlusButton.vue'
import AdvancedSearchComponent from '../../components/BoxComponents/BoxAdvancedSearchComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import { getBoxesByData, getBoxesByTextSearch } from '../../plugins/dbCommands/boxManager';
import BoxComponent from '../../components/BoxComponents/BoxComponent.vue';
import { replaceLinksWithAnchors } from '../../plugins/CommonMethods';
import { TEXT_SEARCH_PAGE_SIZE } from '../../plugins/Constants';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
// Get global objects from props
const { http, store, router } = defineProps<Props>();

// Default building is Ogden - 3
let boxes: Ref<BoxSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string, sortString: string, sortDir: SortType) {
  return new Promise<TextSearchPage>((res)=>{
    getBoxesByTextSearch(http, searchString, pageNum, sortString, sortDir, (data: any, err) => {
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

function advancedSearchCallback(_buildingNum: number, pageNum: number, searchObject: BoxSchema, sortString: string, sortDir: SortType) {
  return new Promise<TextSearchPage>((res)=>{
    searchObject['advanced'] = 'true';
    searchObject['pageNum'] = pageNum;
    searchObject['pageSize'] = TEXT_SEARCH_PAGE_SIZE;
    searchObject['sortString'] = sortString
    searchObject['sortDir'] = sortDir
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

async function advancedSearchButtonPressed(asset: AssetSchema) {
  searchObject.newAdvancedSearch(store.state.user.building!, 1, asset)
  toggleAdvanced()
}

function addUntrackedBox() {
  // Redirect
  router.push({ name: 'Create Box' });
}

// Toggle editing menu
function toggleEdit(box: BoxSchema) {
  router.push({ name: 'Edit Box', query: { box_tag: box.box_tag } });
}

function viewBox(box: BoxSchema) {
  router.push({ name: 'View Box', query: { box_tag: box.box_tag } });
}

function displayResults(page: BoxSchema[]) {
  boxes.value = page
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
}

</script>
<template>
  <div>
    <PageHeaderComponent class="mb-4">Box Search</PageHeaderComponent>
    <TextSearchComponent
      :search-object="searchObject"
      @display-results="displayResults"
    >
      <template v-slot:searchIcons>
        <SlidersButton @click="toggleAdvanced"/>
        <AdvancedSearchComponent
          v-if="showAdvanced"
          :startBox="searchObject.getAdvancedSearchObjectFromRouter() as BoxSchema"
          @boxSearch="advancedSearchButtonPressed"
          @toggle="toggleAdvanced"
        />
        <PlusButton @click="addUntrackedBox" v-if="store.state.user.roles?.includes('edit_boxes')"/>
      </template>
      <template v-slot:searchHeader>
        <p sortName="box_tag">Box Tag</p>
        <p sortName="building">Building</p>
        <p sortName="location">Location</p>
      </template>
      <template v-slot:searchResults>
        <BoxComponent
          :add="false"
          :edit="store.state.user.roles?.includes('edit_boxes')"
          :view="true"
          v-for="box in boxes"
          v-bind:key="box._id"
          @editAction="toggleEdit(box)"
          @viewAction="viewBox(box)"
          :box="box"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
