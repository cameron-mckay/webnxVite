<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import BackButton from '../../components/GenericComponents/BackButton.vue';
import AssetCartItemComponent from '../../components/AssetComponents/AssetCartItemComponent.vue';
import {
  getPalletByID,
  getPartsOnPallet,
} from '../../plugins/dbCommands/palletManager';
import type {
PalletSchema,
LoadedCartItem,
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

let pallet = ref({
  pallet_tag: '',
  building: 3,
  location: '',
  notes: ''
} as PalletSchema);
let parts = ref([] as LoadedCartItem[]);

onBeforeMount(() => {
  if (router.currentRoute.value.query.pallet_tag) {
    let nxid = router.currentRoute.value.query.pallet_tag as string;
    getPalletByID(http, nxid, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      pallet.value = res as PalletSchema;
      getPartsOnPallet(http, pallet.value.pallet_tag!, (res, err) => {
        if (err) {
          errorHandler(err);
        }
        let temp = res as LoadedCartItem[]
        // Create sorted list using array filters
        let sortedList = temp.filter((p)=>p.part.type == "Motherboard")
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "CPU"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Heatsink"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Memory"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Storage"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Peripheral Card"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Cable"))
        // Catch all
        sortedList = sortedList.concat(temp.filter((p)=>
          (p.part.type != "Motherboard"&&
          p.part.type != "CPU"&&
          p.part.type != "Heatsink"&&
          p.part.type != "Memory"&&
          p.part.type != "Storage"&&
          p.part.type != "Peripheral Card"&&
          p.part.type != "Cable")
        )) 
        parts.value = sortedList
      });
    });
  }
});

function edit() {
  router.push({
    name: 'Edit Pallet',
    query: { pallet_tag: pallet.value.pallet_tag },
  });
}
</script>

<template>
  <div class="body">
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/pallets')" class="mr-2 mb-2"/>
    <div
      class="relative grid grid-cols-2 rounded-lg group-hover:rounded-bl-none group-hover:bg-zinc-400 md:grid-cols-4"
    >
      <div class="col-span-2 mb-4 flex md:col-span-4">
        <h1 class="my-auto text-4xl leading-8 md:leading-10">
          {{ pallet.pallet_tag + ':' }}
        </h1>
        <!-- Pencil -->
        <svg
          v-on:click="edit"
            v-if="!store.state.user.roles?.includes('sales')"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z"
          />
        </svg>
        <RouterLink
          class="my-auto ml-2 rounded-md p-2 font-bold transition-colors hover:bg-gray-400 hover:dark:bg-zinc-700"
          :to="`/pallets/history?nxid=${pallet.pallet_tag}`"
        >
          View History
        </RouterLink>
      </div>
      <div class="detail-row">
        <p>Building:</p>
        <p>{{ pallet.building }}</p>
        <p>Location:</p>
        <p>{{ pallet.location }}</p>
        <p>Last Updated:</p>
        <p>
          {{ pallet.date_created!.toLocaleString() }}
        </p>
        <div class="col-span-2 my-4" v-if="pallet.notes">
          <h1 class="col-span-2 mb-4 text-4xl">Notes:</h1>
          <pre>{{ pallet.notes }}</pre>
        </div>
      </div>
    </div>
    <div v-if="parts.length > 0">
      <h1 class="col-span-2 mb-4 text-4xl">Parts:</h1>
      <div
        v-if="(parts!.length > 0)"
        class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 group-hover:rounded-bl-none group-hover:bg-zinc-400 group-hover:shadow-lg md:grid-cols-5 md:leading-10"
      >
        <p class="hidden md:block">NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p>Quantity/SN</p>
        <p></p>
      </div>
      <AssetCartItemComponent
        class="col-span-2"
        v-for="part in parts"
        :item="part"
        @plus="$emit('plusPart', part)"
        @minus="$emit('minusPart', part)"
        @delete="$emit('deletePart', part)"
        :hideButtons="true"
      />
    </div>
  </div>
</template>
