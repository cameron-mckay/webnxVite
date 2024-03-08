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
import BoxComponent from '../../components/BoxComponents/BoxComponent.vue';
import type {
  AssetSchema,
  UserState,
  PalletSchema,
  BoxSchema,
  CartItem
} from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';
import { updatePallet } from '../../plugins/dbCommands/palletManager';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
}

const { http, store, router } = defineProps<Props>();

let oldPallet = {} as PalletSchema;
let assets = ref([] as AssetSchema[])
let boxes = ref([] as BoxSchema[])
let loading = ref(false)
let processingSubmission = false
let inventory:Inventory;
let correction = ref(false)
let assetTagsRef = ref("")
let boxTagsRef = ref("")

onBeforeMount(async () => {
  if (router.currentRoute.value.query.pallet_tag) {
    loading.value = true
    // get asset tag from url
    await Cacher.loadAllUsersFromAPISync()
    inventory = new Inventory(store.state.user)
    let nxid = router.currentRoute.value.query.pallet_tag as string;
    await inventory.loadSourceInv(inventory.thisUser._id!)
    await inventory.loadDestFromPallet(nxid)
    // Check mode
    // Set asset to res
    oldPallet = await Cacher.getPallet(nxid);
    let items = await inventory.getItemsOnPallet(nxid) as {parts: CartItem[], assets: AssetSchema[], boxes: BoxSchema[]}
    assets.value = items.assets
    boxes.value = items.boxes
    // Save a copy for reset value
    loading.value = false
    // Get user inventory from api
  }
});

function palletSubmit(updatedPallet: PalletSchema, correction: boolean) {
  if(processingSubmission)
    return
  processingSubmission = true
  let unloadedParts = Cacher.unloadParts(inventory.getDestInv())
  updatePallet(http, updatedPallet, unloadedParts, assetTagsRef.value, boxTagsRef.value, correction, (data, err) => {
    processingSubmission = false
    if (err) {
        return Cacher.errorHandler(err);
    }
    if(updatedPallet.pallet_tag) {
      router.push({ name: 'View Pallet', query: { pallet_tag: updatedPallet.pallet_tag } });
    }
    else {
      router.back();
    }
  })
  //}, correction&&oldPallet.value.pallet_tag!=updatedPallet.pallet_tag ? oldPallet.pallet_tag : undefined);
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
      :title="'Edit Pallet:'"
      :submitText="'Update Pallet'"
      :strict="true"
      :oldPallet="oldPallet"
      :untracked="oldPallet.migrated?true:false"
      :isAdmin="store.state.user.roles?.includes('correct_pallets')"
      @palletSubmit="palletSubmit"
      @palletReset="reset"
      @correctionChanged="correctionChanged"
    >
      <AssetPartInventoryComponent 
        :inventory="inventory"
        :correction="correction"
        :untracked="oldPallet.migrated ? true : false"
      />
      <div class="col-span-full">
        <h1 class="col-span-2 my-4 text-4xl">Assets:</h1>
        <div class="col-span-2 grid grid-cols-2">
          <label>Add Assets:</label>
          <textarea
            class="textbox m-1"
            v-model="assetTagsRef"
            placeholder="One tag per line.  Drag to resize"
          />
        </div>
          <p v-if="assets.length>0" class="my-2 w-full rounded-md bg-green-500 p-2 font-bold">
            To remove an asset, edit its "Pallet" field and provide a new location in the Edit Asset menu.
        </p>
        <div
          v-if="assets.length>0"
          class="relative grid grid-cols-3 py-1 text-center font-bold leading-8 transition md:grid-cols-6 md:py-2 md:leading-10 mt-auto"
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
      <div class="col-span-full">
        <h1 class="col-span-2 my-4 text-4xl">Boxes:</h1>
        <div class="col-span-2 grid grid-cols-2">
          <label>Add Boxes:</label>
          <textarea
            class="textbox m-1"
            v-model="boxTagsRef"
            placeholder="One tag per line.  Drag to resize"
          />
        </div>
          <p v-if="boxes.length>0" class="my-2 w-full rounded-md bg-green-500 p-2 font-bold">
            To remove a box, edit its "Location" field and provide a new location in the Edit Box menu.
        </p>
        <div
          v-if="boxes.length>0"
          class="relative grid grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
        >
          <p class="mt-auto">Box Tag</p>
          <p class="mt-auto">Building</p>
          <p class="mt-auto">Location</p>
        </div>
        <div class="md:animate-bottom" v-if="boxes.length>0">
          <BoxComponent
            :add="false"
            :edit="false"
            :view="false"
            v-for="box in boxes"
            v-bind:key="box._id"
            :box="box"
          />
        </div>
      </div>
    </PalletManagerComponent>
  </div>
</template>
