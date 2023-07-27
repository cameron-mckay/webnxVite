<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import CheckinHistoryComponent from '../../components/KioskComponents/CheckinHistoryComponent.vue';
import LeftCaretButton from '../../components/GenericComponents/LeftCaretButton.vue'
import RightCaretButton from '../../components/GenericComponents/RightCaretButton.vue'
import BackButton from '../../components/GenericComponents/BackButton.vue';
import RefreshButton from '../../components/GenericComponents/RefreshButton.vue';
import { dateToHTML, getTodaysDate, HTMLtoEpoch } from '../../plugins/dateFunctions';
import type {
UserState,
CheckInRequest,
User,
PartSchema,
CheckInEvent
} from '../../plugins/interfaces';
import { getPartByID } from '../../plugins/dbCommands/partManager';
import { getUserByID, getUserCheckins } from '../../plugins/dbCommands/userManager';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let loading = ref(false)
let checkInQueue = ref([] as CheckInEvent[])
let kiosks = ref([] as User[])
let user = {} as User
let partsMap = new Map<string, PartSchema>()
let totalPages = ref(0)
let pageNum = ref(1)
// Strips the time from todays date for easier conversions
let lastWeeks = new Date((new Date()).toLocaleDateString())
// Convert into html string
let startDate = ref(dateToHTML(getTodaysDate()))
let endDate = ref(dateToHTML(getTodaysDate()))
let pageCache = new Map<number, CheckInEvent[]>()
let totalCheckouts = ref(0)
let pageSize = 10

onBeforeMount(()=>{
  startDate = ref(dateToHTML(new Date(parseInt(router.currentRoute.value.query.startDate as string))))
  endDate = ref(dateToHTML(new Date(parseInt(router.currentRoute.value.query.endDate as string))))
  getUserByID(http, router.currentRoute.value.query.user as string, (data, err)=>{
    if(err) {
      return errorHandler("Could not load users.")
    }
    // Temporary array
    user = data as User
    // Push check in queue to ref
    loadHistory()
  })
})

function loadHistory() {
  pageCache = new Map<number, CheckInEvent[]>()
  pageNum.value = 1
  loadPage(1)
  // Get all users
}

function loadPage(num: number) {
  loading.value = true
  checkInQueue.value = []
  getPage(num).then((req)=>{
    checkInQueue.value = req.checkins
    totalCheckouts.value = req.total
    totalPages.value = req.pages
    totalCheckouts.value = req.total
    checkCache()
    loading.value = false
  })
}

function getPage(page: number) {
  return new Promise<{total: number, pages: number, checkins: CheckInEvent[]}>(async (res)=>{
    // Check if page is in cache
    if(pageCache.has(page))
      return res({total: totalCheckouts.value, pages: totalPages.value, checkins: pageCache.get(page)!})
    getUserCheckins(http, user._id!, HTMLtoEpoch(startDate.value), HTMLtoEpoch(endDate.value), page, pageSize, async (data, err)=>{
      if(err) {
        return errorHandler("Failed to fetch queue.")
      }
      // Load all users now.
      let response = data as {total: number, pages: number, checkins: CheckInEvent[]}
      let history = response.checkins
      // Get all parts and map
      // Evil promise code
      if(history.length&&history.length>0)
        await Promise.all(history.map((r)=>{
          return Promise.all(r.parts.map((p)=>{
            return new Promise((res)=>{
              if(partsMap.has(p.nxid))
                return res("")
              partsMap.set(p.nxid, {})
              getPartByID(http, p.nxid, 3, (data, err) => {
                if(err)
                  partsMap.delete(p.nxid)
                partsMap.set(p.nxid, data as PartSchema)
                res("")
              })
            })
          }))
        }))
      pageCache.set(page, history)
      response.pages = response.total%pageSize>0 ? Math.trunc(response.total/pageSize) + 1 : Math.trunc(response.total/pageSize)
      res(response)
      // Get all users
    })
  })
}

function prevPage() {
  // Check current page num
  if (pageNum.value > 1) {
    // Decrement
    pageNum.value -= 1;
    loadPage(pageNum.value)
  }
}

