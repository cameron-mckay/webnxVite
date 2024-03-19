<script setup lang="ts">
import QRCodeScannerPopupComponent from '../QRCodeScannerPopupComponent.vue';
import QRCodeButton from '../Buttons/QRCodeButton.vue';
import SearchNavButtons from './SearchNavButtons.vue';
import SearchFooterComponent from './SearchFooterComponent.vue';
import TextSearch from '../../../plugins/TextSearchClass';
import LoaderComponent from '../LoaderComponent.vue';
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import { isMobile } from '../../../plugins/CommonMethods';
// Props interface
interface Props {
  searchObject: TextSearch<any>
  hideQR?: boolean
}

let {
  searchObject,
  hideQR
} = defineProps<Props>();

let pageNumRef = ref(1)
let searchText = ref("")
let showQR = ref(false)
let totalPages = ref(1)
let loading = ref(false)
let emit = defineEmits(['showLoader', 'displayResults'])
let windowWidth = ref(window.innerWidth)
let numCols = ref(1)
let buttonPressed = false
let showHeader = ref(false)
let id = Math.random()

onBeforeMount(()=>{
  pageNumRef.value = searchObject.getPageNumFromRouter()
  searchObject.registerLoadPageCallback(advancedSearchCallback)
  if(searchObject.isSearchAdvanced()) {
    let temp = searchObject.getAdvancedSearchObjectFromRouter()
    searchObject.newAdvancedSearch(3, pageNumRef.value, temp)
    return
  }
  searchText.value = searchObject.getSearchTextFromRouter()
  loadPage(pageNumRef.value)
})

onMounted(()=>{
  // Focus the search box on load
  if(!isMobile())
    document.getElementById("searchBox")?.focus()
  // Add handle resize functin to resize event
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  windowWidth.value = window.innerWidth
  // Select the header div
  let el = document.getElementById('header'+id)
  // If there are no children, return
  if(!el||!el.children)
    return
  let {children} = el
  // Set start var
  let cols = 0
  // Loop through children and count if not hidden
  for (let i = 0; i < children.length; i ++) {
    if(!isHidden(children[i]))
      cols++
  }
  if(searchObject.getNumPages()<2)
    cols++
  // If there grid headers, update numCols
  if(cols>1)
    numCols.value = cols
  let noResults = document.getElementById("noResults")
  showHeader.value = noResults ? false : true
}

// Returns true is an html element is hidden
function isHidden(el: any) {
    var style = window.getComputedStyle(el);
    return (style.display === 'none')
}

function toggleQR() {
  showQR.value = !showQR.value
}

function decodedQR(nxid: string) {
  showQR.value = false;
  searchText.value = nxid;
  search();
}

function search() {
  buttonPressed = true
  loadPage(1)
}

function advancedSearchCallback(pageNum: number) {
  loadPage(pageNum)
}

// Called whenever next, prev, or jumper is used
async function loadPage(pageNum: number) {
  // Display loading
  loading.value = true
  // Set page num
  pageNumRef.value = pageNum
  // Load page from search helper
  let page = []
  // If search was advanced
  if(searchObject.wasLastSearchAdvanced()&&!buttonPressed) {
    searchText.value = ""
    page = await searchObject.loadPageAdvanced(3, pageNum, searchObject.getLastAdvancedSearchObject())
  }
  else {
    buttonPressed = false
    // Load text search page
    page = await searchObject.loadPage(3, pageNum, searchText.value)
  }
  totalPages.value = searchObject.getNumPages()
  // CALL TO PARENT HERE
  emit("displayResults", page)
  loading.value = false
}

watch(loading, () => {
  // This doesn't work??
  // handleResize()
  // But this does??
  setTimeout(handleResize,0)
})

</script>
<template>
  <div>
    <form class="flex justify-between" @submit.prevent="search">
      <input
        id="searchBox"
        class="search ml-0"
        type="text"
        v-model="searchText"
        placeholder="🔍 keywords..."
      />
      <QRCodeButton
        v-if="hideQR!=true"
        @click="toggleQR" 
        :title="'Open QR scanner'"
      />
      <QRCodeScannerPopupComponent
        v-if="showQR"
        @toggle="toggleQR"
        @decoded="decodedQR"
      />
      <slot name="searchIcons">
      </slot>
      <input class="search-button mr-0" type="submit" value="Search" />
    </form>
    <div>
      <div
        :id="'header'+id"
        class="mt-1 relative grid py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 [&>p]:mt-auto"
        :style="{ 'grid-template-columns': 'repeat(' + numCols + ', minmax(0, 1fr))'}"
      >
        <slot name="searchHeader" v-if="!loading&&showHeader">

        </slot>
        <SearchNavButtons
          v-if="!loading"
          :num-pages="totalPages"
          :page-num="pageNumRef"
          @load-page="loadPage"
        />
      </div>
      <div class="md:animate-bottom">
        <LoaderComponent v-if="loading"/>
        <slot name="searchResults" v-else>
          <p id="noResults">No results...</p>
        </slot>
      </div>
      <SearchFooterComponent
        :num-pages="totalPages"
        :page-num="pageNumRef"
        @load-page="loadPage"
        v-if="!loading"
      />
    </div>
  </div>
</template>
