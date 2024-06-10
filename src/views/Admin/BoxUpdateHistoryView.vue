<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { getBoxUpdates } from '../../plugins/dbCommands/userManager';
import {
  AnalyticsSearchPage,
  BoxEvent,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import Cacher from '../../plugins/Cacher';
import BoxEventComponent from '../../components/BoxComponents/BoxEventComponent.vue';
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
let boxEvents = ref([] as BoxEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<BoxEvent>;


onBeforeMount(async ()=>{
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts, assetFilters, palletFilters, boxFilters)=>{
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
        boxFilters
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
    let nxids = e.addedParts.map((v)=>v.nxid).filter((v,i,arr)=>arr.indexOf(v)==i)
    nxids = nxids.concat(e.removedParts.map((v)=>v.nxid).filter((v,i,arr)=>arr.indexOf(v)==i))
    nxids = nxids.concat(e.existingParts.map((v)=>v.nxid).filter((v,i,arr)=>arr.indexOf(v)==i))
    // Evil ass promise code
    await Promise.all(nxids.map((p)=>{
        return Cacher.getPartInfo(p)
    }))
    await Cacher.getBox(e.box_id)
  }
  boxEvents.value = page
  resultsLoading.value = false
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
  setTimeout(()=>document.body.scrollTo({top: 0, behavior: "smooth"}),0)
}

function showLoader() {
  resultsLoading.value = true
}

async function exportCSV() {
  getBoxUpdates(http, analyticsSearchObject.getStartDateFromRouter().getTime(), analyticsSearchObject.getEndDateFromRouter().getTime(), 1, 10, async (data, err) => {
    if(err)
      return
    let arr = data as any[]

    let summary = []
    let parts = [] as any[]

    for(let e of arr) {
      let user = Cacher.getUser(e.by)
      let by = user.first_name + " " + user.last_name
      let date = (new Date(e.date_begin)).toLocaleString()
      let box_tag = (await Cacher.getBox(e.box_id)).box_tag!
      box_tag = box_tag ? box_tag : "UNKNOWN"
      summary.push({by, date, box_tag, info_updated: e.info_updated, existing: e.existingParts.length, added: e.addedParts.length, removed: e.removedParts.length})
      parts = parts.concat(e.addedParts.map((p: any)=>{
        return { date, by, box_tag, nxid: p.nxid, quantity: p.quantity ? p.quantity : 1, serial: p.serial ? p.serial : " ", action: "added" }
      }))
      parts = parts.concat(e.removedParts.map((p: any)=>{
        return { date, by, box_tag, nxid: p.nxid, quantity: p.quantity ? p.quantity : 1, serial: p.serial ? p.serial : " ", action: "removed" }
      }))
    }
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Summary_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(summary))
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Parts_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(parts))
  },
  Array.from(analyticsSearchObject.getUserFilterMapFromRouter().keys()),
  Array.from((await analyticsSearchObject.getPartFilterMapFromRouter()).keys()),
  analyticsSearchObject.getHideOthersFromRouter(),
  Array.from((await analyticsSearchObject.getBoxFilterMapFromRouter()).keys()),
  true
  )
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
      :show-export="true"
      :show-box-filters="true"
      @displayResults="displayResults"
      @showLoader="showLoader"
      @export="exportCSV"
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
