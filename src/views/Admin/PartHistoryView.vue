<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import PartEventComponent from '../../components/AdminComponents/PartEventComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import {
  AnalyticsSearchPage,
  PartEvent,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import { getPartCreateAndDeleteHistory } from '../../plugins/dbCommands/partManager';
import Cacher from '../../plugins/Cacher';

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
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<AnalyticsSearchPage>((res)=>{
        getPartCreateAndDeleteHistory(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err)=>{
          if(err) {
            return res({total: 0, pages: 0, events: []})
          }
          // Load all users now.
          let p = data as AnalyticsSearchPage
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
  // Load all the required info into the caches
  for(let e of page) {
    // Evil ass promise code
    await Promise.all(e.added.map((p)=>{
      return Cacher.getPartInfo(p)
    }))
    await Promise.all(e.removed.map((p)=>{
      return Cacher.getPartInfo(p)
    }))
  }
  allTechsHistory.value = page
  resultsLoading.value = false
  setTimeout(()=>document.body.scrollTo({top: 0, behavior: "smooth"}),0)
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
    <LoaderComponent v-if="!loaded"/>
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
        :users="Cacher.getAllUserMap()"
        :parts="Cacher.getPartCache()"
      />
    </AnalyticsSearchComponent>
  </div>
</template>
