<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { AssetSchema, BoxSchema, PalletSchema, PartSchema, User } from '../../../plugins/interfaces';
import DateRangeComponent from '../DateRangeComponent.vue';
import SearchNavButtons from './SearchNavButtons.vue';
import SearchFooterComponent from './SearchFooterComponent.vue';
import LoaderComponent from '../LoaderComponent.vue';
import AnalyticsSearch from '../../../plugins/AnalyticsSearchClass';
import UserFilterComponent from '../../AdminComponents/UserFilterComponent.vue';
import PartFilterComponent from '../../PartComponents/PartFilterComponent.vue';
import AssetFilterComponent from '../../AssetComponents/AssetFilterComponent.vue';
import PalletFilterComponent from '../../PalletComponents/PalletFilterComponent.vue';
import BoxFilterComponent from '../../BoxComponents/BoxFilterComponent.vue';
import FilterTag from '../FilterTag.vue';
import Cacher from '../../../plugins/Cacher';

// Erm... Im gonna need an analytics search helper
interface Props {
  resultsLoading: boolean;
  searchComponent: AnalyticsSearch<any>
  showUserFilters?: boolean
  showPartFilters?: boolean
  showAssetFilters?: boolean
  showPalletFilters?: boolean
  showBoxFilters?: boolean
  hideHidePartButton?: boolean
  showExport?: boolean
}
// Deref the search helper
let { searchComponent, resultsLoading, showUserFilters, showPartFilters, showAssetFilters, hideHidePartButton, showExport } = defineProps<Props>()
// Filter maps
let userFilterMap = ref(new Map<string, User>())
let partFilterMap = ref(new Map<string, PartSchema>())
let assetFilterMap = ref(new Map<string, AssetSchema>())
let palletFilterMap = ref(new Map<string, PalletSchema>())
let boxFilterMap = ref(new Map<string, BoxSchema>())
let userFilterArray = [] as string[]
let partFilterArray = [] as string[]
let assetFilterArray = [] as string[]
let palletFilterArray = [] as string[]
let boxFilterArray = [] as string[]
// Cache the dates inbetween searches
let startDateCache = new Date()
let endDateCache = new Date()
// Show other parts?
let hideOtherPartsRef = ref(false)
let hideOtherPartsCache = false
// I write too many comments bruh..
let pageNumRef = ref(1)
let numPages = ref(1)

let emit = defineEmits(['showLoader', 'displayResults', 'export'])

// After component mount - load necessary variables
onBeforeMount(async ()=>{
  // Load filters from serch helper
  partFilterMap.value = await searchComponent.getPartFilterMapFromRouter()
  userFilterMap.value = searchComponent.getUserFilterMapFromRouter()
  assetFilterMap.value = await searchComponent.getAssetFilterMapFromRouter()
  palletFilterMap.value = await searchComponent.getPalletFilterMapFromRouter()
  boxFilterMap.value = await searchComponent.getBoxFilterMapFromRouter()
  // Update filters
  partFilterArray = Array.from(partFilterMap.value.keys())
  userFilterArray = Array.from(userFilterMap.value.keys())
  assetFilterArray = Array.from(assetFilterMap.value.keys())
  palletFilterArray = Array.from(palletFilterMap.value.keys())
  boxFilterArray = Array.from(boxFilterMap.value.keys())
  // Load dates from search helper
  startDateCache = searchComponent.getStartDateFromRouter()
  endDateCache = searchComponent.getEndDateFromRouter()
  hideOtherPartsRef.value = searchComponent.getHideOthersFromRouter()
  hideOtherPartsCache = hideOtherPartsRef.value
  pageNumRef.value = searchComponent.getPageNumFromRouter()
  loadPage(pageNumRef.value)
})

// Called when the go button is pressed on the date range component
async function updateDates(startDate: Date, endDate: Date) {
  // Update local dates
  startDateCache = startDate
  endDateCache = endDate
  hideOtherPartsCache = hideOtherPartsRef.value
  // Update filters
  partFilterArray = Array.from(partFilterMap.value.keys())
  userFilterArray = Array.from(userFilterMap.value.keys())
  assetFilterArray = Array.from(assetFilterMap.value.keys())
  palletFilterArray = Array.from(palletFilterMap.value.keys())
  boxFilterArray = Array.from(boxFilterMap.value.keys())
  // Load the first page
  await loadPage(1)
}

