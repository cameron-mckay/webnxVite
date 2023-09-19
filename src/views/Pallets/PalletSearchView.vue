<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, onMounted, ref, Ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { PalletSchema, UserState } from '../../plugins/interfaces';
import QRCodeScannerPopupComponent from '../../components/GenericComponents/QRCodeScannerPopupComponent.vue';
import QRCodeButton from '../../components/GenericComponents/QRCodeButton.vue';
import SlidersButton from '../../components/GenericComponents/SlidersButton.vue';
import PlusButton from '../../components/GenericComponents/PlusButton.vue';
import LeftCaretButton from '../../components/GenericComponents/LeftCaretButton.vue';
import RightCaretButton from '../../components/GenericComponents/RightCaretButton.vue';
import PalletComponent from '../../components/PalletComponents/PalletComponent.vue';
import PalletAdvancedSearchComponent from '../../components/PalletComponents/PalletAdvancedSearchComponent.vue';
import { getPalletByID, getPalletsByData, getPalletsByTextSearch } from '../../plugins/dbCommands/palletManager';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

// Default building is Ogden - 3
let building = ref(store.state.user.building);
let visibleSearchText = ref('');
let invisibleSearchText = '';
let pageNum = ref(1);
let pallets: Ref<PalletSchema[]> = ref([]);
let showAdvanced = ref(false);
let showQR = ref(false);
let loading = ref(false);
let pageCache = new Map<number, PalletSchema[]>();
let changeBuilding = false
let totalPages = ref(1)
let totalPallets = ref(0)
let advancedSearchCopy = {} as PalletSchema

// Before component is mounted
onBeforeMount(async () => {
  // Destructure query from route
  let { query } = router.currentRoute.value;
  // If building exists in query string
  if (query.building) {
    // Parse building number
    building.value = parseInt(query.building as string);
  }
  // Check for advanced search
  if (query.advanced === 'true') {
    // Define variable to store Asset attributes
    let searchPallet = {} as PalletSchema;
    if (query.pageNum) {
      // Parse page number from query string
      pageNum.value = parseInt(query.pageNum as string);
    }
    // Loop through query to create part object
    for (const key in query) {
      // Copy
      searchPallet[key] = query[key];
    }
    // Search
    advancedSearch(searchPallet);
  } else {
    // Check for search text
    if (query.text) {
      // Get text search from query string
      visibleSearchText.value = query.text as string;
      invisibleSearchText = visibleSearchText.value;
    }
    // Check if pageNum exists
    if (query.pageNum) {
      // Parse page number from query string
      pageNum.value = parseInt(query.pageNum as string);
    }
    search();
  }
});

// Previous search page
function prevPage() {
  let { query } = router.currentRoute.value;
  // Check current page num
  if (pageNum.value > 1) {
    // Decrement
    pageNum.value -= 1;
    // Send search query
    if (query.advanced === 'true') {
      let searchPallet = {} as PalletSchema;
      // Loop through query to create part object
      for (const key in query) {
        // Copy
        searchPallet[key] = query[key];
      }
      advancedSearch(searchPallet);
    } else {
      search();
    }
  }
}

// Next search page
function nextPage() {
  let { query } = router.currentRoute.value;
  // Check if results have multiple pages
  if (pageNum.value<totalPages.value) {
    // Increment page num
    pageNum.value += 1;
    // Send search query
    if (query.advanced === 'true') {
      let searchPallet = {} as PalletSchema;
      // Loop through query to create part object
      for (const key in query) {
        // Copy
        searchPallet[key] = query[key];
      }
      advancedSearch(searchPallet);
    } else {
      search();
    }
  }
}

// Toggle advanced search
function toggleAdvanced() {
  // Negate
  showAdvanced.value = !showAdvanced.value;
}

// Toggle QR search
function toggleQR() {
  // Negate
  showQR.value = !showQR.value;
}

function decodedQR(nxid: string) {
  showQR.value = false;
  visibleSearchText.value = nxid;
  invisibleSearchText = nxid;
  search();
}

// Advanced search
async function advancedSearch(pallet: PalletSchema) {
  // Add new attribute to asset (this a wizard trick to make adding data to router easier)
  showAdvanced.value = false;
  loading.value = true;
  pallet['advanced'] = 'true';
  pallet['pageNum'] = pageNum.value;
  pallet['pageSize'] = 50;
  // Push asset to router
  router.push({ query: pallet });
  // Query the API
  getPageAdvanced(pageNum.value, pallet)
    .then((res) => {
      pallets.value = JSON.parse(JSON.stringify(res.pallets));
      totalPages.value = res.numPages
      totalPallets.value = res.numPallets
      loading.value = false;
      pageCache.set(pageNum.value, res.pallets);
    })
    .catch(() => {
      pageNum.value = 1;
      search();
    });
}

