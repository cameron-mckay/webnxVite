<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import AssetCartItemComponent from '../../components/AssetComponents/AssetCartItemComponent.vue';
import AssetComponent from '../../components/AssetComponents/AssetComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import PencilButton from '../../components/GenericComponents/Buttons/PencilButton.vue';
import {
  getPalletByID,
  getPartsOnPallet,
} from '../../plugins/dbCommands/palletManager';
import type {
PalletSchema,
LoadedCartItem,
UserState,
AssetSchema,
CartItem
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

let pallet = ref({
  pallet_tag: '',
  building: 3,
  location: '',
  notes: ''
} as PalletSchema);
let parts = ref([] as LoadedCartItem[]);
let assets = ref([] as AssetSchema[]);
let palletLoading = ref(false)
let partsLoading = ref(false)

onBeforeMount(() => {
  if (router.currentRoute.value.query.pallet_tag) {
    palletLoading.value = true
    partsLoading.value = true
    let nxid = router.currentRoute.value.query.pallet_tag as string;
    getPalletByID(http, nxid, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      pallet.value = res as PalletSchema;
      palletLoading.value = false
      getPartsOnPallet(http, pallet.value.pallet_tag!, async (res, err) => {
        if (err) {
          errorHandler(err);
        }
        // Doing this cause I'm too lazy to fix type defs
        let res2 = res as any
        let temp = await Cacher.loadCartItems((res as any).parts as CartItem[])
        assets.value = res2.assets
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
        assets.value = res2.assets as AssetSchema[]
        partsLoading.value = false
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

function toggleEdit(asset: AssetSchema) {
  router.push({ name: 'Edit Asset', query: { asset_tag: asset.asset_tag } });
}

function viewAsset(asset: AssetSchema) {
  router.push({ name: 'View Asset', query: { asset_tag: asset.asset_tag } });
}
</script>

<template>
  <LoaderComponent v-if="palletLoading" class="mt-16"/>
  <div v-else class="body">
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/pallets')" class="mr-2 mb-2"/>
    <div
      class="relative grid grid-cols-2 rounded-md group-hover:rounded-bl-none group-hover:bg-zinc-400 md:grid-cols-4"
    >
      <div class="col-span-2 mb-4 flex md:col-span-4">
        <h1 class="my-auto text-4xl leading-8 md:leading-10">
          {{ pallet.pallet_tag + ':' }}
        </h1>
        <!-- Pencil -->
        <PencilButton
          v-on:click="edit"
          v-if="store.state.user.roles?.includes('edit_pallets')"
        />
        <RouterLink
          class="my-auto ml-2 rounded-md p-2 font-bold transition-colors hover:bg-gray-400 hover:dark:bg-zinc-700"
          :to="`/pallets/history?pallet_tag=${pallet.pallet_tag}`"
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
          {{ new Date(pallet.date_created).toLocaleString() }}
        </p>
        <div class="col-span-2 my-4" v-if="pallet.notes">
          <h1 class="col-span-2 mb-4 text-4xl">Notes:</h1>
          <pre>{{ pallet.notes }}</pre>
        </div>
      </div>
    </div>
    <LoaderComponent v-if="partsLoading"/>
    <div v-else>
      <div v-if="parts.length > 0">
        <h1 class="col-span-2 my-4 text-4xl">Parts:</h1>
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
      <div v-if="assets.length > 0">
        <h1 class="col-span-2 my-4 text-4xl">Assets:</h1>
        <div
          class="relative grid grid-cols-3 py-1 text-center font-bold leading-8 transition md:grid-cols-6 md:py-2 md:leading-10 mt-auto"
        >
          <p class="mt-auto">NXID</p>
          <p class="mt-auto md:block hidden">Building</p>
          <p class="mt-auto">Type</p>
          <p class="hidden md:block mt-auto">Chassis</p>
          <p class="hidden md:block mt-auto">Status</p>
        </div>
        <div class="md:animate-bottom">
          <AssetComponent
            :add="false"
            :edit="store.state.user.roles?.includes('edit_assets')"
            :view="store.state.user.roles?.includes('view_assets')"
            v-for="asset in assets"
            v-bind:key="asset._id"
            @editPartAction="toggleEdit(asset)"
            @viewPartAction="viewAsset(asset)"
            :asset="asset"
          />
        </div>
      </div>
    </div>
  </div>
</template>