// Called whenever next, prev, or jumper is used
async function loadPage(pageNum: number) {
  // Display loading
  emit('showLoader')
  // Set page num
  pageNumRef.value = pageNum
  // Load page from search helper
  let page = await searchComponent.loadPage(pageNum, startDateCache, endDateCache, userFilterArray, partFilterArray, hideOtherPartsCache, assetFilterArray, palletFilterArray, boxFilterArray)
  numPages.value = searchComponent.getNumPages()
  // CALL TO PARENT HERE
  emit("displayResults", page)
}

// Called when the go button is pressed on the date range component
async function exportCSV(startDate: Date, endDate: Date) {
  await updateDates(startDate, endDate)
  // Update local dates
  emit('export')
}
</script>
<template>
  <div>
    <!-- Search header -->
    <div>
      <div class="flex justify-between md:mb-2">
        <div class="flex">
        <!-- Date range component -->
        <DateRangeComponent :startDate="startDateCache" :endDate="endDateCache" @search="updateDates" class="flex" :show-export="showExport" @export="exportCSV">
          <PartFilterComponent v-if="showPartFilters" :http="Cacher.getHttp()" :filterMap="partFilterMap" class="mb-auto ml-1"/>
          <UserFilterComponent v-if="showUserFilters" :users="Cacher.getAllUserMap()" :filterMap="userFilterMap" :errorHandler="()=>{}" :showMessage="()=>{}" class="mb-auto ml-1"/>
          <AssetFilterComponent v-if="showAssetFilters" :http="Cacher.getHttp()" :filterMap="assetFilterMap" :errorHandler="()=>{}" :showMessage="()=>{}" class="mb-auto ml-1"/>
          <PalletFilterComponent v-if="showPalletFilters" :http="Cacher.getHttp()" :filterMap="palletFilterMap" :errorHandler="()=>{}" :showMessage="()=>{}" class="mb-auto ml-1"/>
          <BoxFilterComponent v-if="showBoxFilters" :http="Cacher.getHttp()" :filterMap="boxFilterMap" :errorHandler="()=>{}" :showMessage="()=>{}" class="mb-auto ml-1"/>
        </DateRangeComponent>
        </div>
        <!-- Navigation buttons -->
        <SearchNavButtons :numPages="numPages" :pageNum="pageNumRef" @loadPage="loadPage"/>
      </div>
      <!-- User filter tags -->
      <FilterTag class="mt-2" v-for="user of Array.from(userFilterMap.keys())" :name="userFilterMap.has(user) ? userFilterMap.get(user)!.email! : 'ERROR'" @remove="userFilterMap.delete(user)"/>
      <!-- Part Filter tags -->
      <FilterTag v-for="part of Array.from(partFilterMap.keys())" :name="part" @remove="partFilterMap.delete(part)" class="background-and-border mt-2"/>
      <FilterTag v-for="asset of Array.from(assetFilterMap.keys())" :name="asset" @remove="assetFilterMap.delete(asset)" class="background-and-border mt-2"/>
      <FilterTag v-for="pallet of Array.from(palletFilterMap.keys())" :name="pallet" @remove="palletFilterMap.delete(pallet)" class="background-and-border mt-2"/>
      <FilterTag v-for="box of Array.from(boxFilterMap.keys())" :name="box" @remove="boxFilterMap.delete(box)" class="background-and-border mt-2"/>
      <!-- Hide other parts toggle -->
      <div v-if="partFilterMap.size>0&&!hideHidePartButton" class="mt-4">
        <label>Hide Other Parts: </label>
        <input type="checkbox" v-model="hideOtherPartsRef">
      </div>
    </div>
    <!-- Loading spinner -->
    <LoaderComponent v-if="resultsLoading"/>
    <!-- Search results go here -->
    <slot v-else>
      <p>No results...</p>
    </slot>
    <!-- Search footer - hidden while loading -->
    <SearchFooterComponent v-if="!resultsLoading" :numPages="numPages" :pageNum="pageNumRef" @loadPage="loadPage"/>
  </div>
</template>
