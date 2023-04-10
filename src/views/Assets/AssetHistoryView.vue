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

// Check if part is in map and add it if it isn't
async function checkPart(part: CartItem) {
  if (!parts.value.has(part.nxid)) {
    parts.value.set(part.nxid, {});
    getPartByID(http, part.nxid, 3, 'Part Room', (data, err) => {
      if (err) {
        errorHandler(err);
        return;
      }
      parts.value.set(part.nxid, data as PartSchema);
      keySwap();
    });
  }
}

// Check if asset in in map and add it if it isn't
async function checkForAsset(historyEvent: keyedEvent) {
  historyEvent.key = keyNum;
  keyNum++;
  if (!assets.value.has(historyEvent.asset_id)) {
    assets.value.set(historyEvent.asset_id, {});
    getAssetByID(http, historyEvent.asset_id, (data, err) => {
      if (err) {
        errorHandler(err);
        return;
      }
      let temp = data as AssetSchema;
      assets.value.set(historyEvent.asset_id, temp);
      historyEvent.key += 1000;
      checkUser(temp);
      if (
        historyEvent.info_updated &&
        temp.prev != null &&
        !assets.value.has(temp.prev!)
      ) {
        getAssetByID(http, temp.prev!, (data, err) => {
          if (err) {
            errorHandler(err);
            return;
          }
          let temp2 = data as AssetSchema;
          assets.value.set(temp2._id!, temp2);
          historyEvent.key += 1000;
        });
      }
    });
  }
  historyEvent.existing.map(checkPart);
  historyEvent.added.map(checkPart);
  historyEvent.removed.map(checkPart);
}

// Check if user is in map and add if it isn't
function checkUser(asset: AssetSchema) {
  if (!users.value.has(asset.by!)) {
    users.value.set(asset.by!, {});
    getUserByID(http, asset.by!, (data, err) => {
      if (err) {
        errorHandler(err);
        return;
      }
      users.value.set(asset.by!, data as User);
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
      assets.value.forEach(checkUser);
    });
  }
});

function keySwap() {
  console.log('key');
  history.value.map((e, i, arr) => {
    arr[i].key += 1000;
  });
}
</script>
<template>
  <div>
    <h1 class="mb-4 text-4xl leading-8 md:leading-10">Asset History</h1>
    <AssetEventComponent
      :assets="assets"
      :users="users"
      :parts="parts"
      :event="event"
      :key="event.key"
      v-for="event in history"
    />
  </div>
</template>
