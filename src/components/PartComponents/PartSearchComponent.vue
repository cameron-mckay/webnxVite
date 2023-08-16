<template>
  <div>
    <form class="flex justify-between" @submit.prevent="searchButtonPressed">
      <input
        id="searchBox"
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
      <QRCodeButton @click="toggleQR" 
        :title="'Open QR scanner'"
      />
      <SlidersButton @click="toggleAdvanced"
        :title="'Advanced search'"
      />
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
        class="relative grid grid-cols-4 py-1 text-center font-bold leading-8 transition md:grid-cols-6 md:py-2 md:leading-10"
      >
        <p class="hidden md:block">NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p class="hidden md:block">Location</p>
        <p>Quantity</p>
        <!-- Left Caret -->
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
</template>
<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onBeforeMount, ref, onMounted } from 'vue';
import { Router } from 'vue-router';
import {
getPartsByData,
getPartsByTextSearch
} from '../../plugins/dbCommands/partManager';
import type { PartSchema } from '../../plugins/interfaces';
import QRCodeScannerPopupComponent from '../GenericComponents/QRCodeScannerPopupComponent.vue';
import AdvancedSearchComponent from './PartAdvancedSearchComponent.vue';
import QRCodeButton from '../GenericComponents/QRCodeButton.vue'
import SlidersButton from '../GenericComponents/SlidersButton.vue'
import LeftCaretButton from '../GenericComponents/LeftCaretButton.vue'
import RightCaretButton from '../GenericComponents/RightCaretButton.vue'
import PartComponent from './PartComponent.vue';

interface AddObject {
  show: boolean;
}
// Props interface
interface Props {
  http: AxiosInstance;
  building: number;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
  edit?: boolean;
  add?: boolean;
  view?: boolean;
  changeBuilding?: boolean;
  add_object?: AddObject;
  kioskName?: string;
  revokeLogin: () => void;
}

// Define shit
let props = defineProps<Props>();
let {
  http,
  router,
  kioskName,
  edit,
  add,
  view,
  changeBuilding,
  add_object,
} = props;
const emit = defineEmits(['addPartAction', 'editPartAction', 'viewPartAction']);
defineExpose({
  externalRefresh
});

// component variables
let building = ref(props.building);
let visibleSearchText = ref('');
let invisibleSearchText = '';
let pageNum = ref(1);
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let showQR = ref(false);
let loading = ref(false);
let pageCache = new Map<number, PartSchema[]>();
let totalPages = ref(1)
let totalParts = ref(0)
// Before component is mounted
onBeforeMount(async () => {
  // Fuck this
  let { query } = router.currentRoute.value;
  if (query.building) {
    building.value = parseInt(query.building as string);
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
    // Parse page number from query string
    if (query.pageNum) {
      pageNum.value = parseInt(query.pageNum as string);
    }
    // Initial search
    search();
  }
});

onMounted(()=>{
  // Focus search box by default
  document.getElementById("searchBox")?.focus()
})
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
  if (pageNum.value<totalPages.value) {
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
  // Copy extra info to query string
  part['advanced'] = 'true';
  if(kioskName)
    part['location'] = kioskName;
  part['building'] = building.value.toString();
  part['pageNum'] = pageNum.value;
  part['pageSize'] = 50;
  // Replace query string
  router.replace({ query: part });
  // Send request to API
  getPageAdvanced(pageNum.value, part)
    .then((res) => {
      // Copy parts
      parts.value = JSON.parse(JSON.stringify(res.parts));
      // Get total parts and pages
      totalPages.value = res.numPages
      totalParts.value = res.numParts
      // Finsihed loading
      loading.value = false;
      // Add to cache
      pageCache.set(pageNum.value, res.parts);
    })
    .catch(() => {
      // Error, go to page 1
      pageNum.value = 1;
      search();
    });

}

