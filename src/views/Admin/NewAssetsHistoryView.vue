<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import AssetEventComponent from '../../components/AssetComponents/AssetEventComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { getNewAssets } from '../../plugins/dbCommands/userManager';
import {
  AssetEvent,
  AnalyticsSearchPage,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import Cacher from '../../plugins/Cacher';
import { arrayToCSV, downloadCSV, replaceLinksWithAnchors } from '../../plugins/CommonMethods';

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
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<AnalyticsSearchPage>((res, rej)=>{
        getNewAssets(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err) => {
          if(err)
            return res({total: 0, pages: 0, events: []})
          let p = data as AnalyticsSearchPage
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
        return Cacher.getPartInfo(p)
      })),
      Promise.all(e.removed.map((p)=>{
        return Cacher.getPartInfo(p)
      })),
      Promise.all(e.existing.map((p)=>{
        return Cacher.getPartInfo(p)
      }))
    ])
    await Cacher.getAsset(e.asset_id)
  }
  assetEvents.value = page
  resultsLoading.value = false
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
  setTimeout(()=>document.body.scrollTo({top: 0, behavior: "smooth"}),0)
}

function showLoader() {
  resultsLoading.value = true
}

async function getCSV() {
  getNewAssets(http, analyticsSearchObject.getStartDateFromRouter().getTime(), analyticsSearchObject.getEndDateFromRouter().getTime(), 1, 10, async (data, err) => {
    if(err)
      return
    let arr = data as any[]

    let summary = []
    let parts = [] as any[]

    for(let e of arr) {
        let user = Cacher.getUser(e.by)
        let by = user.first_name + " " + user.last_name
        let date = (new Date(e.date_begin)).toLocaleString()
        let asset_tag = (await Cacher.getAsset(e.asset_id)).asset_tag!
        asset_tag = asset_tag ? asset_tag : "UNKNOWN"
        summary.push({by, date, asset_tag, info_updated: e.info_updated, existing: e.existing.length, added: e.added.length, removed: e.removed.length})
        parts = parts.concat(e.added.map((p: any)=>{
          return { date, by, asset_tag, nxid: p.nxid, quantity: p.quantity ? p.quantity : 1, serial: p.serial ? p.serial : " ", action: "added" }
        }))
        parts = parts.concat(e.removed.map((p: any)=>{
          return { date, by, asset_tag, nxid: p.nxid, quantity: p.quantity ? p.quantity : 1, serial: p.serial ? p.serial : " ", action: "removed" }
        }))
    }
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Summary_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(summary))
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Parts_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(parts))
  },
  Array.from(analyticsSearchObject.getUserFilterMapFromRouter().keys()),
  Array.from((await analyticsSearchObject.getPartFilterMapFromRouter()).keys()),
  analyticsSearchObject.getHideOthersFromRouter(),
  true
  )
}
</script>
<template>
  <div>
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      New Asset History
    </PageHeaderWithBackButton>
    <LoaderComponent v-if="!loaded"/>
    <AnalyticsSearchComponent v-else 
      :resultsLoading="resultsLoading"
      :searchComponent="analyticsSearchObject"
      :show-user-filters="true"
      :show-part-filters="true"
      :show-export="true"
      @displayResults="displayResults"
      @showLoader="showLoader"
      @export="getCSV"
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
