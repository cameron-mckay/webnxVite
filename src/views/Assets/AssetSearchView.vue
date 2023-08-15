<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, onMounted, ref, Ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { AssetSchema, UserState } from '../../plugins/interfaces';
import {
  getAssetByID,
  getAssetsByData,
  getAssetsByTextSearch,
} from '../../plugins/dbCommands/assetManager';

import QRCodeScannerPopupComponent from '../../components/GenericComponents/QRCodeScannerPopupComponent.vue'
//'../GenericComponents/QRCodeScannerPopupComponent.vue';
import QRCodeButton from '../../components/GenericComponents/QRCodeButton.vue'
import SlidersButton from '../../components/GenericComponents/SlidersButton.vue'
import PlusButton from '../../components/GenericComponents/PlusButton.vue'
import LeftCaretButton from '../../components/GenericComponents/LeftCaretButton.vue'
import RightCaretButton from '../../components/GenericComponents/RightCaretButton.vue'
import AdvancedSearchComponent from '../../components/AssetComponents/AssetAdvancedSearchComponent.vue';
import AssetComponent from '../../components/AssetComponents/AssetComponent.vue';

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
let assets: Ref<AssetSchema[]> = ref([]);
let showAdvanced = ref(false);
let showQR = ref(false);
let loading = ref(false);
let pageCache = new Map<number, AssetSchema[]>();
let changeBuilding = false
let totalPages = ref(1)
let totalAssets = ref(0)
let advancedSearchCopy = {} as AssetSchema

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
    let searchAsset = {} as AssetSchema;
    if (query.pageNum) {
      // Parse page number from query string
      pageNum.value = parseInt(query.pageNum as string);
    }
    // Loop through query to create part object
    for (const key in query) {
      // Copy
      searchAsset[key] = query[key];
    }
    // Search
    advancedSearch(searchAsset);
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
      let searchAsset = {} as AssetSchema;
      // Loop through query to create part object
      for (const key in query) {
        // Copy
        searchAsset[key] = query[key];
      }
      advancedSearch(searchAsset);
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
      let searchAsset = {} as AssetSchema;
      // Loop through query to create part object
      for (const key in query) {
        // Copy
        searchAsset[key] = query[key];
      }
      advancedSearch(searchAsset);
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
async function advancedSearch(asset: AssetSchema) {
  // Add new attribute to asset (this a wizard trick to make adding data to router easier)
  showAdvanced.value = false;
  loading.value = true;
  asset['advanced'] = 'true';
  asset['pageNum'] = pageNum.value;
  asset['pageSize'] = 50;
  // Push asset to router
  router.push({ query: asset });
  // Query the API
  getPageAdvanced(pageNum.value, asset)
    .then((res) => {
      assets.value = JSON.parse(JSON.stringify(res.assets));
      totalPages.value = res.numPages
      totalAssets.value = res.numAssets
      loading.value = false;
      pageCache.set(pageNum.value, res.assets);
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
  if (/WNX([0-9]{7})+/.test(invisibleSearchText)) {
    loading.value = true;
    // temp value
    let query = invisibleSearchText;
    // Search and add to cart
    getAssetByID(http, query, (data, err) => {
      loading.value = false;
      if (err) {
        // Part not found
        return errorHandler(err);
      }
      // Typecast data
      let asset = data as AssetSchema;
      // Check if asset does not exist
      if (asset == null) {
        // If no part was found
        return errorHandler('Asset not found.');
      }
      // Emit actions
      viewAsset(asset);
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
      assets.value = JSON.parse(JSON.stringify(pageCache.get(pageNum.value)!));
      checkCache();
    }
    // Get page from server
    else {
      loading.value = true;
      // Send the API text search query
      getPage(current_page, invisibleSearchText)
        .then((res) => {
          assets.value = JSON.parse(JSON.stringify(res.assets));
          totalPages.value = res.numPages
          totalAssets.value = res.numAssets
          loading.value = false;
          pageCache.set(current_page, res.assets);
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
  while (page > 0 && page >= pageNum.value - 5) {
    let localPage = page;
    if (pageCache.has(localPage)) {
      page -= 1;
      continue;
    } else {
      pageCache.set(localPage, []);
      getPage(localPage, invisibleSearchText)
        .then((res) => {
          pageCache.set(localPage, res.assets);
        })
        .catch(() => {
          pageCache.delete(localPage);
        });
      page -= 1;
    }
  }
  page = pageNum.value;
  while (page <= pageNum.value + 5) {
    let localPage = page;
    if (pageCache.has(localPage)) {
      page++;
      continue;
    } else {
      pageCache.set(localPage, []);
      getPage(localPage, invisibleSearchText)
        .then((res) => {
          pageCache.set(localPage, res.assets);
        })
        .catch(() => {
          pageCache.delete(localPage);
        });
      page++;
    }
  }
}

function checkCacheAdvanced() {}

function searchButtonPressed() {
  let { query } = router.currentRoute.value;
  if (invisibleSearchText != visibleSearchText.value||query.advanced=='true') {
    pageCache = new Map<number, AssetSchema[]>();
    invisibleSearchText = visibleSearchText.value;
  }
  pageNum.value = 1;
  search();
}

function advancedSearchButtonPressed(asset: AssetSchema) {
  pageNum.value = 1;
  advancedSearch(asset);
}

function addUntrackedAsset() {
  // Redirect
  router.push({ name: 'Add Untracked Asset' });
}

function getPage(page: number, text: string) {
  return new Promise<{numPages: number, numAssets: number, assets: AssetSchema[]}>((res, rej) => {
    getAssetsByTextSearch(http, text, page, (data: any, err) => {
      if (err) {
        // Send error to error handler
        rej();
      }
      const response = data as {numPages: number, numAssets: number, assets: AssetSchema[]}
      // typecast
      if (response.assets && response.assets.length === 0 && page != 1) {
        // Extra redundancy just in case query string is malformed
        rej();
      }
      res(data as {numPages: number, numAssets: number, assets: AssetSchema[]});
    });
  });
}

function getPageAdvanced(page: number, asset: AssetSchema) {
  return new Promise<{numPages: number, numAssets: number, assets: AssetSchema[]}>((res, rej) => {
    asset['advanced'] = 'true';
    asset['pageNum'] = pageNum.value;
    asset['pageSize'] = 50;
    getAssetsByData(http, asset, (data, err) => {
      if (err) {
        // Send error to error handler
        rej();
      }
      const response = data as {numPages: number, numAssets: number, assets: AssetSchema[]}
      // typecast
      if (response.assets && response.assets.length === 0 && page != 1) {
        // Extra redundancy just in case query string is malformed
        rej();
      }
      res(response);
    });
  });
}

function goTo(num: number) {
  if(num>0&&num<=totalPages.value) {
    pageNum.value = num
    let { query } = router.currentRoute.value;
    if (query.advanced === 'true') {
      let searchAsset = {} as AssetSchema;
      // Loop through query to create part object
      for (const key in query) {
        // Copy
        searchAsset[key] = query[key];
      }
      advancedSearch(searchAsset);
      return
    }
    search()
  }
}

// Toggle editing menu
function toggleEdit(asset: AssetSchema) {
  router.push({ name: 'Edit Asset', query: { asset_tag: asset.asset_tag } });
}

function viewAsset(asset: AssetSchema) {
  router.push({ name: 'View Asset', query: { asset_tag: asset.asset_tag } });
}

onMounted(()=>{
  document.getElementById("searchBox")?.focus()
})
</script>
<template>
  <div>
    <!-- Title area -->
    <h1 class="mb-4 text-4xl">Asset Search</h1>
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
      <PlusButton @click="addUntrackedAsset" v-if="!store.state.user.roles?.includes('sales')"/>
      <input class="search-button mr-0" type="submit" value="Search" />
      <AdvancedSearchComponent
        v-if="showAdvanced"
        @assetSearch="advancedSearchButtonPressed"
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
    <div v-else-if="assets.length != 0">
      <div
        class="relative grid grid-cols-4 py-1 text-center font-bold leading-8 transition md:grid-cols-6 md:py-2 md:leading-10 mt-auto"
      >
        <p class="mt-auto">NXID</p>
        <p class="mt-auto">Building</p>
        <p class="hidden md:block mt-auto">Type</p>
        <p class="hidden md:block mt-auto">Chassis</p>
        <p class="mt-auto">Status</p>
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
        <AssetComponent
          :add="false"
          :edit="true"
          :view="true"
          v-for="asset in assets"
          v-bind:key="asset._id"
          @editPartAction="toggleEdit(asset)"
          @viewPartAction="viewAsset(asset)"
          :asset="asset"
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
