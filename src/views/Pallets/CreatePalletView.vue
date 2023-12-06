<script setup lang="ts">
import type { AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import Cacher from '../../plugins/Cacher';
import PalletManagerComponent from '../../components/PalletComponents/PalletManagerComponent.vue';
import AssetPartInventoryComponent from '../../components/AssetComponents/AssetPartInventoryComponent.vue';
import AssetComponent from '../../components/AssetComponents/AssetComponent.vue';
import type {
  AssetSchema,
  UserState,
  PalletSchema
} from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';
import { createPallet } from '../../plugins/dbCommands/palletManager';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
}

const { http, store, router } = defineProps<Props>();

let oldPallet = {} as PalletSchema;
let assets = ref([] as AssetSchema[])
let loading = ref(false)
let processingSubmission = false
let inventory = new Inventory(store.state.user)
let correction = ref(false)
let serialsRef = ref("")

onBeforeMount(async () => {
    loading.value = true
    // get asset tag from url
    inventory.setCorrection(true)
    loading.value = false
    // Get user inventory from api
});

function palletSubmit(updatedPallet: PalletSchema) {
  if(processingSubmission)
    return
  processingSubmission = true
  let unloadedParts = Cacher.unloadParts(inventory.getDestInv())
  createPallet(http, updatedPallet, unloadedParts, serialsRef.value, (data, err) => {
    processingSubmission = false
    if (err) {
        return Cacher.errorHandler(err);
    }
    if(updatedPallet.pallet_tag) {
      router.push({ name: 'View Pallet', query: { pallet_tag: updatedPallet.value.pallet_tag } });
    }
    else {
      router.back();
    }
  });
}

async function reset() {
  // Reset inventory component
  inventory.setCorrection(correction.value)
  await inventory.loadSourceInv(inventory.thisUser._id!)
  await inventory.loadDestFromPallet(oldPallet.pallet_tag!)
}

function correctionChanged(newCorrection: boolean) {
  correction.value = newCorrection
  reset()
}
</script>

<template>
  <LoaderComponent class="mt-16" v-if="loading"/>
  <div
    v-else
    class="background-and-border p-4"
  >
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/pallets')" class="mr-2 mb-2"/>
    <PalletManagerComponent
      :title="'Create Pallet:'"
      :submitText="'Create Pallet'"
      :strict="true"
      :oldPallet="oldPallet"
      :untracked="true"
      @palletSubmit="palletSubmit"
      @palletReset="reset"
      @correctionChanged="correctionChanged"
    >
      <AssetPartInventoryComponent 
        :inventory="inventory"
        :untracked="true"
      />
      <div class="col-span-full">
        <h1 class="col-span-2 my-4 text-4xl">Assets:</h1>
        <div class="col-span-2 grid grid-cols-2">
          <label>Add Assets:</label>
          <textarea
            class="textbox m-1"
            v-model="serialsRef"
            placeholder="One tag per line.  Drag to resize"
          />
        </div>
          <p v-if="assets.length>0" class="my-2 w-full rounded-md bg-green-500 p-2 font-bold">
            To remove an asset, edit its "Pallet" field and provide a new location in the Edit Asset menu.
        </p>
        <div
          v-if="assets.length>0"
          class="relative grid grid-cols-4 py-1 text-center font-bold leading-8 transition md:grid-cols-6 md:py-2 md:leading-10 mt-auto"
        >
          <p class="mt-auto">NXID</p>
          <p class="mt-auto md:block hidden">Building</p>
          <p class="mt-auto">Type</p>
          <p class="hidden md:block mt-auto">Chassis</p>
          <p class="hidden md:block mt-auto">Status</p>
        </div>
        <div class="md:animate-bottom" v-if="assets.length>0">
          <AssetComponent
            :add="false"
            :edit="false"
            :view="false"
            v-for="asset in assets"
            v-bind:key="asset._id"
            :asset="asset"
          />
        </div>
      </div>
    </PalletManagerComponent>
  </div>
</template>
