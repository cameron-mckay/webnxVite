<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { ref, Ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import { NotificationTypes, PartSchema, SortType, TextSearchPage, UserState } from '../../plugins/interfaces';
import { getPartsByData, getPartsByTextSearch } from '../../plugins/dbCommands/partManager';
import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import AdvancedSearchComponent from '../../components/PartComponents/PartAdvancedSearchComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';
import PartComponent from '../../components/PartComponents/PartComponent.vue';
import { arrayToCSV, downloadCSV, replaceLinksWithAnchors } from '../../plugins/CommonMethods';
import { TEXT_SEARCH_PAGE_SIZE } from '../../plugins/Constants';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string, type: NotificationTypes, link?: string) => void;
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>();

// Default building is Ogden - 3
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string, sortString: string, sortDir: SortType) {
  return new Promise<TextSearchPage>((res)=>{
    getPartsByTextSearch(http, searchString, pageNum, buildingNum, sortString, sortDir, (data: any, err) => {
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

function advancedSearchCallback(_buildingNum: number, pageNum: number, searchObject: PartSchema, sortString: string, sortDir: SortType) {
  return new Promise<TextSearchPage>((res)=>{
    searchObject['advanced'] = 'true';
    searchObject['pageNum'] = pageNum;
    searchObject['pageSize'] = TEXT_SEARCH_PAGE_SIZE;
    searchObject['sortString'] = sortString
    searchObject['sortDir'] = sortDir
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

function getCSV() {
  if(searchObject.wasLastSearchAdvanced()) {
    searchObject.forceAdvancedSearchCallback((_buildingNum: number, pageNum: number, searchObject: PartSchema, sortString: string, sortDir: SortType)=> {
      return new Promise<TextSearchPage>((res)=>{
        searchObject['advanced'] = 'true';
        searchObject['pageNum'] = pageNum;
        searchObject['pageSize'] = TEXT_SEARCH_PAGE_SIZE;
        searchObject['sortString'] = sortString
        searchObject['sortDir'] = sortDir
        searchObject['skipPagination'] = true
        // Send request to api
        getPartsByData(http, searchObject, (data, err) => {
          if (err) {
            // Send error to error handler
            return res({pages: 0, total: 0, items: []})
          }
          let response = data as any[]
          downloadCSV("advancedSearchResults", arrayToCSV(response))
          // Resolve promise
          return res({pages: 0, total: 0, items: []})
        });
      })
    })
  }
  else {
    searchObject.forceTextSearchCallback((buildingNum: number, pageNum: number, searchString: string, sortString: string, sortDir: SortType) => {
      return new Promise<TextSearchPage>((res)=>{
        getPartsByTextSearch(http, searchString, pageNum, buildingNum, sortString, sortDir, (data: any, err) => {
          if (err) {
            // Send error to error handler
            return res({pages: 0, total: 0, items: []})
          }
          let response = data as PartSchema[]
          downloadCSV("textSearchResults", arrayToCSV(response.map((p)=>{
            return {
              nxid: p.nxid,
              manufacturer: p.manufacturer,
              name: p.name,
              rack_num: p.rack_num,
              shelf_location: p.shelf_location,
              available: p.quantity,
              total: p.total_quantity
            }
          })))
          // Resolve promise
          return res({pages: 0, total: 0, items: []})
        }, undefined, true);
      })
    })
  }
}

// Toggle advanced search
function toggleAdvanced() {
  // Negate
  showAdvanced.value = !showAdvanced.value;
}

async function advancedSearchButtonPressed(part: PartSchema) {
  searchObject.newAdvancedSearch(store.state.user.building!, 1, part)
  toggleAdvanced()
}

function displayResults(page: PartSchema[]) {
  parts.value = page
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
}

function viewPart(part: PartSchema) {
  router.push({ name: 'Part View', query: { nxid: part.nxid } });
}

function addToCart(part: PartSchema) {
  // Check if cart quantity < available quantity
  if (
    part.quantity &&
    part.nxid &&
    store.getters.getQuantity(part.nxid) < part.quantity
  ) {
    // Add to cart
    displayMessage(`Added ${part.manufacturer} ${part.name} to cart`, NotificationTypes.Info, store.state.user.roles?.includes('kiosk')?'/cart':'/requestParts');
    store.commit('addToCart', part);
  } else {
    // Not enough stock
    errorHandler(`Not enough stock`);
  }
}


</script>
<template>
  <div>
    <PageHeaderComponent class="mb-4">Part Search</PageHeaderComponent>
    <TextSearchComponent
      :search-object="searchObject"
      :hide-q-r="true"
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
        <p sortName="nxid" class="hidden md:block">NXID</p>
        <p sortName="manufacturer">Manufacturer</p>
        <p sortName="name">Name</p>
        <p sortName="location" class="hidden md:block">Location</p>
        <p sortName="quantity">Quantity</p>
      </template>
      <template v-slot:searchResults>
        <PartComponent
          :add="store.state.user.roles?.includes('is_kiosk')||store.state.user.roles?.includes('request_parts')"
          :view="true"
          :showAudit="store.state.user.roles?.includes('view_audit_date')"
          v-for="part in parts"
          @addPartAction="addToCart(part)"
          @viewPartAction="viewPart(part)"
          :part="part"
        />
      </template>
      <template v-slot:searchFooter>
        <input class="search-button bg-blue-400 hover:bg-blue-500 active:bg-blue-600 ml-auto block px-4" type="button" value="Download CSV" @click="getCSV"/>
      </template>
    </TextSearchComponent>
  </div>
</template>
