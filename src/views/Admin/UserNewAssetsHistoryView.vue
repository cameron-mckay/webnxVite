<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetEventComponent from '../../components/AssetComponents/AssetEventComponent.vue';
import BackButton from '../../components/GenericComponents/BackButton.vue';
import LeftCaretButton from '../../components/GenericComponents/LeftCaretButton.vue';
import RightCaretButton from '../../components/GenericComponents/RightCaretButton.vue';
import {
  getAssetByID,
  getAssetHistory,
} from '../../plugins/dbCommands/assetManager';
import { getPartByID } from '../../plugins/dbCommands/partManager';
import { getAllUsers, getUserNewAssets } from '../../plugins/dbCommands/userManager';
import {
  AssetEvent,
  AssetHistory,
  AssetSchema,
  CartItem,
  PartSchema,
  User,
  UserState,
} from '../../plugins/interfaces';
import { dateToHTML, getTodaysDate, HTMLToDate } from '../../plugins/dateFunctions'

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, router, errorHandler } =
  defineProps<Props>();
let assets = ref(new Map<string, AssetSchema>());
let users = new Map<string, User>();
let parts = ref(new Map<string, PartSchema>());
let asset_tag = ref('');
let history = ref([] as AssetHistory);
let pageSize = 10;
let pageNum = ref(1);
let totalPages = ref(1)
let pageCache = new Map<number, AssetHistory>();
let loading = ref(true)
let totalEvents = ref(0)
let startDate = 0
let endDate = 0
let startDateHTML = ref(dateToHTML(getTodaysDate()))
let endDateHTML = ref(dateToHTML(getTodaysDate()))
let user_id = ""
let user = {} as User
// Check if part is in map and add it if it isn't
function checkPart(part: CartItem) {
  return new Promise<void>((res, rej)=>{
    // Check if part is already mapped
    if (parts.value.has(part.nxid))
      return res()
    // Set temp value
    parts.value.set(part.nxid, {});
    // Fetch part from API
    getPartByID(http, part.nxid, 3, (data, err) => {
      if (err) {
        parts.value.delete(part.nxid);
        res()
        return;
      }
      // Set new value
      parts.value.set(part.nxid, data as PartSchema);
      res()
    });
  })
}

// Check if asset in in map and add it if it isn't
function checkAssetAndParts(historyEvent: AssetEvent) {
  return new Promise<string>(async (res, rej)=>{
    // Check if asset is already cached
    if (!assets.value.has(historyEvent.asset_id)) {
      // Set temporary value
      assets.value.set(historyEvent.asset_id, {});
      // Get asset from API
      getAssetByID(http, historyEvent.asset_id, async (data, err) => {
        if (err) {
          // Clear value so other threads can try again
          assets.value.delete(historyEvent.asset_id);
          errorHandler(err);
          rej()
          return;
        }
        // Set temp variable for type casting
        let temp = data as AssetSchema;
        // Set new value
        assets.value.set(historyEvent.asset_id, temp);
        // Map all existing parts
        await Promise.all(historyEvent.existing.map(checkPart))
        // Map all added parts
        await Promise.all(historyEvent.added.map(checkPart))
        // Map all removed parts
        await Promise.all(historyEvent.removed.map(checkPart))
        res("")
      });
    }
    else {
      // Map all existing parts
      await Promise.all(historyEvent.existing.map(checkPart))
      // Map all added parts
      await Promise.all(historyEvent.added.map(checkPart))
      // Map all removed parts
      await Promise.all(historyEvent.removed.map(checkPart))
      res("")
    }
  })
}

onBeforeMount(() => {
  startDate = parseInt(router.currentRoute.value.query.startDate as string)
  startDateHTML.value = dateToHTML(new Date(startDate))
  endDate = parseInt(router.currentRoute.value.query.endDate as string)
  endDateHTML.value = dateToHTML(new Date(endDate))
  user_id = router.currentRoute.value.query.user as string
  pageNum.value = router.currentRoute.value.query.pageNum ? parseInt(router.currentRoute.value.query.pageNum as string) : 1
  getAllUsers(http, (data, err) => {
    if(err) {
      return errorHandler("Could not load users.")
    }
    // Temporary array
    let allUsers = data as User[]
    // Process all users
    for (let u of allUsers) {
      // Set user map
      users.set(u._id!, u)
    }
    user = users.get(user_id)!
    // Push check in queue to ref
    loadPage(pageNum.value)
  })
  router.replace({
    query: { pageNum: pageNum.value, startDate, endDate, user: user_id },
  });
});

