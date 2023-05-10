<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import GridPartSpecComponent from '../../components/PartComponents/GridPartSpecComponent.vue';
import PartRecordComponent from '../../components/PartComponents/PartRecordComponent.vue';
import {
  getPartByID,
  getPartHistoryByID,
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
let url = import.meta.env.VITE_API_URL;
let part = ref({
  nxid: 'q',
  manufacturer: '',
  name: '',
  type: '',
  quantity: 0,
  total_quantity: 0,
  shelf_location: '',
} as PartSchema);
let partRecords = ref([] as PartRecord[]);
let users = ref([
  // { _id: 'all', first_name: 'All', last_name: 'Techs' },
  // { _id: 'testing', first_name: 'Testing', last_name: 'Center' },
] as User[]);

onBeforeMount(() => {
  if (router.currentRoute.value.query.id) {
    let nxid = router.currentRoute.value.query.nxid as string;
    let id = router.currentRoute.value.query.id as string;
    getPartByID(http, nxid, 3, 'Parts Room', (res, err) => {
      if (err) {
        errorHandler(err);
      }
      part.value = res as PartSchema;
    });
    getPartHistoryByID(http, id, async (res, err) => {
      if (err) {
        errorHandler(err);
      }
      partRecords.value = res as PartRecord[];
      for (const record of res as PartRecord[]) {
        // IF USER IS NOT IN ARRAY, FIND AND ADD TO ARRAy
        if (
          record.owner &&
          record.owner != 'all' &&
          record.owner != 'testing' &&
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
  }
});

function viewHistory(id: string) {
  router.push({ name: 'Part History', query: { id } });
}
</script>
<template>
  <div>
    <GridPartSpecComponent :part="part" />
    <!-- PART RECORDS GO HERE -->
    <h1 class="detail-title">{{ partRecords[0].serial }} History:</h1>
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
      :users="users"
      :record="record"
    />
  </div>
</template>
