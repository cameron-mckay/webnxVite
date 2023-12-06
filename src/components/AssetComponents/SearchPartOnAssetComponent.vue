<!-- Identical to PartSearchComponent but without quantities and query strings
<template>
  <div>
    <form class="flex justify-between" @submit.prevent="searchButtonPressed">
      <input
        class="search"
        type="text"
        v-model="visibleSearchText"
        placeholder="🔍 keywords..."
      />
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
      <input class="search-button" type="submit" value="Search" />
      <AdvancedSearchComponent
        :http="http"
        v-show="showAdvanced"
        @partSearch="advancedSearchButtonPressed"
        @toggle="toggleAdvanced"
      />
    </form>
    <div v-if="parts.length != 0">
      <div
        class="relative grid grid-cols-4 p-1 text-center font-bold leading-8 transition md:p-2 md:leading-10"
      >

        <div
          v-if="totalPages > 1"
          class="float-right flex select-none justify-between"
        >
          <p class="my-auto inline-block">{{ `Page: ${pageNum}` }}</p>
          <div
            v-if="totalPages > 1 && !loading"
            class="float-right flex select-none"
          >
            <p class="my-auto mr-3 inline-block leading-6">{{ `Page: ${pageNum}` }}</p>
            <LeftCaretButton 
              v-on:click="prevPage"
              v-if="pageNum > 1"
            />
            <div v-else class="button-icon opacity-0"></div>
            <RightCaretButton
              v-if="pageNum<totalPages"
              v-on:click="nextPage"
            />
            <div v-else class="button-icon mr-0 opacity-0"></div>
          </div>
        </div>
      </div>
      <AssetPartComponent
        v-for="part in parts"
        v-bind:key="part._id"
        @addPartAction="$emit('addPartAction', part)"
        :part="part"
      />
    </div>
    <div v-else>
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
import { Ref, onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import {
getPartByID,
getPartsByData,
getPartsByTextSearch
} from '../../plugins/dbCommands/partManager';
import type { PartSchema } from '../../plugins/interfaces';
import AdvancedSearchComponent from '../PartComponents/PartAdvancedSearchComponent.vue';
import SlidersButton from '../GenericComponents/Buttons/SlidersButton.vue'
import LeftCaretButton from '../GenericComponents/Buttons/LeftCaretButton.vue'
import RightCaretButton from '../GenericComponents/Buttons/RightCaretButton.vue'
interface AddObject {
  show: boolean;
}
// Props interface
interface Props {
  http: AxiosInstance;
}

// Define shit
let props = defineProps<Props>();
let {
  http,
} = props;
const emit = defineEmits(['addPartAction', 'editPartAction', 'viewPartAction']);
defineExpose({
  externalRefresh
});

// component variables
let location = "Parts Room";
let building = ref(3);
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
    search();
});

// Previous search page
function prevPage() {
  // Check current page num
  if (pageNum.value > 1) {
    // Decrement
    pageNum.value -= 1;
    // Send search query
    // if (query.advanced === 'true') {
    //   let searchPart = {} as PartSchema;
    //   // Loop through query to create part object
    //   for (const key in query) {
    //     // Copy
    //     searchPart[key] = query[key];
    //   }
    //   advancedSearch(searchPart);
    // } else {
      search();
    // }
  }
}

