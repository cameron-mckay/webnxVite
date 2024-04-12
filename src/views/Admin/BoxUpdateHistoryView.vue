<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { getBoxUpdates, getNewBoxes } from '../../plugins/dbCommands/userManager';
import {
  AnalyticsSearchPage,
  BoxEvent,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import Cacher from '../../plugins/Cacher';
import BoxEventComponent from '../../components/BoxComponents/BoxEventComponent.vue';
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
let boxEvents = ref([] as BoxEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<BoxEvent>;


onBeforeMount(async ()=>{
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts, box_tags)=>{
      return new Promise<AnalyticsSearchPage>((res, rej)=>{
        getBoxUpdates(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err) => {
          if(err)
            return res({total: 0, pages: 0, events: []})
          let p = data as AnalyticsSearchPage
          res(p)
        },
        userFilters,
        partFilters,
        hideOtherParts,
        box_tags
        )
      })
    }
  );
  loaded.value = true
})

async function displayResults(page: BoxEvent[])
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
    ])
    await Cacher.getBox(e.box_id)
  }
  boxEvents.value = page
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
      Box Update History
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
      <BoxEventComponent
        :boxes="Cacher.getBoxCache()"
        :assets="Cacher.getAssetCache()"
        :parts="Cacher.getPartCache()"
        :user="Cacher.getUser(event.by)"
        :event="event"
        v-for="event in boxEvents"
      />
    </AnalyticsSearchComponent>
  </div>
</template>
