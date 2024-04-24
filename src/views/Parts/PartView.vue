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
  getPartRecordsByID,
} from '../../plugins/dbCommands/partManager';
import {
NotificationTypes,
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
  displayMessage: (message: string, type: NotificationTypes, link?: string) => void;
}

interface GroupedRecords {
  record: PartRecord;
  quantity: number;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let part = ref({} as PartSchema);
let groupedRecords = ref([] as GroupedRecords[]);
let loadingPart = ref(false)
let loadingGroups = ref(false)

onBeforeMount(() => {
  loadingPart.value = true
  loadingGroups.value = true
  if (router.currentRoute.value.query.nxid) {
    let nxid = router.currentRoute.value.query.nxid as string;
    getPartByID(http, nxid, store.state.user.building ? store.state.user.building : DEFAULT_BUILDING, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      part.value = res as PartSchema;
      loadingPart.value = false
      getPartRecordsByID(http, nxid, async (res, err) => {
        if (err) {
          errorHandler(err);
        }
        let tempGroups = [] as GroupedRecords[]
        for (const record of res as PartRecord[]) {
          // Check if group already exists
          let existingGroup = tempGroups.find(
            (e) =>
              e.record.nxid == record.nxid &&
              e.record.location == record.location &&
              e.record.owner == record.owner &&
              e.record.asset_tag == record.asset_tag &&
              e.record.pallet_tag == record.pallet_tag &&
              e.record.box_tag == record.box_tag
          );
          // Increment if exists and continue
          if (existingGroup) {
            existingGroup.quantity += 1;
            continue;
          } else {
            // Create new group
            tempGroups.push({
              record: record,
              quantity: 1,
            });
          }
        }
        // Sort array by quantity
        tempGroups.sort((r1, r2) =>
          r1.quantity < r2.quantity ? 1 : -1
        );
        // Advanced key switch to fix owners (hacker man)
        groupedRecords.value = tempGroups
        loadingGroups.value = false
      });
    });
  }
});

function viewHistory(record: PartRecord, quantity: number) {
  if (quantity == 1)
    router.push({
      name: 'Part History',
      query: { id: record._id, nxid: record.nxid },
    });
  else
    router.push({
      name: 'Part Location',
      query: {
        nxid: part.value.nxid,
        owner: record.owner,
        location: record.location,
        building: record.building?.toString(),
        asset_tag: record.asset_tag,
        pallet_tag: record.pallet_tag,
        box_tag: record.box_tag
      },
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
    displayMessage(`Added ${part.value.manufacturer} ${part.value.name} to cart`, NotificationTypes.Info, store.state.user.roles?.includes('kiosk')?'/cart':'/requestParts');
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
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/parts')" class="mr-2 mb-2"/>
    <GridPartSpecComponent
      @plus="addToCart"
      :showHistory="store.state.user.roles?.includes('view_analytics')"
      :showPlus="store.state.user.roles?.includes('request_parts')||store.state.user.roles?.includes('is_kiosk')"
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
    <LoaderComponent v-if="loadingGroups"/>
    <div v-else>
      <div
        v-if="groupedRecords.length > 0"
        class="relative my-2 grid grid-cols-5 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
      >
        <p>Building</p>
        <p>Location</p>
        <p class="col-span-2">Owner</p>
        <p class="hidden md:block">Quantity</p>
        <!-- <p class="hidden md:block">Date Updated</p> -->
        <p></p>
      </div>
      <PartRecordComponent
        v-for="group in groupedRecords"
        :users="Cacher.getAllUsers()"
        :record="group.record"
        :quantity="group.quantity"
        :view="true"
        @viewPartAction="viewHistory"
      />
    </div>
  </div>
</template>