// Next search page
function nextPage() {
  // let { query } = router.currentRoute.value;
  // Check if results have multiple pages
  if (pageNum.value<totalPages.value) {
    // Increment page num
    pageNum.value += 1;
    // Send search query
    // if (query.advanced === 'true') {
    //   let searchPart = {} as PartSchema;
    //   // Loop through query to create part object
    //   for (const key in query) {
    //     // Copy
    //     searchPart[key] = query[key];
    //   }
    //   advancedSearch(searchPart);
    // } else {
      search();
    // }
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
  //router.push({ query: part });
  // Query the API
  getPageAdvanced(pageNum.value, part)
    .then((res) => {
      parts.value = JSON.parse(JSON.stringify(res.parts));
      totalPages.value = res.numPages
      totalParts.value = res.numParts
      loading.value = false;
      pageCache.set(pageNum.value, res.parts);
    })
    .catch(() => {
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
  // router.push({
  //   query: {
  //     text: invisibleSearchText,
  //     pageNum: pageNum.value,
  //     building: building.value,
  //     location,
  //   },
  // });
  if (
    pageCache.has(pageNum.value) &&
    pageCache.get(pageNum.value)!.length > 0
  ) {
    parts.value = JSON.parse(JSON.stringify(pageCache.get(pageNum.value)!));
    checkCache();
  } else {
    loading.value = true;
    // Text search
    getPage(pageNum.value, invisibleSearchText)
      .then((res) => {
        parts.value = JSON.parse(JSON.stringify(res.parts));
        totalPages.value = res.numPages
        totalParts.value = res.numParts
        loading.value = false;
        pageCache.set(pageNum.value, res.parts);
        checkCache();
      })
      .catch(() => {
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
    );
  });
}

function searchButtonPressed() {
  // let { query } = router.currentRoute.value;
  if (invisibleSearchText != visibleSearchText.value) {
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
      pageCache.set(localPage, []);
      getPage(localPage, invisibleSearchText)
        .then((res) => {
          pageCache.set(localPage, res.parts);
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
          pageCache.set(localPage, res.parts);
        })
        .catch(() => {
          pageCache.delete(localPage);
        });
      page++;
    }
  }
}


function goTo(num: number) {
  if(num>0&&num<=totalPages.value) {
    pageNum.value = num
    // let { query } = router.currentRoute.value;
    // if (query.advanced === 'true') {
    //   let searchPart = {} as PartSchema;
    //   // Loop through query to create part object
    //   for (const key in query) {
    //     // Copy
    //     searchPart[key] = query[key];
    //   }
    //   advancedSearch(searchPart);
    //   return
    // }
    search()
  }
}

function getPageAdvanced(page: number, part: PartSchema) {
  return new Promise<{numPages: number, numParts: number, parts: PartSchema[]}>((res, rej) => {
    part['advanced'] = 'true';
    part['building'] = building.value.toString();
    part['pageNum'] = pageNum.value;
    part['pageSize'] = 50;
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
-->
<script setup lang="ts">
import { onBeforeMount, ref, Ref } from 'vue';
import { PartSchema, TextSearchPage } from '../../plugins/interfaces';
import { getPartsByData, getPartsByTextSearch } from '../../plugins/dbCommands/partManager';

import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import AdvancedSearchComponent from '../../components/PartComponents/PartAdvancedSearchComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';
import Cacher from '../../plugins/Cacher';
import AssetPartComponent from './PartOnAssetComponent.vue';

// Default building is Ogden - 3
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)
let http = Cacher.getHttp()
onBeforeMount(()=>{
  searchObject.disableRouter()
})

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string) {
  return new Promise<TextSearchPage>((res)=>{
    getPartsByTextSearch(http, searchString, pageNum, 3, (data: any, err) => {
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

function advancedSearchCallback(buildingNum: number, pageNum: number, searchObject: PartSchema) {
  return new Promise<TextSearchPage>((res)=>{
    searchObject['advanced'] = 'true';
    searchObject['pageNum'] = pageNum;
    searchObject['pageSize'] = 50;
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

// Toggle advanced search
function toggleAdvanced() {
  // Negate
  showAdvanced.value = !showAdvanced.value;
}

async function advancedSearchButtonPressed(part: PartSchema) {
  searchObject.newAdvancedSearch(3, 1, part)
  toggleAdvanced()
}

function displayResults(page: PartSchema[]) {
  parts.value = page
}

</script>
<template>
  <div>
    <PageHeaderComponent class="mb-4">Part Search</PageHeaderComponent>
    <TextSearchComponent
      :search-object="searchObject"
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
        <p>NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
      </template>
      <template v-slot:searchResults>
        <AssetPartComponent
          v-for="part in parts"
          v-bind:key="part._id"
          @addPartAction="$emit('addPartAction', part)"
          :part="part"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
