<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { PartSchema, User } from '../../../plugins/interfaces';
import DateRangeComponent from '../DateRangeComponent.vue';
import SearchNavButtons from './SearchNavButtons.vue';
import SearchFooterComponent from './SearchFooterComponent.vue';
import LoaderComponent from '../LoaderComponent.vue';
import AnalyticsSearch from '../../../plugins/AnalyticsSearchClass';
import UserFilterComponent from '../../AdminComponents/UserFilterComponent.vue';
import PartFilterComponent from '../../PartComponents/PartFilterComponent.vue';
import FilterTag from '../FilterTag.vue';

// Erm... Im gonna need an analytics search helper
interface Props {
  resultsLoading: boolean;
  searchComponent: AnalyticsSearch<any>
  showUserFilters?: boolean
  showPartFilters?: boolean
}
// Deref the search helper
let { searchComponent, resultsLoading, showUserFilters, showPartFilters } = defineProps<Props>()
// Filter maps
let userFilterMap = ref(new Map<string, User>())
let partFilterMap = ref(new Map<string, PartSchema>())
let userFilterArray = [] as string[]
let partFilterArray = [] as string[]
// Cache the dates inbetween searches
let startDateCache = new Date()
let endDateCache = new Date()
// Show other parts?
let hideOtherPartsRef = ref(false)
let hideOtherPartsCache = false
// I write too many comments bruh..
let pageNumRef = ref(1)
let numPages = ref(1)

let emit = defineEmits(['showLoader', 'displayResults'])

// After component mount - load necessary variables
onBeforeMount(async ()=>{
  // Load filters from serch helper
  partFilterMap.value = await searchComponent.getPartFilterMapFromRouter()
  userFilterMap.value = searchComponent.getUserFilterMapFromRouter()
  // Update filters
  partFilterArray = Array.from(partFilterMap.value.keys())
  userFilterArray = Array.from(userFilterMap.value.keys())
  // Load dates from search helper
  startDateCache = searchComponent.getStartDateFromRouter()
  endDateCache = searchComponent.getEndDateFromRouter()
  console.log(startDateCache.getTime())
  pageNumRef.value = searchComponent.getPageNumFromRouter()
  loadPage(pageNumRef.value)
})

// Called when the go button is pressed on the date range component
function updateDates(startDate: Date, endDate: Date) {
  // Update local dates
  startDateCache = startDate
  endDateCache = endDate
  hideOtherPartsCache = hideOtherPartsRef.value
  // Update filters
  partFilterArray = Array.from(partFilterMap.value.keys())
  userFilterArray = Array.from(userFilterMap.value.keys())
  // Load the first page
  loadPage(1)
}

// Called whenever next, prev, or jumper is used
async function loadPage(pageNum: number) {
  // Display loading
  emit('showLoader')
  // Set page num
  pageNumRef.value = pageNum
  // Load page from search helper
  let page = await searchComponent.loadPage(pageNum, startDateCache, endDateCache, userFilterArray, partFilterArray, hideOtherPartsCache)
  numPages.value = searchComponent.getNumPages()
  // CALL TO PARENT HERE
  console.log(page)
  emit("displayResults", page)
}
</script>
<template>
  <div>
    <!-- Search header -->
    <div>
      <div class="flex justify-between my-2">
        <!-- Date range component -->
        <DateRangeComponent :startDate="startDateCache" :endDate="endDateCache" @search="updateDates">
          <PartFilterComponent v-if="showPartFilters" :http="searchComponent.getHttp()" :filterMap="partFilterMap"/>
          <UserFilterComponent v-if="showUserFilters" :users="searchComponent.getAllUserMap()" :filterMap="userFilterMap" :errorHandler="()=>{}" :showMessage="()=>{}"/>
        </DateRangeComponent>
        <!-- Navigation buttons -->
        <SearchNavButtons :numPages="numPages" :pageNum="pageNumRef" @loadPage="loadPage"/>
      </div>
      <!-- User filter tags -->
      <FilterTag class="mt-2" v-for="user of Array.from(userFilterMap.keys())" :name="userFilterMap.has(user) ? userFilterMap.get(user)!.email! : 'ERROR'" @remove="userFilterMap.delete(user)"/>
      <!-- Part Filter tags -->
      <FilterTag v-for="part of Array.from(partFilterMap.keys())" :name="part" @remove="partFilterMap.delete(part)" class="background-and-border mt-2"/>
      <!-- Hide other parts toggle -->
      <div v-if="partFilterMap.size>0" class="mt-4">
        <label>Hide Other Parts: </label>
        <input type="checkbox" v-model="hideOtherPartsRef">
      </div>
    </div>
    <!-- Loading spinner -->
    <LoaderComponent v-if="resultsLoading"/>
    <!-- Search results go here -->
    <slot v-else></slot>
    <!-- Search footer - hidden while loading -->
    <SearchFooterComponent v-if="!resultsLoading" :numPages="numPages" :pageNum="pageNumRef" @loadPage="loadPage"/>
  </div>
</template>
