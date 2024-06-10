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
let palletEvents = ref([] as PalletEvent[])

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<PalletEvent>;


onBeforeMount(async ()=>{
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts, assetFilters, palletFilters, boxFilters)=>{
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
        palletFilters,
        assetFilters,
        boxFilters
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
  setTimeout(()=>document.body.scrollTo({top: 0, behavior: "smooth"}),0)
}

function showLoader() {
  resultsLoading.value = true
}

async function exportCSV() {
  getPalletUpdates(http, analyticsSearchObject.getStartDateFromRouter().getTime(), analyticsSearchObject.getEndDateFromRouter().getTime(), 1, 10, async (data, err) => {
    if(err)
      return
    let arr = data as any[]

    let summary = []
    let parts = [] as any[]
    let assets = [] as any[]
    let boxes = [] as any[]

    for(let e of arr) {
      let user = Cacher.getUser(e.by)
      let by = user.first_name + " " + user.last_name
      let date = (new Date(e.date_begin)).toLocaleString()
      let pallet_tag = (await Cacher.getPallet(e.pallet_id)).pallet_tag!
      pallet_tag = pallet_tag ? pallet_tag : "UNKNOWN"
      summary.push({
        by,
        date,
        pallet_tag,
        info_updated: e.info_updated,
        existingParts: e.existingParts.length,
        addedParts: e.addedParts.length,
        removedParts: e.removedParts.length,
        existingAssets: e.existingAssets.length,
        addedAssets: e.addedAssets.length,
        removedAssets: e.removedAssets.length,
        existingBoxes: e.existingBoxes.length,
        addedBoxes: e.addedBoxes.length,
        removedBoxes: e.removedBoxes.length,
      })
      parts = parts.concat(e.addedParts.map((p: any)=>{
        return { date, by, pallet_tag, nxid: p.nxid, quantity: p.quantity ? p.quantity : 1, serial: p.serial ? p.serial : " ", action: "added" }
      }))
      parts = parts.concat(e.removedParts.map((p: any)=>{
        return { date, by, pallet_tag, nxid: p.nxid, quantity: p.quantity ? p.quantity : 1, serial: p.serial ? p.serial : " ", action: "removed" }
      }))
      assets = assets.concat(await Promise.all(e.addedAssets.map(async (a: any)=>{
        let asset_tag = (await Cacher.getAsset(a)).asset_tag
        return { date, by, pallet_tag, asset_tag, action: "added" }
      })))
      assets = assets.concat(await Promise.all(e.removedAssets.map(async (a: any)=>{
        let asset_tag = (await Cacher.getAsset(a)).asset_tag
        return { date, by, pallet_tag, asset_tag, action: "removed" }
      })))
      boxes = boxes.concat(await Promise.all(e.addedBoxes.map(async (a: any)=>{
        let box_tag = (await Cacher.getBox(a)).box_tag
        return { date, by, pallet_tag, box_tag, action: "added" }
      })))
      boxes = boxes.concat(await Promise.all(e.removedBoxes.map(async (a: any)=>{
        let box_tag = (await Cacher.getBox(a)).box_tag
        return { date, by, pallet_tag, box_tag, action: "removed" }
      })))
    }
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Summary_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(summary))
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Parts_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(parts))
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Assets_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(assets))
    downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Boxes_"+analyticsSearchObject.getStartDateFromRouter().toLocaleDateString().replaceAll('/','-')+"_to_"+analyticsSearchObject.getEndDateFromRouter().toLocaleDateString().replaceAll('/','-'), arrayToCSV(boxes))
  },
  Array.from(analyticsSearchObject.getUserFilterMapFromRouter().keys()),
  Array.from((await analyticsSearchObject.getPartFilterMapFromRouter()).keys()),
  analyticsSearchObject.getHideOthersFromRouter(),
  Array.from((await analyticsSearchObject.getPalletFilterMapFromRouter()).keys()),
  Array.from((await analyticsSearchObject.getAssetFilterMapFromRouter()).keys()),
  Array.from((await analyticsSearchObject.getBoxFilterMapFromRouter()).keys()),
  true
  )
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
      :show-pallet-filters="true"
      :show-export="true"
      @displayResults="displayResults"
      @showLoader="showLoader"
      @export="exportCSV"
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
