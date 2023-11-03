<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PalletEventComponent from '../../components/PalletComponents/PalletEventComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { getPalletUpdates } from '../../plugins/dbCommands/userManager';
import {
  Page,
  PalletEvent,
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
let palletEvents = ref([] as PalletEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<PalletEvent>;


onBeforeMount(async ()=>{
  analyticsSearchObject = await AnalyticsSearch.createAnalyticsSearch(http, router, 
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<Page>((res, rej)=>{
        getPalletUpdates(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err) => {
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

async function displayResults(page: PalletEvent[])
{
  // Load all the required info into the caches
  for(let e of page) {
    // Evil ass promise code
    await Promise.all([
      Promise.all(e.addedParts.map((p)=>{
        return analyticsSearchObject.getPartInfo(p)
      })),
      Promise.all(e.removedParts.map((p)=>{
        return analyticsSearchObject.getPartInfo(p)
      })),
      Promise.all(e.existingParts.map((p)=>{
        return analyticsSearchObject.getPartInfo(p)
      })),
      Promise.all(e.addedAssets.map((p)=>{
        return analyticsSearchObject.getAsset(p)
      })),
      Promise.all(e.removedAssets.map((p)=>{
        return analyticsSearchObject.getAsset(p)
      })),
      Promise.all(e.existingAssets.map((p)=>{
        return analyticsSearchObject.getAsset(p)
      }))
    ])
    await analyticsSearchObject.getPallet(e.pallet_id)
  }
  palletEvents.value = page
  resultsLoading.value = false
}

function showLoader() {
  resultsLoading.value = true
}

</script>
<template>
  <div>
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      Pallet Update History
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
      <PalletEventComponent
        :assets="analyticsSearchObject.assetCache"
        :user="analyticsSearchObject.getUser(event.by)!"
        :parts="analyticsSearchObject.partsCache"
        :pallets="analyticsSearchObject.palletCache"
        :event="event"
        v-for="event in palletEvents"
      />
    </AnalyticsSearchComponent>
  </div>
</template>