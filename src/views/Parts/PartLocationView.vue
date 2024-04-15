<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import GridPartSpecComponent from '../../components/PartComponents/GridPartSpecComponent.vue';
import PartRecordComponent from '../../components/PartComponents/PartRecordComponent.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import SerializedPartRecordComponent from '../../components/PartComponents/SerializedPartRecordComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import {
  getPartByID,
  getPartRecords,
} from '../../plugins/dbCommands/partManager';
import type {
  PartRecord,
  PartSchema,
  UserState,
} from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let part = ref({
  nxid: 'q',
  manufacturer: '',
  name: '',
  type: '',
  quantity: 0,
  total_quantity: 0,
  shelf_location: '',
} as PartSchema);
let pageTitle = ref('');
let partRecords = ref([] as PartRecord[]);
let loadingPart = ref(false)
let loadingRecords = ref(false)

const getUserExclude = ["all", "testing", "la", "ny", "og", "hdd"]

onBeforeMount(() => {
  if (router.currentRoute.value.query.nxid) {
    loadingPart.value = true
    loadingRecords.value = true
    let nxid = router.currentRoute.value.query.nxid as string;
    let query = router.currentRoute.value.query;

    pageTitle.value = '';
    if (query.location == 'All Techs') {
      pageTitle.value = pageTitle.value + "All Tech's inventory:";
    }
    else if (query.owner&&!getUserExclude.includes(query.owner as string)) {
      let u = Cacher.getUser(query.owner as string)
      pageTitle.value =
        pageTitle.value +
        u?.first_name +
        ' ' +
        u?.last_name +
        "'s inventory:";
    } 
    else if (query.asset_tag) {
      pageTitle.value = pageTitle.value + query.asset_tag + ':';
    } 
    else if (query.pallet_tag) {
      pageTitle.value = pageTitle.value + query.pallet_tag + ':';
    }
    else if (query.box_tag) {
      pageTitle.value = pageTitle.value + query.box_tag + ':';
    }
    else {
      pageTitle.value = pageTitle.value + query.location + ':';
    }

    getPartByID(http, nxid, store.state.user.building ? store.state.user.building : 3, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      part.value = res as PartSchema;
      loadingPart.value = false
      getPartRecords(http, query, async (res, err) => {
        if (err) {
          errorHandler(err);
        }
        partRecords.value = res as PartRecord[];
        partRecords.value = partRecords.value.reverse();
        loadingRecords.value = false
      });
    });
  }
});

function viewHistory(record: PartRecord) {
  router.push({
    name: 'Part History',
    query: { id: record._id, nxid: record.nxid },
  });
}

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
  <LoaderComponent v-if="loadingPart" class="mt-16"/>
  <div v-else>
    <BackButton @click="router.back()" class="mr-2 mb-2"/>
    <GridPartSpecComponent
      @plus="addToCart"
      :showHistory="store.state.user.roles?.includes('view_analytics')"
      :showAudit="store.state.user.roles?.includes('view_audit_date')"
      :showPlus="store.state.user.roles?.includes('is_kiosk')"
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
    <LoaderComponent v-if="loadingRecords"/>
    <div v-else>
      <h1 class="detail-title mt-4">
        {{ pageTitle }}
      </h1>
      <div
        v-if="partRecords.length > 0 && part.serialized"
        class="relative my-2 grid grid-cols-3 rounded-xl p-2 text-center font-bold leading-8 transition md:leading-10"
      >
        <p>Serial</p>
        <p class="hidden md:block">Date Updated</p>
        <p></p>
      </div>
      <div
        class="relative my-2 grid grid-cols-5 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
        v-else-if="partRecords.length>0"
      >
        <p>Building</p>
        <p>Location</p>
        <p class="col-span-2">Owner</p>
        <p class="hidden md:block">Date Updated</p>
        <p></p>
      </div>
      <SerializedPartRecordComponent
        v-if="part.serialized"
        v-for="record in partRecords"
        :users="Cacher.getAllUsers()"
        :record="record"
        :view="true"
        :showSerial="true"
        @viewPartAction="viewHistory"
      />
      <PartRecordComponent
        v-else
        v-for="record in partRecords"
        :users="Cacher.getAllUsers()"
        :record="record"
        :view="true"
        :showSerial="true"
        @viewPartAction="viewHistory"
      />
    </div>
  </div>
</template>
