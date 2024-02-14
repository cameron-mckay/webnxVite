<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onMounted, ref, Ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import { PartSchema, TextSearchPage, UserState } from '../../plugins/interfaces';
import { getPartsByData, getPartsByTextSearch } from '../../plugins/dbCommands/partManager';
import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue'
import AdvancedSearchComponent from '../../components/PartComponents/PartAdvancedSearchComponent.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';
import PartComponent from '../../components/PartComponents/PartComponent.vue';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>();

// Default building is Ogden - 3
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)

onMounted(()=>{
  Notification.requestPermission().then(()=>{
    new Notification("Test")
  })
})

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string) {
  return new Promise<TextSearchPage>((res)=>{
    getPartsByTextSearch(http, searchString, pageNum, buildingNum, (data: any, err) => {
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
  searchObject.newAdvancedSearch(store.state.user.building!, 1, part)
  toggleAdvanced()
}

function displayResults(page: PartSchema[]) {
  parts.value = page
}

function viewPart(part: PartSchema) {
  router.push({ name: 'Part View', query: { nxid: part.nxid } });
}

function addToCart(part: PartSchema) {
  // Check if cart quantity < available quantity
  if (
    part.quantity &&
    part.nxid &&
    store.getters.getQuantity(part.nxid) < part.quantity
  ) {
    // Add to cart
    displayMessage(`Added ${part.manufacturer} ${part.name} to cart`);
    store.commit('addToCart', part);
  } else {
    // Not enough stock
    errorHandler(`Not enough stock`);
  }
}
</script>
<template>
  <div>
    <PageHeaderComponent class="mb-4">Part Search</PageHeaderComponent>
    <TextSearchComponent
      :search-object="searchObject"
      :hide-q-r="true"
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
        <p class="hidden md:block">NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p class="hidden md:block">Location</p>
        <p>Quantity</p>
      </template>
      <template v-slot:searchResults>
        <PartComponent
          :add="store.state.user.roles?.includes('is_kiosk')||store.state.user.roles?.includes('request_parts')"
          :view="true"
          :showAudit="store.state.user.roles?.includes('view_audit_date')"
          v-for="part in parts"
          @addPartAction="addToCart(part)"
          @viewPartAction="viewPart(part)"
          :part="part"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
