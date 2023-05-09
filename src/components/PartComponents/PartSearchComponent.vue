<template>
  <div>
    <form class="flex justify-between" @submit.prevent="searchButtonPressed">
      <input
        class="search ml-0"
        type="text"
        v-model="visibleSearchText"
        placeholder="🔍 keywords..."
      />
      <select
        v-if="changeBuilding === true"
        v-model="building"
        class="search hidden w-fit md:block"
      >
        <option :value="3" selected>3 - Ogden</option>
        <option :value="1">1 - LA</option>
      </select>
      <select
        v-if="changeBuilding === true"
        v-model="building"
        class="search ml-0 block w-fit md:hidden"
      >
        <option :value="3" selected>3</option>
        <option :value="1">1</option>
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
      <input class="search-button mr-0" type="submit" value="Search" />
      <AdvancedSearchComponent
        :http="http"
        v-show="showAdvanced"
        @partSearch="advancedSearchButtonPressed"
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
    <div v-else-if="parts.length != 0">
      <div
        class="relative grid grid-cols-4 p-1 text-center font-bold leading-8 transition md:grid-cols-6 md:p-2 md:leading-10"
      >
        <p class="hidden md:block">NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p class="hidden md:block">Location</p>
        <p>Quantity</p>
        <div
          v-if="multiplePages || pageNum > 1"
          class="float-right flex select-none justify-between"
        >
          <p class="my-auto inline-block">{{ `Page: ${pageNum}` }}</p>
          <!-- Left Caret -->
          <div class="flex shrink-0">
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
              class="button-icon hover:button-icon-hover active:button-icon-active mr-0"
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
            <div v-else class="button-icon mr-0 opacity-0"></div>
          </div>
        </div>
      </div>
      <div class="md:animate-bottom">
        <PartComponent
          :add="add || add_object!.show == true"
          :edit="edit"
          :view="view"
          v-for="part in parts"
          v-bind:key="part._id"
          @editPartAction="$emit('editPartAction', part)"
          @addPartAction="$emit('addPartAction', part)"
          @viewPartAction="$emit('viewPartAction', part)"
          :part="part"
        />
      </div>
    </div>
    <div v-else class="md:animate-bottom my-4">
      <p>No results...</p>
    </div>
    <div
      v-if="(multiplePages || pageNum > 1) && !loading"
      class="float-right flex select-none"
    >
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
  getPartsByData,
  getPartsByTextSearch,
} from '../../plugins/dbCommands/partManager';
import type { PartSchema } from '../../plugins/interfaces';
import QRCodeScannerPopupComponent from '../GenericComponents/QRCodeScannerPopupComponent.vue';
import AdvancedSearchComponent from './PartAdvancedSearchComponent.vue';
import PartComponent from './PartComponent.vue';

interface AddObject {
  show: boolean;
}
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
  add_object?: AddObject;
}

// Define shit
let props = defineProps<Props>();
let {
  http,
  router,
  errorHandler,
  displayMessage,
  edit,
  add,
  view,
  changeBuilding,
  add_object,
} = props;
const emit = defineEmits(['addPartAction', 'editPartAction', 'viewPartAction']);
defineExpose({
  search,
});

