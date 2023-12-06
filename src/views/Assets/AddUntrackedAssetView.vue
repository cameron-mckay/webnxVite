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
  createAsset,
} from '../../plugins/dbCommands/assetManager';
import type {
  AssetSchema,
  CartItem,
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

onBeforeMount(async () => {
  inventory.setCorrection(true)
});

function assetSubmit(updatedAsset: AssetSchema) {
  if(processingSubmission)
    return
  processingSubmission = true
  let unloadedParts = [] as CartItem[]
  // Only fetch the parts if this is a server
  if(updatedAsset.asset_type=="Server")
    Cacher.unloadParts(inventory.getDestInv())
  createAsset(http, updatedAsset, unloadedParts, (data, err) => {
    processingSubmission = false
    if (err) {
        return Cacher.errorHandler(err);
    }
    router.back();
  });
}


async function reset() {
  inventory.clearDestInv()
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
      :title="'Create Asset:'"
      :submitText="'Create Asset'"
      :strict="true"
      :oldAsset="oldAsset"
      :untracked="true"
      @assetSubmit="assetSubmit"
      @assetReset="reset"
    >
      <AssetPartInventoryComponent 
        :inventory="inventory"
        :untracked="true"
      />
    </AssetManagerComponent>
  </div>
</template>
