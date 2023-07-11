<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetEventComponent from '../../components/AssetComponents/AssetEventComponent.vue';
import {
  getAssetByID,
  getAssetHistory,
} from '../../plugins/dbCommands/assetManager';
import { getPartByID } from '../../plugins/dbCommands/partManager';
import { getUserByID } from '../../plugins/dbCommands/userManager';
import {
  AssetEvent,
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

interface keyedEvent extends AssetEvent {
  key: number;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
let assets = ref(new Map<string, AssetSchema>());
let users = ref(new Map<string, User>());
let parts = ref(new Map<string, PartSchema>());
let asset_tag = ref('');
let history = ref([] as keyedEvent[]);
let keyNum = 0;
let pageSize = ref(10);
let pageNum = ref(1);

// Check if part is in map and add it if it isn't
async function checkPart(part: CartItem) {
  // Check if part is already mapped
  if (!parts.value.has(part.nxid)) {
    // Set temp value
    parts.value.set(part.nxid, {});
    // Fetch part from API
    getPartByID(http, part.nxid, 3, (data, err) => {
      if (err) {
        parts.value.delete(part.nxid);
        errorHandler(err);
        return;
      }
      // Set new value
      parts.value.set(part.nxid, data as PartSchema);
      // Key swap to force reload components
      keySwap();
    });
  }
}

// Check if asset in in map and add it if it isn't
async function checkForAsset(historyEvent: keyedEvent) {
  // Assign unique key
  historyEvent.key = keyNum;
  // Increment
  keyNum++;
  checkUser(historyEvent.by);
  // Check if asset is already cached
  if (!assets.value.has(historyEvent.asset_id)) {
    // Set temporary value
    assets.value.set(historyEvent.asset_id, {});
    // Get asset from API
    getAssetByID(http, historyEvent.asset_id, (data, err) => {
      if (err) {
        // Clear value so other threads can try again
        assets.value.delete(historyEvent.asset_id);
        errorHandler(err);
        return;
      }
      // Set temp variable for type casting
      let temp = data as AssetSchema;
      // Set new value
      assets.value.set(historyEvent.asset_id, temp);
      // Key switch
      historyEvent.key += 1000;
      // Check for user on "By" attribute
      checkUser(temp.by!);
    });
  }
  // Map all existing parts
  historyEvent.existing.map(checkPart);
  // Map all added parts
  historyEvent.added.map(checkPart);
  // Map all removed parts
  historyEvent.removed.map(checkPart);
}

// Check if user is in map and add if it isn't
function checkUser(by: string) {
  // Check if user is already mapped
  if (!users.value.has(by)) {
    // Set temporary value to prevent other threads from
    // working on the same thing
    users.value.set(by, {});
    // Fetch the user
    getUserByID(http, by, (data, err) => {
      // Handle the error
      if (err) {
        // Clear value so other threads can try again
        users.value.delete(by);
        errorHandler(err);
        return;
      }
      // Set the user to API response
      users.value.set(by, data as User);
      // Key swap to reload components
      keySwap();
    });
  }
}

onBeforeMount(() => {
  if (router.currentRoute.value.query.nxid) {
    asset_tag.value = router.currentRoute.value.query.nxid as string;
    getAssetHistory(http, asset_tag.value, async (data, err) => {
      if (err) {
        errorHandler(err);
        return;
      }
      history.value = data as keyedEvent[];
      await Promise.all(history.value.map(checkForAsset));
    });
  }
  if (router.currentRoute.value.query.pageNum) {
    pageNum.value = parseInt(router.currentRoute.value.query.pageNum as string);
  } else {
    router.push({
      query: { nxid: asset_tag.value, pageNum: pageNum.value.toString() },
    });
  }
});

function keySwap() {
  history.value.map((e, i, arr) => {
    arr[i].key += 1000;
  });
}

function nextPage() {
  if (pageNum.value < history.value.length / pageSize.value) {
    pageNum.value += 1;
    router.push({
      query: { nxid: asset_tag.value, pageNum: pageNum.value.toString() },
    });
  }
}

function prevPage() {
  if (pageNum.value > 1) {
    pageNum.value -= 1;
    router.push({
      query: { nxid: asset_tag.value, pageNum: pageNum.value.toString() },
    });
  }
}
</script>
<template>
  <div>
    <div class="mb-4 flex justify-between">
      <h1 class="text-4xl leading-8 md:leading-10">Asset History</h1>
      <div class="float-right flex select-none">
        <p class="my-auto mr-3 inline-block">{{ `Page: ${pageNum}` }}</p>
        <!-- Left Caret -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          viewBox="0 0 256 512"
          v-on:click="prevPage"
          v-if="pageNum > 1"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"
          />
        </svg>
        <div v-else class="button-icon opacity-0"></div>
        <!-- Right Caret -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          viewBox="0 0 256 512"
          v-if="
            pageSize < history.length && pageNum < history.length / pageSize
          "
          v-on:click="nextPage"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"
          />
        </svg>
        <div v-else class="button-icon opacity-0"></div>
      </div>
    </div>
    <AssetEventComponent
      :assets="assets"
      :users="users"
      :parts="parts"
      :event="event"
      :key="event.key"
      v-for="event in history.slice(
        pageSize * (pageNum - 1),
        pageSize * pageNum
      )"
    />
    <div class="float-right flex select-none">
      <p class="my-auto mr-3 inline-block">{{ `Page: ${pageNum}` }}</p>
      <!-- Left Caret -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="button-icon hover:button-icon-hover active:button-icon-active"
        viewBox="0 0 256 512"
        v-on:click="prevPage"
        v-if="pageNum > 1"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z"
        />
      </svg>
      <div v-else class="button-icon opacity-0"></div>
      <!-- Right Caret -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="button-icon hover:button-icon-hover active:button-icon-active"
        viewBox="0 0 256 512"
        v-if="pageSize < history.length && pageNum < history.length / pageSize"
        v-on:click="nextPage"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z"
        />
      </svg>
      <div v-else class="button-icon opacity-0"></div>
    </div>
  </div>
</template>
