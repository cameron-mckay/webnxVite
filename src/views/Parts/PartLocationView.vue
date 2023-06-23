<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import GridPartSpecComponent from '../../components/PartComponents/GridPartSpecComponent.vue';
import PartRecordComponent from '../../components/PartComponents/PartRecordComponent.vue';
import SerializedPartRecordComponent from '../../components/PartComponents/SerializedPartRecordComponent.vue';
import {
  getPartByID,
  getPartRecords,
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
let url = import.meta.env.VITE_API_URL;
let users = ref([
  // { _id: 'all', first_name: 'All', last_name: 'Techs' },
  // { _id: 'testing', first_name: 'Testing', last_name: 'Center' },
] as User[]);

const getUserExclude = ["all", "testing", "la", "ny", "og"]

onBeforeMount(() => {
  if (router.currentRoute.value.query.nxid) {
    let nxid = router.currentRoute.value.query.nxid as string;
    let query = router.currentRoute.value.query;

    getPartRecords(http, query, async (res, err) => {
      if (err) {
        errorHandler(err);
      }
      partRecords.value = res as PartRecord[];
      partRecords.value = partRecords.value.reverse();
      for (const record of res as PartRecord[]) {
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
        // IF USER IS NOT IN ARRAY, FIND AND ADD TO ARRAy
        if (
          record.by &&
          users.value.find((e) => e._id == record.by) === undefined
        ) {
          await getUserByID(http, record.by, (res, err) => {
            if (err) {
              errorHandler(err);
            }
            users.value.push(res as User);
          });
        }
      }
    });
    pageTitle.value = '';
    if (query.location == 'All Techs') {
      pageTitle.value = pageTitle.value + "All Tech's inventory:";
    } else if (query.owner&&!getUserExclude.includes(query.owner as string)) {
      getUserByID(http, query.owner as string, (res, err) => {
        if (err) {
          errorHandler(err);
        }
        let userObject = res as User;
        pageTitle.value =
          pageTitle.value +
          userObject?.first_name +
          ' ' +
          userObject?.last_name +
          "'s inventory:";
      });
    } else {
      if (query.asset_tag) {
        pageTitle.value = pageTitle.value + query.asset_tag + ':';
      } else {
        pageTitle.value = pageTitle.value + query.location + ':';
      }
    }

    getPartByID(http, nxid, 3, 'Parts Room', (res, err) => {
      if (err) {
        errorHandler(err);
      }
      part.value = res as PartSchema;
    });
  }
});

function viewHistory(record: PartRecord, quantity?: number) {
  router.push({
    name: 'Part History',
    query: { id: record._id, nxid: record.nxid },
  });
}
</script>
<template>
  <div>
    <GridPartSpecComponent :part="part" />
    <!-- PART RECORDS GO HERE -->
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
      v-else-if="partRecords.length > 0"
      class="relative my-2 grid grid-cols-5 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
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
      :users="users"
      :record="record"
      :view="true"
      :showSerial="true"
      @viewPartAction="viewHistory"
    />
    <PartRecordComponent
      v-else
      v-for="record in partRecords"
      :users="users"
      :record="record"
      :view="true"
      :showSerial="true"
      @viewPartAction="viewHistory"
    />
  </div>
</template>
