<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetEventComponent from '../../components/AssetComponents/AssetEventComponent.vue';
import SearchNavButtons from '../../components/GenericComponents/Search/SearchNavButtons.vue';
import SearchFooterComponent from '../../components/GenericComponents/Search/SearchFooterComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import {
  getAssetByID,
  getAssetHistory,
} from '../../plugins/dbCommands/assetManager';
import { getPartByID } from '../../plugins/dbCommands/partManager';
import { getAllUsers } from '../../plugins/dbCommands/userManager';
import {
  AssetEvent,
  AssetHistory,
  AssetSchema,
  CartItem,
  PartSchema,
  User,
  UserState,
} from '../../plugins/interfaces';

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

// Check if part is in map and add it if it isn't
function checkPart(part: CartItem) {
  return new Promise<string>((res, rej)=>{
    // Check if part is already mapped
    if (parts.value.has(part.nxid))
      return res("")
    // Set temp value
    parts.value.set(part.nxid, {});
    // Fetch part from API
    getPartByID(http, part.nxid, 3, (data, err) => {
      if (err) {
        parts.value.delete(part.nxid);
        rej("")
        return;
      }
      // Set new value
      parts.value.set(part.nxid, data as PartSchema);
      res("")
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
    // Push check in queue to ref
    loadPage(pageNum.value)
  })
  asset_tag.value = router.currentRoute.value.query.nxid as string;
  pageNum.value = router.currentRoute.value.query.pageNum ? parseInt(router.currentRoute.value.query.pageNum as string) : 1
  router.replace({
    query: { nxid: asset_tag.value, pageNum: pageNum.value.toString() },
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
  checkCache()
}

function getPage(page: number) {
  return new Promise<{ total: number, pages: number, events: AssetHistory}>((res, rej)=>{
    if(pageCache.has(page))
      return res({total: totalEvents.value, pages: totalPages.value, events: pageCache.get(page)!})
    getAssetHistory(http, asset_tag.value, page, pageSize, async (data, err) => {
      if(err)
        return rej([])
      let p = data as { total: number, pages: number, events: AssetHistory}
      await Promise.all(p.events.map(checkAssetAndParts));
      pageCache.set(page, p.events)
      res(p)
    })
  })
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
    <div class="mb-4 flex justify-between">
      <PageHeaderWithBackButton :router="router" :prevPath="'/assets'">
        Asset History
      </PageHeaderWithBackButton>
      <SearchNavButtons
        :num-pages="totalPages"
        :page-num="pageNum"
        @loadPage="loadPage"
      />
    </div>
    <LoaderComponent v-if="loading"/>
    <AssetEventComponent
      v-else
      :assets="assets"
      :user="users.get(event.by)!"
      :parts="parts"
      :event="event"
      v-for="event in history"
    />
    <SearchFooterComponent
      :num-pages="totalPages"
      :page-num="pageNum"
      @loadPage="loadPage"
    />
  </div>
</template>