// Search function
function search() {
  // Reset dis shit
  let current_page = pageNum.value;
  // loading.value = true
  // Check for webnx regex
  if (/PAL([0-9]{7})+/.test(invisibleSearchText)) {
    loading.value = true;
    // temp value
    let query = invisibleSearchText;
    // Search and add to cart
    getPalletByID(http, query, (data, err) => {
      loading.value = false;
      if (err) {
        // Part not found
        return errorHandler(err);
      }
      // Typecast data
      let pallet = data as PalletSchema;
      // Check if asset does not exist
      if (pallet == null) {
        // If no part was found
        return errorHandler('Pallet not found.');
      }
      // Emit actions
      viewPallet(pallet);
    });
  } 
  else {
    // Text search
    router.push({
      query: { text: invisibleSearchText, pageNum: pageNum.value },
    });
    // Check if page cache has page
    if (
      pageCache.has(pageNum.value) &&
      pageCache.get(pageNum.value)!.length > 0
    ) {
      pallets.value = JSON.parse(JSON.stringify(pageCache.get(pageNum.value)!));
      checkCache();
    }
    // Get page from server
    else {
      loading.value = true;
      // Send the API text search query
      getPage(current_page, invisibleSearchText)
        .then((res) => {
          pallets.value = JSON.parse(JSON.stringify(res.pallets));
          totalPages.value = res.numPages
          totalPallets.value = res.numPallets
          loading.value = false;
          pageCache.set(current_page, res.pallets);
          checkCache();
        })
        .catch(() => {
          pageNum.value = 1;
          search();
        });
    }
  }
}

async function checkCache() {
  let page = pageNum.value;
  // Check previous 5 pages
  while (page > 0 && page >= pageNum.value - 5) {
    let localPage = page;
    // Check if exists in cache
    if (pageCache.has(localPage)) {
      // Decrement and continue
      page -= 1;
      continue;
    } else {
      // Set temp value
      pageCache.set(localPage, []);
      // Get Page from api
      getPage(localPage, invisibleSearchText)
        .then((res) => {
          // Set new value
          pageCache.set(localPage, res.pallets);
        })
        .catch(() => {
          // Delete temp value
          pageCache.delete(localPage);
        });
      // Decrement
      page -= 1;
    }
  }
  page = pageNum.value;
  // Get next 5 pages
  while (page <= pageNum.value + 5) {
    let localPage = page;
    // Check if cache has page
    if (pageCache.has(localPage)) {
      // increment and continue
      page++;
      continue;
    } else {
      // Set temp value
      pageCache.set(localPage, []);
      // Get page from api
      getPage(localPage, invisibleSearchText)
        .then((res) => {
          // Set new value
          pageCache.set(localPage, res.pallets);
        })
        .catch(() => {
          // Delete temp value
          pageCache.delete(localPage);
        });
      // Increment
      page++;
    }
  }
}

function checkCacheAdvanced() {}

function searchButtonPressed() {
  // Get query string from router
  let { query } = router.currentRoute.value;
  // Check if search text has changed
  if (invisibleSearchText != visibleSearchText.value||query.advanced=='true') {
    // Reset page cache and set new search string
    pageCache = new Map<number, PalletSchema[]>();
    invisibleSearchText = visibleSearchText.value;
  }
  pageNum.value = 1;
  search();
}

function advancedSearchButtonPressed(asset: PalletSchema) {
  pageNum.value = 1;
  advancedSearch(asset);
}

function addUntrackedPallet() {
  // Redirect
  router.push({ name: 'Create Pallet' });
}

function getPage(page: number, text: string) {
  // Return promise
  return new Promise<{numPages: number, numPallets: number, pallets: PalletSchema[]}>((res, rej) => {
    getPalletsByTextSearch(http, text, page, (data: any, err) => {
      if (err) {
        // Send error to error handler
        rej();
      }
      // Typecast response
      const response = data as {numPages: number, numPallets: number, pallets: PalletSchema[]}
      // typecast
      if (response.pallets && response.pallets.length === 0 && page != 1) {
        // Extra redundancy just in case query string is malformed
        rej();
      }
      // Resolve promise
      res(response);
    });
  });
}

function getPageAdvanced(page: number, pallet: PalletSchema) {
  return new Promise<{numPages: number, numPallets: number, pallets: PalletSchema[]}>((res, rej) => {
    // These attributes will be pushed to query string
    pallet['advanced'] = 'true';
    pallet['pageNum'] = pageNum.value;
    pallet['pageSize'] = 50;
    // Send request to api
    getPalletsByData(http, pallet, (data, err) => {
      if (err) {
        // Send error to error handler
        rej();
      }
      const response = data as {numPages: number, numPallets: number, pallets: PalletSchema[]}
      // typecast
      if (response.pallets && response.pallets.length === 0 && page != 1) {
        // Extra redundancy just in case query string is malformed
        rej();
      }
      // Resolve promise
      res(response);
    });
  });
}

