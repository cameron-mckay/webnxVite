<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import PartEventComponent from '../../components/AdminComponents/PartEventComponent.vue';
import {
  Page,
  PartEvent,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import { getPartCreateAndDeleteHistory } from '../../plugins/dbCommands/partManager';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

let loaded = ref(false)
let resultsLoading = ref(false)
let allTechsHistory = ref([] as PartEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<PartEvent>;


onBeforeMount(async ()=>{
  analyticsSearchObject = await AnalyticsSearch.createAnalyticsSearch(http, router, 
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<Page>((res)=>{
        getPartCreateAndDeleteHistory(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err)=>{
          if(err) {
            return res({total: 0, pages: 0, events: []})
          }
          // Load all users now.
          let p = data as Page
          res(p)
        },
        userFilters,
        partFilters,
        hideOtherParts)
      })
    }
  );
  loaded.value = true
})

async function displayResults(page: PartEvent[])
{
  console.log(page)
  // Load all the required info into the caches
  for(let e of page) {
    // Evil ass promise code
    await Promise.all(e.added.map((p)=>{
      return analyticsSearchObject.getPartInfo(p)
    }))
    await Promise.all(e.removed.map((p)=>{
      return analyticsSearchObject.getPartInfo(p)
    }))
  }
  allTechsHistory.value = page
  resultsLoading.value = false
}

function showLoader() {
  resultsLoading.value = true
}

</script>
<template>
  <div>
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      Part Action History
    </PageHeaderWithBackButton>
    <div v-if="!loaded" class="my-4 flex justify-center">
      <div class="loader text-center"></div>
    </div>
    <AnalyticsSearchComponent v-else 
      :resultsLoading="resultsLoading"
      :searchComponent="analyticsSearchObject"
      :show-user-filters="true"
      :show-part-filters="true"
      @displayResults="displayResults"
      @showLoader="showLoader"
    >
    <PartEventComponent v-for="event of allTechsHistory" 
        :event="event"
        :users="analyticsSearchObject.getAllUserMap()"
        :parts="analyticsSearchObject.partsCache"
      />
    </AnalyticsSearchComponent>
  </div>
</template>