// Next search page
function nextPage() {
  // Check if results have multiple pages
  if (pageNum.value<totalPages.value) {
    // Increment page num
    pageNum.value += 1;
    loadPage(pageNum.value)
    // Send search query
  }
}

function goTo(num: number) {
  if(num>0&&num<=totalPages.value) {
    pageNum.value = num
    loadPage(pageNum.value)
  }
}

async function checkCache() {
  let page = pageNum.value;
  while (page > 0 && page >= pageNum.value - 5) {
    let localPage = page;
    if (pageCache.has(localPage)) {
      page -= 1;
      continue;
    } else {
      getPage(localPage)
        .then((res) => {
          pageCache.set(localPage, res.checkins);
        })
        .catch((err) => {
          pageCache.delete(localPage);
        });
      page -= 1;
    }
  }
  page = pageNum.value;
  while (page <= pageNum.value + 5) {
    let localPage = page;
    if (pageCache.has(localPage)) {
      page++;
      continue;
    } else {
      getPage(localPage)
        .then((res) => {
          pageCache.set(localPage, res.checkins);
        })
        .catch((err) => {
          pageCache.delete(localPage);
        });
      page++;
    }
  }
}
</script>
<template>
  <div>
    <BackButton @click="router.back()" class="mr-2 mb-2"/>
    <div>
      <h1 class="my-auto text-4xl">{{ user.first_name?(user.first_name + " " + user.last_name + "'s"):"" }} Check In History</h1>
      <div class="flex justify-between my-2">
        <form @submit.prevent="loadHistory" class="flex flex-wrap">
          <div>
            <label>Start Date: </label>
            <input class="textbox w-auto mr-4" type="date" v-model="startDate" :max="endDate"/>
          </div>
          <div>
            <label>End Date: </label>
            <input class="textbox w-auto mr-4" type="date" v-model="endDate" :min="startDate" :max="dateToHTML(getTodaysDate())"/>
          </div>
          <input class="search-button mr-0" type="submit" value="Go" />
        </form>
        <div
          v-if="totalPages > 1 && !loading"
          class="float-right flex select-none"
        >
          <p class="my-auto mr-3 inline-block leading-6">{{ `Page: ${pageNum}` }}</p>
          <LeftCaretButton 
            v-on:click="prevPage"
            v-if="pageNum > 1"
          />
          <div v-else class="button-icon opacity-0"></div>
          <!-- Right Caret -->
          <RightCaretButton
            v-if="pageNum<totalPages"
            v-on:click="nextPage"
          />
          <div v-else class="button-icon mr-0 opacity-0"></div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="my-4 flex justify-center">
      <div class="loader text-center"></div>
    </div>
    <CheckinHistoryComponent v-for="checkin of checkInQueue" :event="checkin" :kiosks="kiosks" :user="user" :parts="partsMap"/>
    <p class="mt-4" v-if="checkInQueue.length<1&&!loading">No results found...</p>
    <div
      v-if="totalPages > 1 && !loading"
      class="float-right select-none"
    >
      <div class="flex justify-end">
        <p class="my-auto inline-block mr-2">{{ `Page: ${pageNum}` }}</p>
        <div class="flex shrink-0">
          <LeftCaretButton 
            v-on:click="prevPage"
            v-if="pageNum > 1"
          />
          <div v-else class="button-icon opacity-0"></div>
          <!-- Right Caret -->
          <RightCaretButton
            v-if="pageNum<totalPages"
            v-on:click="nextPage"
          />
          <div v-else class="button-icon mr-0 opacity-0"></div>
        </div>
      </div>
      <div class="float-right">
      <a class="mx-1" id="link" @click="goTo(1)" v-if="pageNum>2">1</a>
        <a class="mx-1" v-if="pageNum>2">...</a>
      <a class="mx-1" id="link" v-for="n in ((totalPages-(pageNum+1))>5)?5:(totalPages-pageNum-2>=0?totalPages-pageNum-2:0)" @click="n+pageNum+1<totalPages?goTo(n+pageNum+1):()=>{}">{{ n+pageNum+1 }}</a>
        <a class="mx-1" v-if="(totalPages-pageNum)>7">...</a>
        <a class="mx-1" id="link" @click="goTo(totalPages)">{{ totalPages}}</a>
      </div>
    </div>
  </div>
</template>
