<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import PalletEventComponent from '../../components/PalletComponents/PalletEventComponent.vue';
import SearchNavButtons from '../../components/GenericComponents/Search/SearchNavButtons.vue';
import SearchFooterComponent from '../../components/GenericComponents/Search/SearchFooterComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import {
  getPalletHistory,
} from '../../plugins/dbCommands/palletManager';
import {
  PalletHistory,
  PalletEvent,
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
let pallet_tag = ref('');
let history = ref([] as PalletHistory);
let pageSize = 10;
let pageNum = ref(1);
let totalPages = ref(1)
let pageCache = new Map<number, PalletHistory>();
let loading = ref(true)
let totalEvents = ref(0)

// Check if asset in in map and add it if it isn't
function checkPallets(historyEvent: PalletEvent) {
  return Promise.all([
    Cacher.getPallet(historyEvent.pallet_id),
    // Map all existing parts
    Promise.all(historyEvent.existingParts.map(Cacher.getPartInfo)),
    // Map all added parts
    Promise.all(historyEvent.addedParts.map(Cacher.getPartInfo)),
    // Map all removed parts
    Promise.all(historyEvent.removedParts.map(Cacher.getPartInfo)),
    // Map all existing assets
    Promise.all(historyEvent.existingAssets.map(Cacher.getAsset)),
    // Map all added assets
    Promise.all(historyEvent.addedAssets.map(Cacher.getAsset)),
    // Map all removed assets
    Promise.all(historyEvent.removedAssets.map(Cacher.getAsset)),
    // Map all existing boxes
    Promise.all(historyEvent.existingBoxes.map(Cacher.getBox)),
    // Map all added boxes
    Promise.all(historyEvent.addedBoxes.map(Cacher.getBox)),
    // Map all removed boxes
    Promise.all(historyEvent.removedBoxes.map(Cacher.getBox)),
  ])
}

onBeforeMount(() => {
  pallet_tag.value = router.currentRoute.value.query.pallet_tag as string;
  pageNum.value = router.currentRoute.value.query.pageNum ? parseInt(router.currentRoute.value.query.pageNum as string) : 1
  router.replace({
    query: { pallet_tag: pallet_tag.value, pageNum: pageNum.value.toString() },
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
  return new Promise<{ total: number, pages: number, events: PalletHistory}>((res, rej)=>{
    if(pageCache.has(page))
      return res({total: totalEvents.value, pages: totalPages.value, events: pageCache.get(page)!})
    getPalletHistory(http, pallet_tag.value, page, pageSize, async (data, err) => {
      if(err)
        return rej([])
      let p = data as { total: number, pages: number, events: PalletHistory}
      await Promise.all(p.events.map(checkPallets));
      pageCache.set(page, p.events)
      res(p)
    })
  })
}

function checkCache() {
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
      <PageHeaderWithBackButton :router="router" :prevPath="'/pallets'">
        Pallet History
      </PageHeaderWithBackButton>
      <SearchNavButtons
        :num-pages="totalPages"
        :page-num="pageNum"
        @loadPage="loadPage"
      />
    </div>
    <LoaderComponent v-if="loading"/>
    <PalletEventComponent
      v-else
      :pallets="Cacher.getPalletCache()"
      :assets="Cacher.getAssetCache()"
      :parts="Cacher.getPartCache()"
      :boxes="Cacher.getBoxCache()"
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
