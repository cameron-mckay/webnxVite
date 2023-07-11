<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import GridPartSpecComponent from '../../components/PartComponents/GridPartSpecComponent.vue';
import BackButton from '../../components/GenericComponents/BackButton.vue';
import PartRecordComponent from '../../components/PartComponents/PartRecordComponent.vue';
import {
  getPartByID,
  getPartRecordsByID,
} from '../../plugins/dbCommands/partManager';
import { getUserByID } from '../../plugins/dbCommands/userManager';
import type {
  PartRecord,
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

interface GroupedRecords {
  record: PartRecord;
  quantity: number;
  key: number;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let url = import.meta.env.VITE_API_URL;

let part = ref({} as PartSchema);
let partRecords = ref([] as PartRecord[]);
let groupedRecords = ref([] as GroupedRecords[]);
let users = ref([
  // { _id: 'all', first_name: 'All', last_name: 'Techs' },
] as User[]);

let getUserExclude = ["all", "testing", "la", "ny", "og"]

onBeforeMount(() => {
  if (router.currentRoute.value.query.nxid) {
    let nxid = router.currentRoute.value.query.nxid as string;
    getPartByID(http, nxid, 3, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      part.value = res as PartSchema;
    });
    getPartRecordsByID(http, nxid, async (res, err) => {
      if (err) {
        errorHandler(err);
      }
      partRecords.value = res as PartRecord[];
      partRecords.value = partRecords.value.reverse();
      for (const record of res as PartRecord[]) {
        // Check if group already exists
        let existingGroup = groupedRecords.value.find(
          (e) =>
            e.record.nxid == record.nxid &&
            e.record.location == record.location &&
            e.record.owner == record.owner &&
            e.record.asset_tag == record.asset_tag
        );
        // Increment if exists and continue
        if (existingGroup) {
          existingGroup.quantity += 1;
          continue;
        } else {
          // Create new group
          groupedRecords.value.push({
            record: record,
            quantity: 1,
            key: groupedRecords.value.length,
          });
        }
        // Check
        // IF USER IS NOT IN ARRAY, FIND AND ADD TO ARRAy
        if (
          record.owner &&
          !getUserExclude.includes(record.owner) &&
          users.value.find((e) => e._id == record.owner) === undefined
        ) {
          await getUserByID(http, record.owner, (res, err) => {
            if (err) {
              errorHandler(err);
            }
            users.value.push(res as User);
          });
        }
      }
      // Sort array by quantity
      groupedRecords.value.sort((r1, r2) =>
        r1.quantity < r2.quantity ? 1 : -1
      );
      // Advanced key switch to fix owners (hacker man)
      groupedRecords.value.map((group) => {
        group.key += 1;
        group.key -= 1;
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
      },
    });
}
</script>
<template>
  <div>
    <BackButton @click="router.back()" class="mr-2"/>
    <GridPartSpecComponent :part="part" />
    <!-- PART RECORDS GO HERE -->
    <div
      v-if="partRecords.length > 0"
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
      :users="users"
      :record="group.record"
      :quantity="group.quantity"
      :view="true"
      :key="group.key"
      @viewPartAction="viewHistory"
    />
  </div>
</template>
