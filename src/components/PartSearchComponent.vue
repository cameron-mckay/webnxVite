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
        class="inline-block h-10 w-10 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500"
        @click="toggleAdvanced"
        src="../assets/sliders-solid.svg"
      />
      <input class="submit mt-0 w-[calc(20%)]" type="submit" value="Search" />
      <AdvancedSearchComponent
        :http="http"
        v-show="showAdvanced"
        @partSearch="advancedSearch"
        @toggle="toggleAdvanced"
      />
    </form>
    <div v-if="parts.length != 0">
      <div
        class="relative grid grid-cols-4 p-2 text-center font-bold leading-10 transition md:grid-cols-6"
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
      <img
        v-show="multiplePages || pageNum > 1"
        class="inline-block h-10 w-10 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500"
        src="../assets/caret-left-solid.svg"
        v-on:click="prevPage"
      />
      <img
        v-show="multiplePages || pageNum > 1"
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
