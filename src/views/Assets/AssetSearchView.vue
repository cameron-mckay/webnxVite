<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { ref, Ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import { AssetSchema, TextSearchPage, UserState } from '../../plugins/interfaces';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';
import {
  getAssetsByData,
  getAssetsByTextSearch,
} from '../../plugins/dbCommands/assetManager';

import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import PlusButton from '../../components/GenericComponents/Buttons/PlusButton.vue'
import AdvancedSearchComponent from '../../components/AssetComponents/AssetAdvancedSearchComponent.vue';
import AssetComponent from '../../components/AssetComponents/AssetComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import { replaceLinksWithAnchors } from '../../plugins/CommonMethods';

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
let assets: Ref<AssetSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)

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
    searchObject['pageSize'] = 50;
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

async function advancedSearchButtonPressed(asset: AssetSchema) {
  searchObject.newAdvancedSearch(store.state.user.building!, 1, asset)
  toggleAdvanced()
}

function addUntrackedAsset() {
  // Redirect
  router.push({ name: 'Add Untracked Asset' });
}

// Toggle editing menu
function toggleEdit(asset: AssetSchema) {
  router.push({ name: 'Edit Asset', query: { asset_tag: asset.asset_tag } });
}

function viewAsset(asset: AssetSchema) {
  router.push({ name: 'View Asset', query: { asset_tag: asset.asset_tag } });
}

function displayResults(page: AssetSchema[]) {
  assets.value = page
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
}

</script>
<template>
  <div>
    <PageHeaderComponent class="mb-4">Asset Search</PageHeaderComponent>
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
        <PlusButton @click="addUntrackedAsset" v-if="store.state.user.roles?.includes('edit_assets')"/>
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
          :add="false"
          :edit="store.state.user.roles?.includes('edit_assets')"
          :view="true"
          v-for="asset in assets"
          v-bind:key="asset._id"
          @editPartAction="toggleEdit(asset)"
          @viewPartAction="viewAsset(asset)"
          :asset="asset"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
