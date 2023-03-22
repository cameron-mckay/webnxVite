<!-- Identical to PartSearchComponent but without quantities and query strings -->
<template>
  <div>
    <form class="flex justify-between" @submit.prevent="search">
      <!-- Search box -->
      <input
        class="search"
        type="text"
        v-model="searchText"
        placeholder="🔍 keywords..."
      />
      <!-- Toggle advance search button -->
      <!-- Sliders -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="button-icon"
        @click="toggleAdvanced"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M0 416c0-17.7 14.3-32 32-32l54.7 0c12.3-28.3 40.5-48 73.3-48s61 19.7 73.3 48L480 384c17.7 0 32 14.3 32 32s-14.3 32-32 32l-246.7 0c-12.3 28.3-40.5 48-73.3 48s-61-19.7-73.3-48L32 448c-17.7 0-32-14.3-32-32zm192 0c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zM384 256c0-17.7-14.3-32-32-32s-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32zm-32-80c32.8 0 61 19.7 73.3 48l54.7 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-54.7 0c-12.3 28.3-40.5 48-73.3 48s-61-19.7-73.3-48L32 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l246.7 0c12.3-28.3 40.5-48 73.3-48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32s32-14.3 32-32s-14.3-32-32-32zm73.3 0L480 64c17.7 0 32 14.3 32 32s-14.3 32-32 32l-214.7 0c-12.3 28.3-40.5 48-73.3 48s-61-19.7-73.3-48L32 128C14.3 128 0 113.7 0 96S14.3 64 32 64l86.7 0C131 35.7 159.2 16 192 16s61 19.7 73.3 48z"
        />
      </svg>
      <!-- Search button -->
      <input class="search-button" type="submit" value="Search" />
      <!-- Advanced search object -->
      <AdvancedSearchComponent
        :http="http"
        v-show="showAdvanced"
        @partSearch="advancedSearch"
        @toggle="toggleAdvanced"
      />
    </form>
    <!-- If there are parts -->
    <div v-if="parts.length != 0">
      <!-- Headers -->
      <div
        class="relative grid grid-cols-4 p-1 text-center font-bold leading-8 transition md:p-2 md:leading-10"
      >
        <p>NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p></p>
      </div>
      <!-- Asset part component for each search result -->
      <AssetPartComponent
        v-for="part in parts"
        v-bind:key="part._id"
        @addPartAction="$emit('addPartAction', part)"
        :part="part"
      />
    </div>
    <!-- If there are no results -->
    <div v-else>
      <p>No results...</p>
    </div>
    <!-- Next and previous buttons for search -->
    <div class="text-right">
      <!-- Current page number -->
      <p class="mr-3 inline-block">{{ `Page: ${pageNum}` }}</p>
      <!-- Left Caret -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 512"
        v-on:click="prevPage"
        v-if="multiplePages || pageNum > 1"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"
        />
      </svg>

      <!-- Right Caret -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 512"
        v-if="multiplePages || pageNum > 1"
        v-on:click="nextPage"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"
        />
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { AxiosError, AxiosInstance } from "axios";
import { Ref, onBeforeMount, ref } from "vue";
import {
  getPartByID,
  getPartsByData,
  getPartsByTextSearch,
} from "../plugins/dbCommands/partManager";
import type { PartSchema } from "../plugins/interfaces";
import AdvancedSearchComponent from "./PartAdvancedSearchComponent.vue";
import AssetPartComponent from "./PartOnAssetComponent.vue";

// Props interface
interface Props {
  http: AxiosInstance;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

// Define shit
let props = defineProps<Props>();
let { http, errorHandler, displayMessage } = props;
const emit = defineEmits(["addPartAction"]);
defineExpose({
  search,
});

// component variables
let location = "";
let building = 3;
let searchText = ref("");
let pageNum = ref(1);
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let multiplePages = ref(false);

// Before component is mounted
onBeforeMount(async () => {
  search();
});

// Previous search page
function prevPage() {
  if (pageNum.value > 1) {
    pageNum.value -= 1;
    search();
  }
}

// Next search page
function nextPage() {
  if (multiplePages) {
    pageNum.value += 1;
    search();
  }
}

// Toggle advanced search
function toggleAdvanced() {
  showAdvanced.value = !showAdvanced.value;
}

// Advanced search
async function advancedSearch(part: PartSchema) {
  // Query the API
  getPartsByData(http, part, building, location, (data, err) => {
    // Hide advanced search
    showAdvanced.value = false;
    // Error
    if (err) {
      // Handle the error
      return errorHandler(err);
    } else if (data) {
      // Set parts list to API response
      parts.value = data as PartSchema[];
    }
  });
}

// Search function
async function search() {
  // Check for webnx regex
  if (/WNX([0-9]{7})+/.test(searchText.value)) {
    // temp value
    let query = searchText.value;
    searchText.value = "";
    // Search and add to cart
    getPartByID(http, query, building, location, (data, err) => {
      if (err) {
        // Part not found
        return errorHandler(err);
      }
      // Typecast data
      let part = data as PartSchema;
      if (part == null) {
        // If no part was found
        return errorHandler("Part not found.");
      }
      // Emit actions
      emit("addPartAction", part);
    });
  } else {
    multiplePages.value = false;
    // Text search
    getPartsByTextSearch(
      http,
      searchText.value,
      pageNum.value,
      building,
      location,
      (data: any, err) => {
        if (err) {
          // Send error to error handler
          return errorHandler(err);
        }
        // typecast
        parts.value = data as PartSchema[];
        if (parts.value.length > 50) {
          parts.value.pop;
          multiplePages.value = true;
        } else if (parts.value.length === 0 && pageNum.value != 1) {
          pageNum.value = 1;
          search();
        }
      }
    );
  }
}
</script>
