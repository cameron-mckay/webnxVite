<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
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
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let part = ref({
  nxid: '',
  manufacturer: '',
  name: '',
  type: '',
  quantity: 0,
  total_quantity: 0,
  shelf_location: '',
} as PartSchema);
let partRecords = ref([] as PartRecord[]);
let users = ref([
  { _id: 'all', first_name: 'All', last_name: 'Techs' },
] as User[]);

onBeforeMount(() => {
  if (router.currentRoute.value.query.nxid) {
    let nxid = router.currentRoute.value.query.nxid as string;
    getPartByID(http, nxid, 3, 'Parts Room', (res, err) => {
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
        // IF USER IS NOT IN ARRAY, FIND AND ADD TO ARRAy
        if (
          record.owner &&
          record.owner != 'all' &&
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
  router.push({ name: 'Part History', query: { id, nxid: part.value.nxid } });
}
</script>
<template>
  <div>
    <div class="detail-table">
      <h1 class="detail-title">
        {{ `${part.manufacturer} ${part.name}` }}
      </h1>
      <p class="detail-label">NXID:</p>
      <p class="detail-data">{{ part.nxid }}</p>
      <p class="detail-label">Shelf Location:</p>
      <p class="detail-data">{{ part.shelf_location }}</p>
      <p class="detail-label">Parts Room Quantity:</p>
      <p class="detail-data">{{ part.quantity }}</p>
      <p class="detail-label">Total Quantity:</p>
      <p class="detail-data">{{ part.total_quantity }}</p>
      <p class="detail-label">Type:</p>
      <p class="detail-data">{{ part.type }}</p>
      <div class="detail-row" v-if="part.type == 'Motherboard'">
        <p>Chipset:</p>
        <p>{{ part.chipset }}</p>
      </div>
      <div v-if="part.type == 'CPU'" class="detail-row">
        <p>Chipset:</p>
        <p>{{ part.chipset }}</p>
        <p>Frequency:</p>
        <p>{{ part.frequency + 'GHz' }}</p>
      </div>
      <div v-if="part.type == 'Memory'" class="detail-row">
        <p>Frequency:</p>
        <p>{{ part.frequency + 'MHz' }}</p>
        <p>Capacity:</p>
        <p>{{ part.capacity + 'GB' }}</p>
        <p>Memory Type:</p>
        <p>{{ part.memory_type }}</p>
      </div>
      <div v-if="part.type == 'Peripheral Card'" class="detail-row">
        <p>Card Type:</p>
        <p>{{ part.peripheral_type }}</p>
        <p>Port Type:</p>
        <p>{{ part.port_type }}</p>
      </div>
      <div v-if="part.type == 'Storage'" class="detail-row">
        <p>Interface:</p>
        <p>{{ part.storage_interface }}</p>
        <p>Capacity:</p>
        <p>
          {{ `${part.capacity}${part.capacity_unit}` }}
        </p>
        <div v-if="part.storage_interface == 'NVME'" class="detail-row">
          <p>Connector:</p>
          <p>{{ part.port_type }}</p>
        </div>
      </div>
      <div v-if="part.type == 'GPU'">
        <!-- Placeholder -->
      </div>
      <div v-if="part.type == 'Cable'" class="detail-row">
        <p>End 1:</p>
        <p>{{ part.cable_end1 }}</p>
        <p>End 2:</p>
        <p>{{ part.cable_end2 }}</p>
      </div>
      <div v-if="part.type == 'Backplane'" class="detail-row">
        <p>Interface:</p>
        <p>{{ part.storage_interface }}</p>
        <p>Ports:</p>
        <p>{{ part.port_type }}</p>
      </div>
      <div v-if="part.type == 'Misc.'">
        <!-- Placeholder -->
      </div>
    </div>
    <!-- PART RECORDS GO HERE -->
    <div
      v-if="partRecords.length > 0"
      class="relative my-2 grid grid-cols-5 rounded-xl p-2 text-center font-bold leading-8 transition md:grid-cols-6 md:leading-10"
    >
      <p>Building</p>
      <p>Location</p>
      <p class="col-span-2">Owner</p>
      <p class="hidden md:block">Date Updated</p>
      <p></p>
    </div>
    <PartRecordComponent
      v-for="record in partRecords"
      :users="users"
      :record="record"
      :view="true"
      @viewPartAction="viewHistory"
    />
  </div>
</template>
