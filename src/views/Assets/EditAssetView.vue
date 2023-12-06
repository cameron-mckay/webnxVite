<script setup lang="ts">
import type { AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetManagerComponent from '../../components/AssetComponents/AssetManagerComponent.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import Cacher from '../../plugins/Cacher';
import AssetPartInventoryComponent from '../../components/AssetComponents/AssetPartInventoryComponent.vue';
import {
  updateAsset
} from '../../plugins/dbCommands/assetManager';
import type {
  AssetSchema,
  UserState,
} from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';


interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
}

const { http, store, router } = defineProps<Props>();

let oldAsset = {} as AssetSchema;
let loading = ref(false)
let processingSubmission = false
let inventory = new Inventory(store.state.user)
let correction = ref(false)

onBeforeMount(async () => {
  if (router.currentRoute.value.query.asset_tag) {
    loading.value = true
    // get asset tag from url
    let nxid = router.currentRoute.value.query.asset_tag as string;
    await inventory.loadSourceInv(inventory.thisUser._id!)
    await inventory.loadDestFromAsset(nxid)
    // Check mode
    // Set asset to res
    oldAsset = await Cacher.getAsset(nxid);
    // Save a copy for reset value
    loading.value = false
    // Get user inventory from api
  }
});

function assetSubmit(updatedAsset: AssetSchema, correction: boolean) {
  if(processingSubmission)
    return
  processingSubmission = true
  let unloadedParts = Cacher.unloadParts(inventory.getDestInv())
  updateAsset(http, updatedAsset, unloadedParts, correction, (data, err) => {
    processingSubmission = false
    if (err) {
        return Cacher.errorHandler(err);
    }
    if(correction&&oldAsset.value.asset_tag!=updatedAsset.asset_tag) {
      router.push({ name: 'View Asset', query: { asset_tag: updatedAsset.value.asset_tag } });
    }
    else {
      router.back();
    }
  }, correction&&oldAsset.value.asset_tag!=updatedAsset.asset_tag ? oldAsset.asset_tag : undefined);
}


async function reset() {
  // Reset inventory component
  inventory.setCorrection(correction.value)
  await inventory.loadSourceInv(inventory.thisUser._id!)
  await inventory.loadDestFromAsset(oldAsset.asset_tag!)
}

function correctionChanged(newCorrection: boolean) {
  correction.value = newCorrection
  reset()
}

</script>
<template>
  <div
    class="background-and-border p-4"
  >
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/assets')" class="mr-2 mb-2"/>
    <LoaderComponent v-if="loading"/>
    <AssetManagerComponent
      v-else
      :title="'Edit Asset:'"
      :submitText="'Update Asset'"
      :strict="true"
      :oldAsset="oldAsset"
      :untracked="oldAsset.migrated?true:false"
      :isAdmin="(store.state.user.roles?.includes('admin')||store.state.user.roles?.includes('lead'))?true:false"
      @assetSubmit="assetSubmit"
      @assetReset="reset"
      @correctionChanged="correctionChanged"
    >
      <AssetPartInventoryComponent 
        :inventory="inventory"
        :correction="correction"
        :untracked="oldAsset.migrated ? true : false"
      />
    </AssetManagerComponent>
  </div>
</template>
