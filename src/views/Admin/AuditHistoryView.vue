<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AnalyticsSearchComponent from '../../components/GenericComponents/Search/AnalyticsSearchComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue'
import AuditEventComponent from '../../components/KioskComponents/AuditEventComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import {
  AnalyticsSearchPage,
  AuditRecordSchema,
  PartEvent,
  PartSchema,
  User,
  UserState,
} from '../../plugins/interfaces';
import AnalyticsSearch from '../../plugins/AnalyticsSearchClass';
import Cacher from '../../plugins/Cacher';
import { getPartAuditHistory } from '../../plugins/dbCommands/partManager';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

let loaded = ref(false)
let resultsLoading = ref(false)
let auditHistory = ref([] as AuditRecordSchema[])
let allUsers = new Map<string, User>()
let partMap = new Map<string, PartSchema>()

const { http, router } =
  defineProps<Props>();
let analyticsSearchObject:AnalyticsSearch<PartEvent>;


onBeforeMount(async ()=>{
  allUsers = Cacher.getAllUserMap()
  partMap = Cacher.getPartCache()
  analyticsSearchObject = new AnalyticsSearch(
    (pageNum, startDate, endDate, userFilters, partFilters, hideOtherParts, assetFilters)=>{
      return new Promise<AnalyticsSearchPage>((res)=>{
        getPartAuditHistory(http, startDate.getTime(), endDate.getTime(), pageNum, 10, async (data, err) => {
          if(err) {
            return res({total: 0, pages: 0, events: []})
          }
          let p = data as AnalyticsSearchPage
          for(let item of p.events) {
            await Cacher.getPartInfo(item.nxid)
          }
          res(p)
        },
        partFilters,
        userFilters)
      })
    }
  );
  loaded.value = true
})

async function displayResults(page: AuditRecordSchema[])
{
  // Load all the required info into the caches
  auditHistory.value = page as AuditRecordSchema[]
  resultsLoading.value = false
}

function showLoader() {
  resultsLoading.value = true
}

</script>
<template>
  <div>
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      Part Audit History
    </PageHeaderWithBackButton>
    <LoaderComponent v-if="!loaded"/>
    <AnalyticsSearchComponent v-else 
      :resultsLoading="resultsLoading"
      :searchComponent="analyticsSearchObject"
      :show-user-filters="true"
      :show-part-filters="true"
      :hide-hide-part-button="true"
      @displayResults="displayResults"
      @showLoader="showLoader"
    >
    <AuditEventComponent v-for="event of auditHistory" 
      :event="event"
      :user="allUsers.get(event.by)!"
      :part="partMap.get(event.nxid)"
    />
    </AnalyticsSearchComponent>
  </div>
</template>
