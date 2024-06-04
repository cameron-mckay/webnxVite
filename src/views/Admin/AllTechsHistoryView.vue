<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import AllTechsEventComponent from '../../components/AdminComponents/AllTechsEventComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import PlusButton from '../../components/GenericComponents/Buttons/PlusButton.vue';
import { getAllTechsHistory } from '../../plugins/dbCommands/userManager';
import {
  AllTechsEvent,
  AnalyticsSearchPage,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import Cacher from '../../plugins/Cacher';
import { arrayToCSV, downloadCSV } from '../../plugins/CommonMethods';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

let loaded = ref(false)
let resultsLoading = ref(false)
let allTechsHistory = ref([] as AllTechsEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<AllTechsEvent>;

onBeforeMount(async ()=>{
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<AnalyticsSearchPage>((res)=>{
        getAllTechsHistory(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err)=>{
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

async function displayResults(page: AllTechsEvent[])
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
  }
  allTechsHistory.value = page
  resultsLoading.value = false
  setTimeout(()=>document.body.scrollTo({top: 0, behavior: "smooth"}),0)
}

function showLoader() {
  resultsLoading.value = true
}

async function getCSV() {
  getAllTechsHistory(http, analyticsSearchObject.getStartDateFromRouter().getTime(), analyticsSearchObject.getEndDateFromRouter().getTime(), 1, 10, async (data, err)=>{
    if(err) {
      return
    }
    let arr = data as any[]

    let summary = []
    let parts = [] as any[]

    for(let e of arr) {
      let user = Cacher.getUser(e.by)
      let by = user.first_name + " " + user.last_name
      let date = (new Date(e.date)).toLocaleString()
      summary.push({by, date, existing: e.existing.length, added: e.added.length, removed: e.removed.length})
      parts = parts.concat(e.added.map((p: any)=>{
        return { date, by, nxid: p.nxid, quantity: p.quantity ? p.quantity : 1, serial: p.serial ? p.serial : " ", action: "added" }
      }))
      parts = parts.concat(e.removed.map((p: any)=>{
        return { date, by, nxid: p.nxid, quantity: p.quantity ? p.quantity : 1, serial: p.serial ? p.serial : " ", action: "removed" }
      }))
    }
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Summary_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(summary))
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Parts_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(parts))
  },
  Array.from(analyticsSearchObject.getUserFilterMapFromRouter().keys()),
  Array.from((await analyticsSearchObject.getPartFilterMapFromRouter()).keys()),
  analyticsSearchObject.getHideOthersFromRouter(),
  true)
}

</script>
<template>
  <div>
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      All Techs History
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
      <AllTechsEventComponent v-for="event of allTechsHistory" :event="event" :kiosks="Cacher.getKiosks()" :user="Cacher.getUser(event.by)!" :parts="Cacher.getPartCache()"/>
    </AnalyticsSearchComponent>
  </div>
</template>


