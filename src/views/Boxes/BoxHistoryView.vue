<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import SearchNavButtons from '../../components/GenericComponents/Search/SearchNavButtons.vue';
import SearchFooterComponent from '../../components/GenericComponents/Search/SearchFooterComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import {
  UserState,
  BoxHistory,
  BoxEvent,
} from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';
import { getBoxHistory } from '../../plugins/dbCommands/boxManager';
import BoxEventComponent from '../../components/BoxComponents/BoxEventComponent.vue';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, router, errorHandler } =
  defineProps<Props>();
let box_tag = ref('');
let history = ref([] as BoxHistory);
let pageSize = 10;
let pageNum = ref(1);
let totalPages = ref(1)
let pageCache = new Map<number, BoxHistory>();
let loading = ref(true)
let totalEvents = ref(0)

// Check if asset in in map and add it if it isn't
function checkBoxes(historyEvent: BoxEvent) {
  return Promise.all([
    Cacher.getBox(historyEvent.box_id),
    // Map all existing parts
    Promise.all(historyEvent.existingParts.map(Cacher.getPartInfo)),
    // Map all added parts
    Promise.all(historyEvent.addedParts.map(Cacher.getPartInfo)),
    // Map all removed parts
    Promise.all(historyEvent.removedParts.map(Cacher.getPartInfo)),
  ])
}

onBeforeMount(() => {
  box_tag.value = router.currentRoute.value.query.box_tag as string;
  pageNum.value = router.currentRoute.value.query.pageNum ? parseInt(router.currentRoute.value.query.pageNum as string) : 1
  router.replace({
    query: { box_tag: box_tag.value, pageNum: pageNum.value.toString() },
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
  checkCache()
}

function getPage(page: number) {
  return new Promise<{ total: number, pages: number, events: BoxHistory}>((res, rej)=>{
    if(pageCache.has(page))
      return res({total: totalEvents.value, pages: totalPages.value, events: pageCache.get(page)!})
    getBoxHistory(http, box_tag.value, page, pageSize, async (data, err) => {
      if(err)
        return rej([])
      let p = data as { total: number, pages: number, events: BoxHistory}
      await Promise.all(p.events.map(checkBoxes));
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
      <PageHeaderWithBackButton :router="router" :prevPath="'/boxes'">
        Box History
      </PageHeaderWithBackButton>
      <SearchNavButtons
        :num-pages="totalPages"
        :page-num="pageNum"
        @loadPage="loadPage"
      />
    </div>
    <LoaderComponent v-if="loading"/>
    <BoxEventComponent
      v-else
      :boxes="Cacher.getBoxCache()"
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
