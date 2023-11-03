<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import AssetEventComponent from '../../components/AssetComponents/AssetEventComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import { getAssetUpdates } from '../../plugins/dbCommands/userManager';
import {
AssetEvent,
  Page,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

let loaded = ref(false)
let resultsLoading = ref(false)
let assetEvents = ref([] as AssetEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<AssetEvent>;


onBeforeMount(async ()=>{
  analyticsSearchObject = await AnalyticsSearch.createAnalyticsSearch(http, router, 
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<Page>((res, rej)=>{
        getAssetUpdates(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err) => {
          if(err)
            return res({total: 0, pages: 0, events: []})
          let p = data as Page
          res(p)
        },
        userFilters,
        partFilters,
        hideOtherParts
        )
      })
    }
  );
  loaded.value = true
})

async function displayResults(page: AssetEvent[])
{
  // Load all the required info into the caches
  for(let e of page) {
    // Evil ass promise code
    await Promise.all([
      Promise.all(e.added.map((p)=>{
        return analyticsSearchObject.getPartInfo(p)
      })),
      Promise.all(e.removed.map((p)=>{
        return analyticsSearchObject.getPartInfo(p)
      })),
      Promise.all(e.existing.map((p)=>{
        return analyticsSearchObject.getPartInfo(p)
      }))
    ])
    await analyticsSearchObject.getAsset(e.asset_id)
  }
  assetEvents.value = page
  resultsLoading.value = false
}

function showLoader() {
  resultsLoading.value = true
}

</script>
<template>
  <div>
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      Asset Update History
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
      <AssetEventComponent
        :assets="analyticsSearchObject.assetCache"
        :user="analyticsSearchObject.getUser(event.by)!"
        :parts="analyticsSearchObject.partsCache"
        :event="event"
        v-for="event in assetEvents"
      />
    </AnalyticsSearchComponent>
  </div>
</template>
