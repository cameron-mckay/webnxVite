<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PartOrderComponent from '../../components/PartComponents/PartOrderComponent.vue';
import type {
  UserState,
  PartRequestSchema,
  AnalyticsSearchPage,
  PartOrderSchema,
} from '../../plugins/interfaces';
import { getFulfilledPartOrders } from '../../plugins/dbCommands/partManager';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import { replaceLinksWithAnchors } from '../../plugins/CommonMethods';
import Cacher from '../../plugins/Cacher';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
let loaded = ref(false)
let resultsLoading = ref(false)
let orders = ref([] as PartOrderSchema[])

const { http, router, store } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<PartRequestSchema>;
let admin = false

onBeforeMount(()=>{
  admin = store.state.user.roles!.includes('view_analytics')
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<AnalyticsSearchPage>((res)=>{
        getFulfilledPartOrders(http, startDate.getTime(), endDate.getTime(), pageNum, 10, (data, err)=>{
          if(err) {
            return res({total: 0, pages: 0, events: []})
          }
          // Load all users now.
          let p = data as AnalyticsSearchPage
          res(p)
        },
        userFilters, partFilters)
      })
    }
  );
  loaded.value = true
})

async function displayResults(page: PartOrderSchema[])
{
  // Load all the required info into the caches
  for(let r of page) {
    await Promise.all([
      Promise.all(r.ordered_parts.map((p)=>{
        return Cacher.getPartInfo(p)
      })),
      Promise.all(
      (r.received_parts?r.received_parts:[]).map((p)=>{
        return Promise.all(p.parts.map((v)=>{
          return Cacher.getPartInfo(v)
        }))
      })),
    ])
  }
  orders.value = page
  resultsLoading.value = false
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
}

function showLoader() {
  resultsLoading.value = true
}

</script>
<template>
  <div>
    <PageHeaderWithBackButton :prev-path="'/orders'" :router="router">
      Part Order History
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
      <PartOrderComponent
        v-for="order of orders"
        :key="order.date_created+order.created_by"
        :order="order"
        :part-map="Cacher.getPartCache()"
      />
    </AnalyticsSearchComponent>
  </div>
</template>
