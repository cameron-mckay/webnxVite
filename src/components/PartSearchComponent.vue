<template>
  <div>
    <form class="flex justify-between" @submit.prevent="search">
      <input
        class="search ml-0"
        type="text"
        v-model="searchText"
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
        class="search block w-fit md:hidden ml-0"
      >
        <option :value="3" selected>3</option>
        <option :value="1">1</option>
      </select>
      <!-- Sliders -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="button-icon hover:button-icon-hover active:button-icon-active no-margin-on-mobile"
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
        @partSearch="advancedSearch"
        @toggle="toggleAdvanced"
      />
    </form>
    <div v-if="parts.length != 0">
      <div
        class="relative grid grid-cols-4 p-1 text-center font-bold leading-8 transition md:grid-cols-6 md:p-2 md:leading-10"
      >
        <p class="hidden md:block">NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p class="hidden md:block">Location</p>
        <p>Quantity</p>
        <p></p>
      </div>
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
    <div v-else>
      <p>No results...</p>
    </div>
    <div class="text-right">
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
import { Router } from "vue-router";
import {
getPartsByData,
getPartsByTextSearch,
} from "../plugins/dbCommands/partManager";
import type { PartSchema } from "../plugins/interfaces";
import AdvancedSearchComponent from "./PartAdvancedSearchComponent.vue";
import PartComponent from "./PartComponent.vue";

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
const emit = defineEmits(["addPartAction", "editPartAction", "viewPartAction"]);
defineExpose({
  search,
});

// component variables
let location = props.location;
let building = ref(props.building);
let searchText = ref("");
let pageNum = ref(1);
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let multiplePages = ref(false);

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
  if (query.advanced === "true") {
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
      searchText.value = query.text as string;
    }
    if (query.pageNum) {
      pageNum.value = parseInt(query.pageNum as string);
    }
    search();
  }
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
  part["advanced"] = "true";
  part["location"] = location;
  part["building"] = building.value.toString();
  router.push({ query: part });
  // Query the API
  delete part["location"];
  delete part["building"];
  delete part["advanced"];
  delete part["nxid"];
  getPartsByData(http, part, building.value, location, (data, err) => {
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
  multiplePages.value = false;
  // Text search
  router.push({
    query: {
      text: searchText.value,
      pageNum: pageNum.value,
      building: building.value,
      location,
    },
  });
  getPartsByTextSearch(
    http,
    searchText.value,
    pageNum.value,
    building.value,
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
  // }
}
</script>
