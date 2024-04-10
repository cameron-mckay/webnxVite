<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { ref, Ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import { AssetSchema, PalletSchema, TextSearchPage, UserState } from '../../plugins/interfaces';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';

import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import PlusButton from '../../components/GenericComponents/Buttons/PlusButton.vue'
import AdvancedSearchComponent from '../../components/PalletComponents/PalletAdvancedSearchComponent.vue';
import PalletComponent from '../../components/PalletComponents/PalletComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import { getPalletsByData, getPalletsByTextSearch } from '../../plugins/dbCommands/palletManager';
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
let pallets: Ref<PalletSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)

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
    searchObject['pageSize'] = 50;
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

async function advancedSearchButtonPressed(asset: AssetSchema) {
  searchObject.newAdvancedSearch(store.state.user.building!, 1, asset)
  toggleAdvanced()
}

function addUntrackedPallet() {
  // Redirect
  router.push({ name: 'Create Pallet' });
}

// Toggle editing menu
function toggleEdit(pallet: PalletSchema) {
  router.push({ name: 'Edit Pallet', query: { pallet_tag: pallet.pallet_tag } });
}

function viewPallet(pallet: PalletSchema) {
  router.push({ name: 'View Pallet', query: { pallet_tag: pallet.pallet_tag } });
}

function displayResults(page: PalletSchema[]) {
  pallets.value = page
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
}

</script>
<template>
  <div>
    <PageHeaderComponent class="mb-4">Pallet Search</PageHeaderComponent>
    <TextSearchComponent
      :search-object="searchObject"
      @display-results="displayResults"
    >
      <template v-slot:searchIcons>
        <SlidersButton @click="toggleAdvanced"/>
        <AdvancedSearchComponent
          v-if="showAdvanced"
          :startPallet="searchObject.getAdvancedSearchObjectFromRouter() as PalletSchema"
          @palletSearch="advancedSearchButtonPressed"
          @toggle="toggleAdvanced"
        />
        <PlusButton @click="addUntrackedPallet" v-if="store.state.user.roles?.includes('edit_pallets')"/>
      </template>
      <template v-slot:searchHeader>
        <p>Pallet Tag</p>
        <p>Building</p>
        <p>Location</p>
      </template>
      <template v-slot:searchResults>
        <PalletComponent
          :add="false"
          :edit="store.state.user.roles?.includes('edit_pallets')"
          :view="true"
          v-for="pallet in pallets"
          v-bind:key="pallet._id"
          @editAction="toggleEdit(pallet)"
          @viewAction="viewPallet(pallet)"
          :pallet="pallet"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
