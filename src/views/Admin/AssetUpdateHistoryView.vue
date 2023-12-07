<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import AssetEventComponent from '../../components/AssetComponents/AssetEventComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { getAssetUpdates } from '../../plugins/dbCommands/userManager';
import {
  AssetEvent,
  AnalyticsSearchPage,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
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
let assetEvents = ref([] as AssetEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<AssetEvent>;


onBeforeMount(async ()=>{
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts, assetFilters)=>{
      return new Promise<AnalyticsSearchPage>((res, rej)=>{
        getAssetUpdates(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err) => {
          if(err)
            return res({total: 0, pages: 0, events: []})
          let p = data as AnalyticsSearchPage
          res(p)
        },
        userFilters,
        partFilters,
        hideOtherParts,
        assetFilters
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
      Cacher.getAsset(e.asset_id),
      Promise.all(e.added.map((p)=>{
        return Cacher.getPartInfo(p)
      })),
      Promise.all(e.removed.map((p)=>{
        return Cacher.getPartInfo(p)
      })),
      Promise.all(e.existing.map((p)=>{
        return Cacher.getPartInfo(p)
      }))
    ])
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
    <LoaderComponent v-if="!loaded"/>
    <AnalyticsSearchComponent v-else 
      :resultsLoading="resultsLoading"
      :searchComponent="analyticsSearchObject"
      :show-user-filters="true"
      :show-part-filters="true"
      :show-asset-filters="true"
      @displayResults="displayResults"
      @showLoader="showLoader"
    >
      <AssetEventComponent
        :assets="Cacher.getAssetCache()"
        :user="Cacher.getUser(event.by)!"
        :parts="Cacher.getPartCache()"
        :event="event"
        v-for="event in assetEvents"
      />
    </AnalyticsSearchComponent>
  </div>
</template>