// component variables
let location = props.location;
let building = ref(props.building);
let visibleSearchText = ref('');
let invisibleSearchText = '';
let pageNum = ref(1);
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let showQR = ref(false);
let multiplePages = ref(false);
let loading = ref(false);
let pageCache = new Map<number, PartSchema[]>();
// Before component is mounted
onBeforeMount(async () => {
  // Fuck this
  let { query } = router.currentRoute.value;
  if (query.building) {
    building.value = parseInt(query.building as string);
  }
  if (query.location) {
    location = query.location as string;
  }
  // Check for advanced search
  if (query.advanced === 'true') {
    let searchPart = {} as PartSchema;
    // Loop through query to create part object
    for (const key in query) {
      // Copy
      searchPart[key] = query[key];
    }
    // Search
    advancedSearch(searchPart);
  } else {
    // Check for search text
    if (query.text) {
      visibleSearchText.value = query.text as string;
      invisibleSearchText = visibleSearchText.value;
    }
    if (query.pageNum) {
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
      let searchPart = {} as PartSchema;
      // Loop through query to create part object
      for (const key in query) {
        // Copy
        searchPart[key] = query[key];
      }
      advancedSearch(searchPart);
    } else {
      search();
    }
  }
}

// Next search page
function nextPage() {
  let { query } = router.currentRoute.value;
  // Check if results have multiple pages
  if (multiplePages) {
    // Increment page num
    pageNum.value += 1;
    // Send search query
    if (query.advanced === 'true') {
      let searchPart = {} as PartSchema;
      // Loop through query to create part object
      for (const key in query) {
        // Copy
        searchPart[key] = query[key];
      }
      advancedSearch(searchPart);
    } else {
      search();
    }
  }
}

// Toggle advanced search
function toggleAdvanced() {
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
async function advancedSearch(part: PartSchema) {
  showAdvanced.value = false;
  loading.value = true;
  part['advanced'] = 'true';
  part['location'] = location;
  part['building'] = building.value.toString();
  part['pageNum'] = pageNum.value;
  part['pageSize'] = 50;
  multiplePages.value = false;
  router.push({ query: part });
  // Query the API
  getPartsByData(http, part, (data, err) => {
    // Hide advanced search
    loading.value = false;
    showAdvanced.value = false;
    // Error
    if (err) {
      // Handle the error
      return errorHandler(err);
    } else if (data) {
      // Set parts list to API response
      parts.value = data as PartSchema[];
      if (parts.value.length > 50) {
        multiplePages.value = true;
        // Pop the extra object
        parts.value.pop();
        // Set multiple pages
      }
    }
  });
}

// Search function
async function search() {
  // Check for webnx regex
  // if (/WNX([0-9]{7})+/.test(searchText.value)) {
  //     // temp value
  //     let query = searchText.value
  //     searchText.value = ""
  //     // Search and add to cart
  //     getPartByID(http, query, building.value, location, (data, err) => {
  //         if (err) {
  //             // Part not found
  //             return errorHandler(err)
  //         }
  //         // Typecast data
  //         let part = data as PartSchema
  //         if (part == null) {
  //             // If no part was found
  //             return errorHandler("Part not found.")
  //         }
  //         // Emit actions
  //         if (add === true) {
  //             emit("addPartAction", part)
  //         } else if (view === true) {
  //             emit("viewPartAction", part)
  //         } else if (edit == true) {
  //             emit("viewPartAction", part)
  //         }
  //     })
  // }
  // else {
  router.push({
    query: {
      text: invisibleSearchText,
      pageNum: pageNum.value,
      building: building.value,
      location,
    },
  });
  if (
    pageCache.has(pageNum.value) &&
    pageCache.get(pageNum.value)!.length > 0
  ) {
    parts.value = JSON.parse(JSON.stringify(pageCache.get(pageNum.value)!));
    if (parts.value.length > 50) {
      multiplePages.value = true;
      // Pop the extra object
      parts.value.pop();
      // Set multiple pages
      checkCache();
    }
  } else {
    loading.value = true;
    multiplePages.value = false;
    // Text search
    getPage(pageNum.value, invisibleSearchText)
      .then((p) => {
        parts.value = JSON.parse(JSON.stringify(p));
        if (parts.value.length > 50) {
          multiplePages.value = true;
          // Pop the extra object
          parts.value.pop();
          // Set multiple pages
        }
        loading.value = false;
        pageCache.set(pageNum.value, p);
        checkCache();
      })
      .catch(() => {
        pageNum.value = 1;
        search();
      });
  }
  // }
}

function getPage(page: number, text: string) {
  return new Promise<PartSchema[]>((res, rej) => {
    getPartsByTextSearch(
      http,
      text,
      page,
      building.value,
      location,
      (data: any, err) => {
        if (err) {
          // Send error to error handler
          rej();
        }
        // typecast
        if (data && data.length === 0 && page != 1) {
          // Extra redundancy just in case query string is malformed
          rej();
        }
        res(data as PartSchema[]);
      }
    );
  });
}

function searchButtonPressed() {
  if (invisibleSearchText != visibleSearchText.value) {
    pageCache = new Map<number, PartSchema[]>();
    invisibleSearchText = visibleSearchText.value;
  }
  pageNum.value = 1;
  search();
}

function advancedSearchButtonPressed(asset: PartSchema) {
  pageNum.value = 1;
  advancedSearch(asset);
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
        .then((p: PartSchema[]) => {
          pageCache.set(localPage, p);
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
        .then((p) => {
          pageCache.set(localPage, p);
        })
        .catch(() => {
          pageCache.delete(localPage);
        });
      page++;
    }
  }
}
</script>
