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
  getAssetHistory,
} from '../../plugins/dbCommands/assetManager';
import {
  AssetEvent,
  AssetHistory,
  UserState,
} from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';
import { replaceLinksWithAnchors } from '../../plugins/CommonMethods';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, router, errorHandler } =
  defineProps<Props>();
let asset_tag = ref('');
let history = ref([] as AssetHistory);
let pageSize = 10;
let pageNum = ref(1);
let totalPages = ref(1)
let pageCache = new Map<number, AssetHistory>();
let loading = ref(true)
let totalEvents = ref(0)

// Check if asset in in map and add it if it isn't
function checkAssetAndParts(historyEvent: AssetEvent) {
  return Promise.all([
    Cacher.getAsset(historyEvent.asset_id),
    Promise.all(historyEvent.existing.map(Cacher.getPartInfo)),
    Promise.all(historyEvent.added.map(Cacher.getPartInfo)),
    Promise.all(historyEvent.removed.map(Cacher.getPartInfo)),
  ])
}

onBeforeMount(() => {
  asset_tag.value = router.currentRoute.value.query.nxid as string;
  pageNum.value = router.currentRoute.value.query.pageNum ? parseInt(router.currentRoute.value.query.pageNum as string) : 1
  router.replace({
    query: { nxid: asset_tag.value, pageNum: pageNum.value.toString() },
  });
  loadPage(pageNum.value)
});

async function loadPage(page: number) {
  loading.value = true
  let p = await getPage(page)
  pageNum.value = page
  totalPages.value = p.pages
  history.value = p.events
  loading.value = false
  totalEvents.value = p.total
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
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
      :assets="Cacher.getAssetCache()"
      :parts="Cacher.getPartCache()"
      :user="Cacher.getUser(event.by)"
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
