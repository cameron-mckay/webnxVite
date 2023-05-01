<template>
  <div>
    <form class="flex justify-between" @submit.prevent="search">
      <input
        class="search ml-0"
        type="text"
        v-model="searchText"
        placeholder="🔍 keywords..."
      />
      <select v-if="changeBuilding === true" v-model="building" class="w-32">
        <option :value="3" selected>3 - Ogden</option>
        <option :value="1">1 - LA</option>
      </select>
      <!-- QR Code -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        @click="toggleQR"
        class="button-icon hover:button-icon-hover active:button-icon-active"
        viewBox="0 0 448 512"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M0 80C0 53.5 21.5 32 48 32h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V80zM64 96v64h64V96H64zM0 336c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V336zm64 16v64h64V352H64zM304 32h96c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H304c-26.5 0-48-21.5-48-48V80c0-26.5 21.5-48 48-48zm80 64H320v64h64V96zM256 304c0-8.8 7.2-16 16-16h64c8.8 0 16 7.2 16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s7.2-16 16-16s16 7.2 16 16v96c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s-7.2-16-16-16s-16 7.2-16 16v64c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V304zM368 480a16 16 0 1 1 0-32 16 16 0 1 1 0 32zm64 0a16 16 0 1 1 0-32 16 16 0 1 1 0 32z"
        />
      </svg>
      <!-- Sliders -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="button-icon hover:button-icon-hover active:button-icon-active"
        @click="toggleAdvanced"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M0 416c0-17.7 14.3-32 32-32l54.7 0c12.3-28.3 40.5-48 73.3-48s61 19.7 73.3 48L480 384c17.7 0 32 14.3 32 32s-14.3 32-32 32l-246.7 0c-12.3 28.3-40.5 48-73.3 48s-61-19.7-73.3-48L32 448c-17.7 0-32-14.3-32-32zm192 0c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zM384 256c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zm-32-80c32.8 0 61 19.7 73.3 48l54.7 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-54.7 0c-12.3 28.3-40.5 48-73.3 48s-61-19.7-73.3-48L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l246.7 0c12.3-28.3 40.5-48 73.3-48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32s-14.3-32-32-32zm73.3 0L480 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l-214.7 0c-12.3 28.3-40.5 48-73.3 48s-61-19.7-73.3-48L32 128C14.3 128 0 113.7 0 96S14.3 64 32 64l86.7 0C131 35.7 159.2 16 192 16s61 19.7 73.3 48z"
        />
      </svg>
      <!-- Plus -->
      <svg
        class="button-icon hover:button-icon-hover active:button-icon-active ml-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        @click="addUntrackedAsset"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
        />
      </svg>

      <input class="search-button mr-0" type="submit" value="Search" />
      <AdvancedSearchComponent
        v-if="showAdvanced"
        @assetSearch="advancedSearch"
        @toggle="toggleAdvanced"
      />
      <QRCodeScannerPopupComponent
        v-if="showQR"
        @toggle="toggleQR"
        @decoded="decodedQR"
      />
    </form>
    <div v-if="loading" class="flex justify-center my-4">
      <div class="loader text-center"></div>
    </div>
    <div v-else-if="assets.length != 0">
      <div
        class="relative grid grid-cols-4 p-1 text-center font-bold leading-8 transition md:grid-cols-6 md:p-2 md:leading-10"
      >
        <p>NXID</p>
        <p>Building</p>
        <p class="hidden md:block">Type</p>
        <p class="hidden md:block">Chassis</p>
        <p>Status</p>
        <div v-if="multiplePages" class="float-right flex select-none">
          <p class="my-auto mr-3 inline-block">{{ `Page: ${pageNum}` }}</p>
          <!-- Left Caret -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="button-icon hover:button-icon-hover active:button-icon-active"
            viewBox="0 0 256 512"
            v-on:click="prevPage"
            v-if="pageNum > 1"
          >
            <path
              fill="currentColor"
              stroke="currentColor"
              d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"
            />
          </svg>
          <div v-else class="button-icon opacity-0"></div>
          <!-- Right Caret -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="button-icon hover:button-icon-hover active:button-icon-active"
            viewBox="0 0 256 512"
            v-if="multiplePages"
            v-on:click="nextPage"
          >
            <path
              fill="currentColor"
              stroke="currentColor"
              d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"
            />
          </svg>
          <div v-else class="button-icon opacity-0"></div>
        </div>
      </div>
      <div class="animate-bottom">
        <AssetComponent
          :add="add"
          :edit="edit"
          :view="view"
          v-for="asset in assets"
          v-bind:key="asset._id"
          @editPartAction="$emit('editAssetAction', asset)"
          @addPartAction="$emit('addAssetAction', asset)"
          @viewPartAction="$emit('viewAssetAction', asset)"
          :asset="asset"
        />
      </div>
    </div>
    <div v-else>
      <p>No results...</p>
    </div>
      <div v-if="multiplePages&&!loading" class="float-right flex select-none">
        <p class="my-auto mr-3 inline-block">{{ `Page: ${pageNum}` }}</p>
        <!-- Left Caret -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          viewBox="0 0 256 512"
          v-on:click="prevPage"
          v-if="pageNum > 1"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"
          />
        </svg>
        <div v-else class="button-icon opacity-0"></div>
        <!-- Right Caret -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          viewBox="0 0 256 512"
          v-if="multiplePages"
          v-on:click="nextPage"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"
          />
        </svg>
        <div v-else class="button-icon opacity-0"></div>
      </div>
    </div>
