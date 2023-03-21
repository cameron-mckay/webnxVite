<template>
  <div>
    <form class="flex justify-between" @submit.prevent="search">
      <input
        class="textbox"
        type="text"
        v-model="searchText"
        placeholder="🔍 keywords..."
      />
      <select v-if="changeBuilding === true" v-model="building" class="w-32">
        <option :value="3" selected>3 - Ogden</option>
        <option :value="1">1 - LA</option>
      </select>
      <img
        class="button-icon"
        @click="toggleAdvanced"
        src="../assets/sliders-solid.svg"
      />
      <img
        class="button-icon"
        @click="addUntrackedAsset"
        src="../assets/plus-solid.svg"
      />
      <input class="submit mt-0 w-[calc(20%)]" type="submit" value="Search" />
      <AdvancedSearchComponent
        v-if="showAdvanced"
        @assetSearch="advancedSearch"
        @toggle="toggleAdvanced"
      />
    </form>
    <div v-if="assets.length != 0">
      <div
        class="relative grid grid-cols-4 p-2 text-center font-bold leading-10 transition md:grid-cols-6"
      >
        <p>NXID</p>
        <p>Building</p>
        <p class="hidden md:block">Type</p>
        <p class="hidden md:block">Chassis</p>
        <p>Status</p>
        <p></p>
      </div>
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
    <div v-else>
      <p>No results...</p>
    </div>
    <div class="text-right">
      <p class="mr-3 inline-block">{{ `Page: ${pageNum}` }}</p>
      <img
        v-if="multiplePages || pageNum > 1"
        class="inline-block h-10 w-10 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500"
        src="../assets/caret-left-solid.svg"
        v-on:click="prevPage"
      />
      <img
        v-if="multiplePages || pageNum > 1"
        class="inline-block h-10 w-10 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500"
        src="../assets/caret-right-solid.svg"
        v-on:click="nextPage"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { AxiosError, AxiosInstance } from "axios";
import { Ref, onBeforeMount, ref } from "vue";
import { Router } from "vue-router";
import {
getAssetByID,
getAssetsByData,
getAssetsByTextSearch,
} from "../plugins/dbCommands/assetManager";
import type { AssetSchema } from "../plugins/interfaces";
import AdvancedSearchComponent from "./AssetAdvancedSearchComponent.vue";
import AssetComponent from "./AssetComponent.vue";

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
  "addAssetAction",
  "editAssetAction",
  "viewAssetAction",
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
let searchText = ref("");
let pageNum = ref(1);
let assets: Ref<AssetSchema[]> = ref([]);
let showAdvanced = ref(false);
let multiplePages = ref(false);

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
  if (query.advanced === "true") {
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

// Advanced search
async function advancedSearch(asset: AssetSchema) {
  // Add new attribute to asset (this a wizard trick to make adding data to router easier)
  asset["advanced"] = "true";
  // Push asset to router
  router.push({ query: asset });
  // Query the API
  getAssetsByData(http, asset, (data, err) => {
    // Hide advanced search
    showAdvanced.value = false;
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
async function search() {
  // Reset dis shit
  multiplePages.value = false;
  // Check for webnx regex
  if (/WNX([0-9]{7})+/.test(searchText.value)) {
    // temp value
    let query = searchText.value;
    // Search and add to cart
    getAssetByID(http, query, (data, err) => {
      if (err) {
        // Part not found
        return errorHandler(err);
      }
      // Typecast data
      let asset = data as AssetSchema;
      // Check if asset does not exist
      if (asset == null) {
        // If no part was found
        return errorHandler("Asset not found.");
      }
      // Emit actions
      // Triple equals because Truthy and Falsy piss me off
      if (add === true) {
        emit("addAssetAction", asset);
      } else if (view === true) {
        emit("viewAssetAction", asset);
      } else if (edit == true) {
        emit("viewAssetAction", asset);
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
        if (err) {
          // Send error to error handler
          return errorHandler(err);
        }
        // typecast
        assets.value = data as AssetSchema[];
        // API will send 51 objects to indicate more pages
        if (assets.value.length > 50) {
          // Pop the extra object
          assets.value.pop;
          // Set multiple pages
          multiplePages.value = true;
        } else if (assets.value.length === 0 && pageNum.value != 1) {
          // Extra redundancy just in case query string is malformed
          pageNum.value = 1;
          search();
        }
      }
    );
  }
}

function addUntrackedAsset() {
  // Redirect
  router.push({ name: "Add Untracked Asset" });
}
</script>
