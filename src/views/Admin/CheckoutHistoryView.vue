<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { getCheckoutHistory } from '../../plugins/dbCommands/userManager';
import {
  CheckOutEvent,
  AnalyticsSearchPage,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import CheckoutHistoryComponent from '../../components/KioskComponents/CheckoutHistoryComponent.vue';
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
let checkoutEvents = ref([] as CheckOutEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<CheckOutEvent>;


onBeforeMount(async ()=>{
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<AnalyticsSearchPage>((res)=>{
        getCheckoutHistory(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err)=>{
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

async function displayResults(page: CheckOutEvent[])
{
  // Load all the required info into the caches
  for(let e of page) {
    // Evil ass promise code
    await Promise.all(e.parts.map((p)=>{
      return Cacher.getPartInfo(p)
    }))
  }
  checkoutEvents.value = page
  resultsLoading.value = false
  setTimeout(()=>document.body.scrollTo({top: 0, behavior: "smooth"}),0)
}

function showLoader() {
  resultsLoading.value = true
}

async function exportCSV() {
  getCheckoutHistory(http, analyticsSearchObject.getStartDateFromRouter().getTime(), analyticsSearchObject.getEndDateFromRouter().getTime(), 1, 10, async (data, err)=>{
    if(err)
      return
    let arr = data as any[]

    let summary = []
    let parts = [] as any[]

    for(let e of arr) {
      let user = Cacher.getUser(e.by)
      let by = user.first_name + " " + user.last_name
      let date = (new Date(e.date)).toLocaleString()
      let location = e.location

      let quantity = 0

      e.parts.map((p: any)=>{
        quantity += p.quantity ? p.quantity : 1
      })
      summary.push({by, location, date, quantity})
      parts = parts.concat(e.parts.map((p: any)=>{
        return { date, by, location, nxid: p.nxid, quantity: p.quantity ? p.quantity : 1, serial: p.serial ? p.serial : " ", action: p.approved ? 'approved' : 'denied' }
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
      Check Out History
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
      @export="exportCSV"
    >
      <CheckoutHistoryComponent
        v-for="checkout of checkoutEvents"
        :checkout="checkout"
        :user="Cacher.getUser(checkout.by)!"
        :parts="Cacher.getPartCache()"
      />
      
    </AnalyticsSearchComponent>
  </div>
</template>