function goTo(num: number) {
  // Check if page is in valid range
  if(num>0&&num<=totalPages.value) {
    // Set page num
    pageNum.value = num
    // Get query string
    let { query } = router.currentRoute.value;
    // If advanced search
    if (query.advanced === 'true') {
      let searchPallet = {} as PalletSchema;
      // Loop through query to create part object
      for (const key in query) {
        // Copy
        searchPallet[key] = query[key];
      }
      advancedSearch(searchPallet);
      return
    }
    // Normal search
    search()
  }
}

// Toggle editing menu
function toggleEdit(pallet: PalletSchema) {
  router.push({ name: 'Edit Pallet', query: { pallet_tag: pallet.pallet_tag } });
}

function viewPallet(pallet: PalletSchema) {
  router.push({ name: 'View Pallet', query: { pallet_tag: pallet.pallet_tag } });
}

onMounted(()=>{
  document.getElementById("searchBox")?.focus()
})
</script>
<template>
  <div>
    <!-- Title area -->
    <h1 class="mb-4 text-4xl">Pallet Search</h1>
    <!-- Search menu -->
  <div>
    <form class="flex justify-between" @submit.prevent="searchButtonPressed">
      <input
        id="searchBox"
        class="search ml-0"
        type="text"
        v-model="visibleSearchText"
        placeholder="🔍 keywords..."
      />
      <select v-if="changeBuilding === true" v-model="building" class="w-32">
        <option :value="3" selected>3 - Ogden</option>
        <option :value="1">1 - LA</option>
      </select>
      <QRCodeButton @click="toggleQR"/>
      <SlidersButton @click="toggleAdvanced"/>
      <PlusButton @click="addUntrackedPallet" v-if="!store.state.user.roles?.includes('sales')"/>
      <input class="search-button mr-0" type="submit" value="Search" />
      <PalletAdvancedSearchComponent
        v-if="showAdvanced"
        @palletSearch="advancedSearchButtonPressed"
        @toggle="toggleAdvanced"
      />
      <QRCodeScannerPopupComponent
        v-if="showQR"
        @toggle="toggleQR"
        @decoded="decodedQR"
      />
    </form>
    <div v-if="loading" class="my-4 flex justify-center">
      <div class="loader text-center"></div>
    </div>
    <div v-else-if="pallets.length != 0">
      <div
        class="relative grid grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
      >
        <p class="mt-auto">Pallet Tag</p>
        <p class="mt-auto">Building</p>
        <p class="mt-auto">Location</p>
    <div
      v-if="totalPages > 1 && !loading"
      class="float-right flex select-none"
    >
      <p class="my-auto inline-block leading-6 mr-auto">{{ `Page: ${pageNum}` }}</p>
      <LeftCaretButton 
        v-on:click="prevPage"
        v-if="pageNum > 1"
      />
      <div v-else class="button-icon opacity-0"></div>
      <!-- Right Caret -->
      <RightCaretButton
        v-if="pageNum<totalPages"
        v-on:click="nextPage"
      />
      <div v-else class="button-icon mr-0 opacity-0"></div>
    </div>
      </div>
      <div class="md:animate-bottom">
        <PalletComponent
          :add="false"
          :edit="true"
          :view="true"
          v-for="pallet in pallets"
          v-bind:key="pallet._id"
          @editAction="toggleEdit(pallet)"
          @viewAction="viewPallet(pallet)"
          :pallet="pallet"
        />
      </div>
    </div>
    <div v-else>
      <p class="my-4">No results...</p>
    </div>
        <div
          v-if="totalPages > 1 && !loading"
          class="float-right select-none"
        >
          <div class="flex justify-end">
            <p class="my-auto inline-block mr-2">{{ `Page: ${pageNum}` }}</p>
            <div class="flex shrink-0">
              <LeftCaretButton 
                v-on:click="prevPage"
                v-if="pageNum > 1"
              />
              <div v-else class="button-icon opacity-0"></div>
              <!-- Right Caret -->
              <RightCaretButton
                v-if="pageNum<totalPages"
                v-on:click="nextPage"
              />
              <div v-else class="button-icon mr-0 opacity-0"></div>
            </div>
          </div>
          <div class="float-right">
          <a class="mx-1" id="link" @click="goTo(1)" v-if="pageNum>2">1</a>
            <a class="mx-1" v-if="pageNum>2">...</a>
          <a class="mx-1" id="link" v-for="n in ((totalPages-(pageNum+1))>5)?5:(totalPages-pageNum-2>=0?totalPages-pageNum-2:0)" @click="n+pageNum+1<totalPages?goTo(n+pageNum+1):()=>{}">{{ n+pageNum+1 }}</a>
            <a class="mx-1" v-if="(totalPages-pageNum)>7">...</a>
            <a class="mx-1" id="link" @click="goTo(totalPages)">{{ totalPages}}</a>
          </div>
        </div>
  </div>
    <!-- Asset editing popup menu -->
  </div>
</template>
