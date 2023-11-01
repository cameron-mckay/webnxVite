<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import { getCheckoutHistory } from '../../plugins/dbCommands/userManager';
import {
  CheckOutEvent,
  Page,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import CheckoutHistoryComponent from '../../components/KioskComponents/CheckoutHistoryComponent.vue';

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
  analyticsSearchObject = await AnalyticsSearch.createAnalyticsSearch(http, router, 
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts)=>{
      return new Promise<Page>((res)=>{
        getCheckoutHistory(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err)=>{
          if(err) {
            return res({total: 0, pages: 0, events: []})
          }
          // Load all users now.
          let p = data as Page
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
  console.log(page)
  // Load all the required info into the caches
  for(let e of page) {
    // Evil ass promise code
    await Promise.all(e.parts.map((p)=>{
      return analyticsSearchObject.getPartInfo(p)
    }))
  }
  checkoutEvents.value = page
  resultsLoading.value = false
}

function showLoader() {
  resultsLoading.value = true
}

</script>
<template>
  <div>
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      Check In History
    </PageHeaderWithBackButton>
    <div v-if="!loaded" class="my-4 flex justify-center">
      <div class="loader text-center"></div>
    </div>
    <AnalyticsSearchComponent v-else 
      :resultsLoading="resultsLoading"
      :searchComponent="analyticsSearchObject"
      :show-user-filters="true"
      :show-part-filters="true"
      @displayResults="displayResults"
      @showLoader="showLoader"
    >
      <CheckoutHistoryComponent
        v-for="checkout of checkoutEvents"
        :checkout="checkout"
        :user="analyticsSearchObject.getUser(checkout.by)!"
        :parts="analyticsSearchObject.partsCache"
      />
      
    </AnalyticsSearchComponent>
  </div>
</template>
