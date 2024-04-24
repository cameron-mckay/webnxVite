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
import GetStringPopupComponent from '../../components/GenericComponents/GetStringPopupComponent.vue';
import {
  createAsset, createAssetTemplate,
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
let showNamePopup = ref(false)
let templateAsset = {} as AssetSchema

onBeforeMount(async () => {
  inventory.setCorrection(true)
});

function assetSubmit(updatedAsset: AssetSchema) {
  if(processingSubmission)
    return
  processingSubmission = true
  let unloadedParts = [] as CartItem[]
  // Only fetch the parts if this is a server
  if(updatedAsset.asset_type=="Server") {
    unloadedParts = Cacher.unloadParts(inventory.getDestInv())
  }
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

function loadTemplateClicked() {
  console.log('load')
}

function saveTemplateClicked(assetTemplate: AssetSchema) {
  showNamePopup.value = true
  templateAsset = JSON.parse(JSON.stringify(assetTemplate))
}

function toggleTemplateName() {
  showNamePopup.value = !showNamePopup.value
}

function submitTemplate(name: string) {
  if(processingSubmission)
    return
  processingSubmission = true
  let unloadedParts = [] as CartItem[]
  // Only fetch the parts if this is a server
  if(templateAsset.asset_type=="Server") {
    unloadedParts = Cacher.unloadParts(inventory.getDestInv())
  }
  // createAssetTemplate(http, templateAsset, unloadedParts, name, (data, err)=>{
  //   processingSubmission = false
  //   if(err) {
  //     Cacher.errorHandler(err)
  //   }
  //   Cacher.messageHandler(data as string)
  // })
  console.log("submit")
  console.log(unloadedParts)
  console.log(templateAsset)
  console.log(name)
  processingSubmission = false
}

</script>
<template>
  <div
    class="background-and-border p-4"
  >
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/assets')" class="mr-2 mb-2"/>
    <GetStringPopupComponent
      v-if="showNamePopup"
      title="Enter Template Name:"
      label=""
      placeholder="Template Name"
      submit-text="Save"
      @toggle="toggleTemplateName"
      @submit="submitTemplate"
    />
    <LoaderComponent v-if="loading"/>
    <AssetManagerComponent
      v-else
      :title="'Create Asset:'"
      :submitText="'Create Asset'"
      :strict="true"
      :oldAsset="oldAsset"
      :untracked="true"
      :show-templates="true"
      @assetSubmit="assetSubmit"
      @assetReset="reset"
      @load-template="loadTemplateClicked"
      @save-template="saveTemplateClicked"
    >
      <AssetPartInventoryComponent 
        :inventory="inventory"
        :untracked="true"
      />
    </AssetManagerComponent>
  </div>
</template>