</template>
<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import {
getAssetByID,
getAssetsByData,
getAssetsByTextSearch,
} from '../../plugins/dbCommands/assetManager';
import type { AssetSchema } from '../../plugins/interfaces';
import QRCodeScannerPopupComponent from '../GenericComponents/QRCodeScannerPopupComponent.vue';
import AdvancedSearchComponent from './AssetAdvancedSearchComponent.vue';
import AssetComponent from './AssetComponent.vue';

// Props interface
interface Props {
  http: AxiosInstance;
  location: string;
  building: number;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
  edit?: boolean;
  add?: boolean;
  view?: boolean;
  changeBuilding?: boolean;
}

// Define shit
let props = defineProps<Props>();
// Define emitted events
const emit = defineEmits([
  'addAssetAction',
  'editAssetAction',
  'viewAssetAction',
]);
// Wizardry
defineExpose({
  search,
});

// component variables
let {
  http,
  router,
  errorHandler,
  displayMessage,
  edit,
  add,
  view,
  changeBuilding,
} = props;
let building = ref(props.building);
let searchText = ref('');
let pageNum = ref(1);
let assets: Ref<AssetSchema[]> = ref([]);
let showAdvanced = ref(false);
let showQR = ref(false);
let multiplePages = ref(false);
let loading = ref(false);

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
      searchText.value = query.text as string;
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
  // Check current page num
  if (pageNum.value > 1) {
    // Decrement
    pageNum.value -= 1;
    // Send search query
    search();
  }
}

// Next search page
function nextPage() {
  // Check if results have multiple pages
  if (multiplePages) {
    // Increment page num
    pageNum.value += 1;
    // Send search query
    search();
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
  searchText.value = nxid;
  search();
}

// Advanced search
async function advancedSearch(asset: AssetSchema) {
  // Add new attribute to asset (this a wizard trick to make adding data to router easier)
  showAdvanced.value = false;
  loading.value = true
  asset['advanced'] = 'true';
  // Push asset to router
  router.push({ query: asset });
  // Query the API
  getAssetsByData(http, asset, (data, err) => {
    // Hide advanced search
    loading.value = false
    // Error
    if (err) {
      // Handle the error
      return errorHandler(err);
    } else if (data) {
      // Set parts list to API response
      assets.value = data as AssetSchema[];
    }
  });
}

// Search function
function search() {
  loading.value = true
  // Reset dis shit
  let current_page = pageNum.value
  // Check for webnx regex
  if (/WNX([0-9]{7})+/.test(searchText.value)) {
    // temp value
    let query = searchText.value;
    // Search and add to cart
    getAssetByID(http, query, (data, err) => {
      loading.value = false
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
      // Triple equals because Truthy and Falsy piss me off
      if (add === true) {
        emit('addAssetAction', asset);
      } else if (view === true) {
        emit('viewAssetAction', asset);
      } else if (edit == true) {
        emit('viewAssetAction', asset);
      }
    });
  } else {
    // Text search
    router.push({ query: { text: searchText.value, pageNum: pageNum.value } });
    // Send the API text search query
    getAssetsByTextSearch(
      http,
      searchText.value,
      pageNum.value,
      (data: any, err) => {
        loading.value = false
        if (err) {
          // Send error to error handler
          return errorHandler(err);
        }
        // typecast
        assets.value = data as AssetSchema[];
        // API will send 51 objects to indicate more pages
        if (assets.value.length > 50) {
          // Pop the extra object
          assets.value.pop();
          // Set multiple pages
          multiplePages.value = true;
        } else if (assets.value.length === 0 && pageNum.value != 1) {
          // Extra redundancy just in case query string is malformed
          pageNum.value = 1;
          search();
        }
        else {
          pageNum.value = current_page
        }
      }
    );
  }
}

function addUntrackedAsset() {
  // Redirect
  router.push({ name: 'Add Untracked Asset' });
}
</script>
