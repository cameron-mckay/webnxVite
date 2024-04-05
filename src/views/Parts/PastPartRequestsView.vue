<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import ReadOnlyPartRequestComponent from '../../components/KioskComponents/ReadOnlyPartRequestComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import type {
UserState,
PartRequestSchema,
AnalyticsSearchPage,
LoadedCartItem,
CartItem,
BuildKitSchema,
} from '../../plugins/interfaces';
import { getBuildKitByID, getFulfilledPartRequests } from '../../plugins/dbCommands/partManager';
import Cacher from '../../plugins/Cacher';
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
let requests = ref([] as PartRequestSchema[])
let buildKits = ref(new Map<string, BuildKitSchema>())

const { http, router, store } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<PartRequestSchema>;
let admin = false

onBeforeMount(()=>{
  admin = store.state.user.roles!.includes('view_analytics')
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<AnalyticsSearchPage>((res)=>{
        getFulfilledPartRequests(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err) => {
          if(err) {
            return res({total: 0, pages: 0, events: []})
          }
          // Load all users now.
          let p = data as AnalyticsSearchPage
          res(p)
        },
        admin ? userFilters : [store.state.user._id!])
      })
    }
  );
  loaded.value = true
})

function loadBuildKit(kit_id: string) {
  return new Promise<BuildKitSchema>((res) => {
    getBuildKitByID(http, kit_id, (data, err) => {
      if(err)
        res({} as BuildKitSchema)
      res(data as BuildKitSchema)
    })
  })
}

async function displayResults(page: PartRequestSchema[])
{
  // Load all the required info into the caches
  for(let r of page) {
    if(r.build_kit_id) {
      let buildKit = await loadBuildKit(r.build_kit_id)
      buildKits.value.set(buildKit._id, buildKit)
      await Promise.all(buildKit.parts!.map((p)=>{
        return Cacher.getPartInfo(p)
      }))
      continue
    }
    await Promise.all(r.parts.map((p)=>{
      return Cacher.getPartInfo(p)
    }))
    await Promise.all((r.fulfilled_list?r.fulfilled_list:[]).map((p)=>{
      return new Promise<{kiosk: string, parts: LoadedCartItem[]}>(async (res)=>{
        let cartItems = [] as CartItem[]
        for(let ie of p.parts) {
          let q = ie.unserialized
          for(let s of ie.serials!) {
            cartItems.push({nxid: ie.nxid!, serial: s})
            q--
          }
          if(q>0)
            cartItems.push({nxid: ie.nxid!, quantity: q})
        }
        let parts = await Cacher.loadCartItems(cartItems)
        res({kiosk: p.kiosk, parts})
      })
    }))
  }
  requests.value = page
  resultsLoading.value = false
}

function showLoader() {
  resultsLoading.value = true
}

</script>
<template>
  <div>
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      Part Request History
    </PageHeaderWithBackButton>
    <LoaderComponent v-if="!loaded"/>
    <AnalyticsSearchComponent v-else 
      :resultsLoading="resultsLoading"
      :searchComponent="analyticsSearchObject"
      :show-user-filters="admin"
      :show-part-filters="false"
      @displayResults="displayResults"
      @showLoader="showLoader"
    >
      <ReadOnlyPartRequestComponent
        v-for="request of requests"
        :key="request.date_created+request.requested_by"
        :request="request"
        :kit="request.build_kit_id ? buildKits.get(request.build_kit_id) : undefined"
      />
    </AnalyticsSearchComponent>
  </div>
</template>
