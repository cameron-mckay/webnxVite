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
  AnalyticsSearchPage,
  PalletEvent,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import Cacher from '../../plugins/Cacher';
import { replaceLinksWithAnchors } from '../../plugins/CommonMethods';

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
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts, palletFilters)=>{
      return new Promise<AnalyticsSearchPage>((res, rej)=>{
        getPalletUpdates(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err) => {
          if(err)
            return res({total: 0, pages: 0, events: []})
          let p = data as AnalyticsSearchPage
          res(p)
        },
        userFilters,
        partFilters,
        hideOtherParts,
        palletFilters
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
        return Cacher.getPartInfo(p)
      })),
      Promise.all(e.removedParts.map((p)=>{
        return Cacher.getPartInfo(p)
      })),
      Promise.all(e.existingParts.map((p)=>{
        return Cacher.getPartInfo(p)
      })),
      Promise.all(e.addedAssets.map((p)=>{
        return Cacher.getAsset(p)
      })),
      Promise.all(e.removedAssets.map((p)=>{
        return Cacher.getAsset(p)
      })),
      Promise.all(e.existingAssets.map((p)=>{
        return Cacher.getAsset(p)
      })),
      Promise.all(e.addedBoxes.map((p)=>{
        return Cacher.getBox(p)
      })),
      Promise.all(e.removedBoxes.map((p)=>{
        return Cacher.getBox(p)
      })),
      Promise.all(e.existingBoxes.map((p)=>{
        return Cacher.getBox(p)
      }))
    ])
    await Cacher.getPallet(e.pallet_id)
  }
  palletEvents.value = page
  resultsLoading.value = false
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
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
        :assets="Cacher.getAssetCache()"
        :user="Cacher.getUser(event.by)!"
        :parts="Cacher.getPartCache()"
        :pallets="Cacher.getPalletCache()"
        :boxes="Cacher.getBoxCache()"
        :event="event"
        v-for="event in palletEvents"
      />
    </AnalyticsSearchComponent>
  </div>
</template>
