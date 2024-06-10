<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { getEbayHistory } from '../../plugins/dbCommands/userManager';
import EbaySaleHistoryComponent from '../../components/PartComponents/EbaySaleHistoryComponent.vue';
import {
  AnalyticsSearchPage,
  UserState,
EbaySaleEvent,
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
let ebayEvents = ref([] as EbaySaleEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<EbaySaleEvent>;


onBeforeMount(async ()=>{
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<AnalyticsSearchPage>((res)=>{
        getEbayHistory(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err)=>{
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

async function displayResults(page: EbaySaleEvent[])
{
  // Load all the required info into the caches
  for(let e of page) {
    // Evil ass promise code
    await Promise.all(e.parts.map((p)=>{
      return Cacher.getPartInfo(p)
    }))
    e.assets = await Promise.all(e.assets.map(async(a)=>{
      a.parts = await Promise.all(a.parts.map((p: any)=>{
        if(p.part)
          return p
        else {
          return Cacher.loadCartItem(p)
        }
      }))
      return a
    }))
  }
  ebayEvents.value = page
  resultsLoading.value = false
  setTimeout(()=>document.body.scrollTo({top: 0, behavior: "smooth"}),0)
}

function showLoader() {
  resultsLoading.value = true
}

async function exportCSV() {
  getEbayHistory(http, analyticsSearchObject.getStartDateFromRouter().getTime(), analyticsSearchObject.getEndDateFromRouter().getTime(), 1, 10, async (data, err)=>{
    if(err)
      return
    let arr = data as any[]

    let summary = []
    let partsArr = [] as any[]
    let assetsArr = [] as any[]
    let assetPartsArr = [] as any[]

    for(let e of arr) {
      let user = Cacher.getUser(e.by)
      let by = user.first_name + " " + user.last_name
      let date = (new Date(e.date)).toLocaleString()
      let orderID = e.order
  
      let parts = 0
      let assetParts = 0
      let assets = 0

      e.parts.map((p: any)=>{
        parts += p.quantity ? p.quantity : 1
        partsArr.push({orderID, by, date, nxid: p.nxid, serial: p.serial ? p.serial : " ", quantity: p.quantity ? p.quantity : 1})
      })
      e.assets.map((a: any)=>{
        assets += 1
        assetsArr.push({orderID, by, date, asset_tag: a.asset_tag})
        a.parts.map((p: any)=>{
          assetParts += p.quantity ? p.quantity : 1
          partsArr.push({orderID, by, date, asset_tag: a.asset_tag, nxid: p.nxid, serial: p.serial ? p.serial : " ", quantity: p.quantity ? p.quantity : 1})
        })
      })
      summary.push({by, date, orderID, parts, assets, assetParts})
    }
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Summary_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(summary))
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Parts_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(partsArr))
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Assets_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(assetsArr))
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"AssetParts_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(assetPartsArr))
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
      Ebay Sales History
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
      <EbaySaleHistoryComponent
        v-for="order of ebayEvents"
        :order="order"
        :user="Cacher.getUser(order.by)!"
        :parts="Cacher.getPartCache()"
      />
      
    </AnalyticsSearchComponent>
  </div>
</template>
