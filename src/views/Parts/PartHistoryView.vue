<script setup lang="ts">
import type { AxiosError, AxiosInstance } from "axios";
import { onBeforeMount, ref } from "vue";
import { Router } from "vue-router";
import type { Store } from "vuex";
import PartRecordComponent from "../../components/PartRecordComponent.vue";
import {
  getPartByID,
  getPartHistoryByID,
} from "../../plugins/dbCommands/partManager";
import { getUserByID } from "../../plugins/dbCommands/userManager";
import type {
  PartRecord,
  PartSchema,
  User,
  UserState,
} from "../../plugins/interfaces";

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
let users = ref([
  { _id: "all", first_name: "All", last_name: "Techs" },
] as User[]);

onBeforeMount(() => {
  if (router.currentRoute.value.query.id) {
    let nxid = router.currentRoute.value.query.nxid as string;
    let id = router.currentRoute.value.query.id as string;
    getPartByID(http, nxid, 3, "Parts Room", (res, err) => {
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
          record.owner != "all" &&
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
  router.push({ name: "Part History", query: { id } });
}
</script>
<template>
  <div>
    <div class="grid grid-cols-4">
      <h1 class="col-span-4 mb-4 inline-block text-4xl">
        {{ `${part.manufacturer} ${part.name}` }}
      </h1>
      <p class="my-2 font-bold">NXID:</p>
      <p class="col-span-3 my-2">{{ part.nxid }}</p>
      <p class="my-2 font-bold">Shelf Location:</p>
      <p class="col-span-3 my-2">{{ part.shelf_location }}</p>
      <p class="my-2 font-bold">Parts Room Quantity:</p>
      <p class="col-span-3 my-2">{{ part.quantity }}</p>
      <p class="my-2 font-bold">Total Quantity:</p>
      <p class="col-span-3 my-2">{{ part.total_quantity }}</p>
      <p class="my-2 font-bold">Type:</p>
      <p class="col-span-3 my-2">{{ part.type }}</p>
      <div
        class="col-span-4 grid grid-cols-4"
        v-if="part.type == 'Motherboard'"
      >
        <p class="my-2 font-bold">Chipset</p>
        <p class="col-span-3 my-2">{{ part.chipset }}</p>
      </div>
      <div v-if="part.type == 'CPU'" class="col-span-4 grid grid-cols-4">
        <p class="my-2 font-bold">Chipset:</p>
        <p class="col-span-3 my-2">{{ part.chipset }}</p>
        <p class="my-2 font-bold">Frequency:</p>
        <p class="col-span-3 my-2">{{ part.frequency + "GHz" }}</p>
      </div>
      <div v-if="part.type == 'Memory'" class="col-span-4 grid grid-cols-4">
        <p class="my-2 font-bold">Frequency:</p>
        <p class="col-span-3 my-2">{{ part.frequency + "MHz" }}</p>
        <p class="my-2 font-bold">Capacity:</p>
        <p class="col-span-3 my-2">{{ part.capacity + "GB" }}</p>
        <p class="my-2 font-bold">Memory Type:</p>
        <p class="col-span-3 my-2">{{ part.memory_type }}</p>
      </div>
      <div
        v-if="part.type == 'Peripheral Card'"
        class="col-span-4 grid grid-cols-4"
      >
        <p class="my-2 font-bold">Card Type:</p>
        <p class="col-span-3 my-2">{{ part.peripheral_type }}</p>
        <p class="my-2 font-bold">Port Type:</p>
        <p class="col-span-3 my-2">{{ part.port_type }}</p>
      </div>
      <div v-if="part.type == 'Storage'" class="col-span-4 grid grid-cols-4">
        <p class="my-2 font-bold">Interface:</p>
        <p class="col-span-3 my-2">{{ part.storage_interface }}</p>
        <p class="my-2 font-bold">Capacity:</p>
        <p class="col-span-3 my-2">
          {{ `${part.capacity}${part.capacity_unit}` }}
        </p>
        <div
          v-if="part.storage_interface == 'NVME'"
          class="col-span-4 grid grid-cols-4"
        >
          <p class="my-2 font-bold">Connector:</p>
          <p class="col-span-3 my-2">{{ part.port_type }}</p>
        </div>
      </div>
      <div v-if="part.type == 'GPU'">
        <!-- Placeholder -->
      </div>
      <div v-if="part.type == 'Cable'" class="col-span-4 grid grid-cols-4">
        <p class="my-2 font-bold">End 1:</p>
        <p class="col-span-3 my-2">{{ part.cable_end1 }}</p>
        <p class="my-2 font-bold">End 2:</p>
        <p class="col-span-3 my-2">{{ part.cable_end2 }}</p>
      </div>
      <div v-if="part.type == 'Backplane'" class="col-span-4 grid grid-cols-4">
        <p class="my-2 font-bold">Interface:</p>
        <p class="col-span-3 my-2">{{ part.storage_interface }}</p>
        <p class="my-2 font-bold">Ports:</p>
        <p class="col-span-3 my-2">{{ part.port_type }}</p>
      </div>
      <div v-if="part.type == 'Misc.'">
        <!-- Placeholder -->
      </div>
    </div>
    <!-- PART RECORDS GO HERE -->
    <div
      v-if="partRecords.length > 0"
      class="relative my-2 grid grid-cols-5 rounded-xl p-2 text-center font-bold leading-10 transition md:grid-cols-6"
    >
      <p>Building</p>
      <p>Location</p>
      <p class="col-span-2">Owner</p>
      <p class="hidden md:block">Date Created</p>
      <p></p>
    </div>
    <PartRecordComponent
      v-for="record in partRecords"
      :users="users"
      :record="record"
    />
  </div>
</template>