// Search function
async function search() {
  // Check for webnx regex
//  if (/PNX([0-9]{7})+/.test(invisibleSearchText)) {
//      // temp value
//      let query = invisibleSearchText
//      visibleSearchText.value = ""
//      invisibleSearchText = ""
//      // Search and add to cart
//      getPartByID(http, query, building.value, location, (data, err) => {
//          if (err) {
//              // Part not found
//              return errorHandler(err)
//          }
//          // Typecast data
//          let part = data as PartSchema
//          if (part == null) {
//              // If no part was found
//              return errorHandler("Part not found.")
//          }
//          // Emit actions
//          if (add === true) {
//              emit("addPartAction", part)
//          } else if (view === true) {
//              emit("viewPartAction", part)
//          } else if (edit == true) {
//              emit("viewPartAction", part)
//          }
//      })
//  }
//  else {
  // Update query string
  router.replace({
    query: {
      text: invisibleSearchText,
      pageNum: pageNum.value,
      building: building.value,
    },
  });
  // Check if page is in cache
  if (
    pageCache.has(pageNum.value) &&
    pageCache.get(pageNum.value)!.length > 0
  ) {
    // Copy page from cache
    parts.value = JSON.parse(JSON.stringify(pageCache.get(pageNum.value)!));
    // Update cache
    checkCache();
  } else {
    // Set loading screen
    loading.value = true;
    // Text search
    getPage(pageNum.value, invisibleSearchText)
      .then((res) => {
        // Copy parts
        parts.value = JSON.parse(JSON.stringify(res.parts));
        // Set total parts and pages
        totalPages.value = res.numPages
        totalParts.value = res.numParts
        // Loaded
        loading.value = false;
        // Save to cache
        pageCache.set(pageNum.value, res.parts);
        // Update Cache
        checkCache();
      })
      .catch(() => {
        // Error, go to page 1
        pageNum.value = 1;
        search();
      });
  }
}
//}

function getPage(page: number, text: string) {
  return new Promise<{numPages: number, numParts: number, parts: PartSchema[]}>((res, rej) => {
    getPartsByTextSearch(
      http,
      text,
      page,
      building.value,
      (data: any, err) => {
        if (err) {
          // Send error to error handler
          rej();
        }
        const response = data as {numPages: number, numParts: number, parts: PartSchema[]}
        // typecast
        if (response.parts && response.parts.length === 0 && page != 1) {
          // Extra redundancy just in case query string is malformed
          rej();
        }
        res(response);
      }
    , kioskName);
  });
}

function searchButtonPressed() {
  let { query } = router.currentRoute.value;
  if (invisibleSearchText != visibleSearchText.value||query.advanced=='true') {
    pageCache = new Map<number, PartSchema[]>();
    invisibleSearchText = visibleSearchText.value;
  }
  pageNum.value = 1;
  search();
}

function externalRefresh() {
  // pageCache = new Map<number, PartSchema[]>();
  // invisibleSearchText = visibleSearchText.value;
  // pageNum.value = 1;
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
      pageCache.set(localPage, [])
      try{
        let p = await getPage(localPage, invisibleSearchText)
        pageCache.set(localPage, p.parts);
        page -= 1;
      }
      catch(e) {
        pageCache.delete(localPage)
        break
      }
    }
  }
  page = pageNum.value;
  while (page <= pageNum.value + 5) {
    let localPage = page;
    if (pageCache.has(localPage)) {
      page++;
      continue;
    } else {
      pageCache.set(localPage, [])
      try{
        let p = await getPage(localPage, invisibleSearchText)
        pageCache.set(localPage, p.parts);
        page++;
      }
      catch(e) {
        pageCache.delete(localPage)
        break
      }
    }
  }
}


function goTo(num: number) {
  // Check if page is in valid range
  if(num>0&&num<=totalPages.value) {
    // Update page number
    pageNum.value = num
    // Get query string
    let { query } = router.currentRoute.value;
    // If advanced
    if (query.advanced === 'true') {
      let searchPart = {} as PartSchema;
      // Loop through query to create part object
      for (const key in query) {
        // Copy
        searchPart[key] = query[key];
      }
      // Advanced search
      advancedSearch(searchPart);
      return
    }
    // Normal search
    search()
  }
}

function getPageAdvanced(page: number, part: PartSchema) {
  return new Promise<{numPages: number, numParts: number, parts: PartSchema[]}>((res, rej) => {
    // Copy info to part for query string
    part['advanced'] = 'true';
    part['building'] = building.value.toString();
    part['pageNum'] = pageNum.value;
    part['pageSize'] = 50;
    // Send request to api
    getPartsByData(http, part, (data, err) => {
      if (err) {
        // Send error to error handler
        rej();
      }
      const response = data as {numPages: number, numParts: number, parts: PartSchema[]}
      // typecast
      if (response.parts && response.parts.length === 0 && page != 1) {
        // Extra redundancy just in case query string is malformed
        rej();
      }
      res(response);
    });
  });
}
</script>