async function loadPage(page: number) {
  loading.value = true
  let p = await getPage(page)
  pageNum.value = page
  totalPages.value = p.pages
  history.value = p.events
  loading.value = false
  totalEvents.value = p.total
  router.replace({
    query: { pageNum: pageNum.value, startDate, endDate, user: user_id },
  });
  checkCache()
}

function changeDate() {
  startDate = HTMLToDate(startDateHTML.value).getTime()
  endDate = HTMLToDate(endDateHTML.value).getTime()
  pageCache = new Map<number, AssetHistory>()
  pageNum.value = 1
  loadPage(pageNum.value)
}

function getPage(page: number) {
  return new Promise<{ total: number, pages: number, events: AssetHistory}>((res, rej)=>{
    if(pageCache.has(page))
      return res({total: totalEvents.value, pages: totalPages.value, events: pageCache.get(page)!})
    getUserNewAssets(http, user_id, startDate, endDate, page, pageSize, async (data, err) => {
      if(err)
        return rej([])
      let p = data as { total: number, pages: number, events: AssetHistory}
      await Promise.all(p.events.map(checkAssetAndParts));
      pageCache.set(page, p.events)
      res(p)
    })
  })
}

function nextPage() {
  if (pageNum.value < totalPages.value) {
    pageNum.value += 1;
    router.replace({
      query: { nxid: asset_tag.value, pageNum: pageNum.value.toString() },
    });
    loadPage(pageNum.value)
  }
}

function prevPage() {
  if (pageNum.value > 1) {
    pageNum.value -= 1;
    router.replace({
      query: { nxid: asset_tag.value, pageNum: pageNum.value.toString() },
    });
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
          pageCache.set(localPage, res.events);
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
          pageCache.set(localPage, res.events);
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
    <div class="-mb-4 flex justify-between">
      <div>
        <BackButton @click="router.back()" class="mr-2 mb-2"/>
        <h1 class="text-4xl leading-8 md:leading-10 mb-4">{{ user.first_name ? (user.first_name + " " + user.last_name + "'s ") : "" }}New Asset History</h1>
        <form @submit.prevent="changeDate()" class="flex flex-wrap mb-4">
          <div>
            <label>Start Date: </label>
            <input class="textbox w-auto mr-4" type="date" v-model="startDateHTML" :max="endDate"/>
          </div>
          <div>
            <label>End Date: </label>
            <input class="textbox w-auto mr-4" type="date" v-model="endDateHTML" :min="startDate" :max="dateToHTML(getTodaysDate())"/>
          </div>
          <input class="search-button mr-0" type="submit" value="Go" />
        </form>
      </div>
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
    <div v-if="loading" class="my-4 flex justify-center">
      <div class="loader text-center"></div>
    </div>
    <AssetEventComponent
      v-else
      :assets="assets"
      :user="users.get(event.by)!"
      :parts="parts"
      :event="event"
      v-for="event in history"
    />
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
      <a class="mx-1" id="link" @click="loadPage(1)" v-if="pageNum>2">1</a>
        <a class="mx-1" v-if="pageNum>2">...</a>
      <a class="mx-1" id="link" v-for="n in ((totalPages-(pageNum+1))>5)?5:(totalPages-pageNum-2>=0?totalPages-pageNum-2:0)" @click="n+pageNum+1<totalPages?loadPage(n+pageNum+1):()=>{}">{{ n+pageNum+1 }}</a>
        <a class="mx-1" v-if="(totalPages-pageNum)>7">...</a>
        <a class="mx-1" id="link" @click="loadPage(totalPages)">{{ totalPages}}</a>
      </div>
    </div>
  </div>
</template>
