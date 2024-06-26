<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import GridPartSpecComponent from '../../components/PartComponents/GridPartSpecComponent.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import PartRecordComponent from '../../components/PartComponents/PartRecordComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import {
  getPartByID,
  getPartHistoryByID,
} from '../../plugins/dbCommands/partManager';
import type {
  PartRecord,
  PartSchema,
  UserState,
} from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';
import { DEFAULT_BUILDING } from '../../plugins/Constants';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let part = ref({} as PartSchema);
let partRecords = ref([] as PartRecord[]);
let partLoading = ref(false)
let historyLoading = ref(false)

onBeforeMount(() => {
  partLoading.value = true
  historyLoading.value = true
  if (router.currentRoute.value.query.id) {
    let nxid = router.currentRoute.value.query.nxid as string;
    let id = router.currentRoute.value.query.id as string;
    getPartByID(http, nxid, store.state.user.building ? store.state.user.building : DEFAULT_BUILDING, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      part.value = res as PartSchema;
      partLoading.value = false
      getPartHistoryByID(http, id, async (res, err) => {
        if (err) {
          errorHandler(err);
        }
        let tempParts = res as PartRecord[];
        partRecords.value = tempParts
        historyLoading.value = false
      });
    });
  }
});

function addToCart() {
  // Check if cart quantity < available quantity
  if (
    part.value.quantity &&
    part.value.nxid &&
    store.getters.getQuantity(part.value.nxid) < part.value.quantity
  ) {
    // Add to cart
    displayMessage(`Added ${part.value.manufacturer} ${part.value.name} to cart`);
    store.commit('addToCart', part.value);
  } else {
    // Not enough stock
    errorHandler(`Not enough stock`);
  }
}
function loadActionHistory() {
    router.push({
      name: 'Part Action History',
      query: { parts: [part.value.nxid], hideOtherParts: "true" },
    });
}

function loadCheckouts() {
    router.push({
      name: 'Checkout History',
      query: { parts: [part.value.nxid], hideOtherParts: "true" },
    });
}

function loadCheckins() {
    router.push({
      name: 'Checkin History',
      query: { parts: [part.value.nxid], hideOtherParts: "true" },
    });
}

function loadAssetUpdates() {
    router.push({
      name: 'Asset Update History',
      query: { parts: [part.value.nxid], hideOtherParts: "true" },
    });
}

function loadNewAssets() {
    router.push({
      name: 'New Asset History',
      query: { parts: [part.value.nxid], hideOtherParts: "true" },
    });
}

function loadPalletUpdates() {
    router.push({
      name: 'Pallet Update History',
      query: { parts: [part.value.nxid], hideOtherParts: "true" },
    });
}

function loadNewPallets() {
    router.push({
      name: 'New Pallet History',
      query: { parts: [part.value.nxid], hideOtherParts: "true" },
    });
}

function loadAllTechs() {
    router.push({
      name: 'All Techs History',
      query: { parts: [part.value.nxid], hideOtherParts: "true" },
    });
}

function loadAudit() {
    router.push({
      name: 'Part Audit History',
      query: { parts: [part.value.nxid] },
    });
}
</script>
<template>
  <LoaderComponent v-if="partLoading" class="mt-16"/>
  <div v-else>
    <BackButton @click="router.back()" class="mr-2 mb-2"/>
    <GridPartSpecComponent
      @plus="addToCart"
      :showHistory="store.state.user.roles?.includes('view_analytics')"
      :showPlus="store.state.user.roles?.includes('is_kiosk')"
      :showAudit="store.state.user.roles?.includes('view_audit_date')"
      :part="part"
      @loadHistory="loadActionHistory"
      @loadCheckouts="loadCheckouts"
      @loadCheckins="loadCheckins"
      @loadNewAssets="loadNewAssets"
      @loadAssetUpdates="loadAssetUpdates"
      @loadNewPallets="loadNewPallets"
      @loadPalletUpdates="loadPalletUpdates"
      @loadAllTechs="loadAllTechs"
      @loadAudit="loadAudit"
    />
    <!-- PART RECORDS GO HERE -->
    <LoaderComponent v-if="historyLoading"/>
    <div v-else>
      <h1 class="detail-title" v-if="partRecords&&partRecords.length>0&&partRecords[0].serial != undefined">{{ partRecords[0].serial }} History:</h1>
      <h1 class="detail-title" v-else>History:</h1>
      <div
        v-if="partRecords.length > 0"
        class="relative my-2 grid grid-cols-5 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
      >
        <p>Building</p>
        <p>Location</p>
        <p class="col-span-2">Owner</p>
        <p class="hidden md:block">Date</p>
        <p></p>
      </div>
      <PartRecordComponent
        v-for="record in partRecords"
        :users="Cacher.getAllUsers()"
        :record="record"
      />
    </div>
  </div>
</template>
