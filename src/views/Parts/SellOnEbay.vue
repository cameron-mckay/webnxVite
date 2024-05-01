<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import {
  User,
  CartItem,
  AssetSchema,
} from '../../plugins/interfaces';

import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../../plugins/interfaces';
import EbayInventory from '../../plugins/EbayClass';
import InventoryComponent from '../../components/InventoryComponents/InventoryComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { sellOnEbay } from '../../plugins/dbCommands/partManager';
import Cacher from '../../plugins/Cacher';
import AssetSearchPopupComponent from '../../components/AssetComponents/AssetSearchPopupComponent.vue';
import PlusButton from '../../components/GenericComponents/Buttons/PlusButton.vue';
import FullScreenPopupComponent from '../../components/GenericComponents/FullScreenPopupComponent.vue';
import EbayAssetComponent from '../../components/AssetComponents/EbayAssetComponent.vue';
import { getPartsOnAsset } from '../../plugins/dbCommands/assetManager';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let inventory:EbayInventory;
let loading = ref(true);
let processingMove = false
let orderID = ref("")
let showAssets = ref(false)
let assets = ref([] as AssetSchema[])

onBeforeMount(async ()=>{
  await Cacher.loadAllUsersFromAPISync()
  inventory = new EbayInventory(store.state.user)
  loading.value = false
})

function submit(sourceUser: User, destUser: User, transferList: CartItem[], callback: ()=>void) {
  if (processingMove)
    return
  processingMove = true;
  // Process transfer list
  let partList = inventory.getOrderList()
  if(partList.length==0&&assets.value.length==0) {
    processingMove = false
    return errorHandler("Order is empty.")
  }
  if(!window.confirm("Are you sure you want to submit?"))
    return processingMove = false
  console.log(assets.value)
  let submitAssets = []
  for (let asset of assets.value) {
    let parts = asset.parts.map((p: any)=>{
      return {nxid: p.part.nxid, serial: p.serial}
    })
    submitAssets.push({asset_tag: asset.asset_tag, parts})
  }
  // Move parts
  sellOnEbay(http, partList, submitAssets, orderID.value, (data, err) => {
    processingMove = false;
    if (err) {
      // Handle errors
      return errorHandler(err);
    }
    displayMessage(data as string);
    assets.value = []
    orderID.value = ""
    callback();
  });
}

function togglePopup() {
  showAssets.value = !showAssets.value
}

function addAsset(asset: AssetSchema) {
  for(let ass of assets.value) {
    if(ass.asset_tag==asset.asset_tag)
      return errorHandler("Asset already in list.")
  }
  getPartsOnAsset(http, asset.asset_tag!, async (data, err)=>{
    if(err)
      return errorHandler(err)
    let loadedParts = await Cacher.loadCartItems(data as CartItem[])
    asset.parts = []
    for(let part of loadedParts) {
      if(part.serial||!part.quantity) {
        asset.parts.push({ part: part.part, serial: part.serial?part.serial:"", alreadySerialized: part.serial?true:false })
        continue
      }
      for(let i = 0; i < part.quantity; i++) {
        asset.parts.push({ part: part.part, serial: "", alreadySerialized: false })
      }
    }
    assets.value.push(asset)
  })
}

function deleteAsset(asset_tag: string) {
  for(let i = 0; i < assets.value.length; i++) {
    if(assets.value[i].asset_tag==asset_tag) {
      return assets.value.splice(i,1)
    }
  }
}

</script>
<template>
  <div>
    <FullScreenPopupComponent
      v-show="showAssets"
      @toggle="togglePopup"
    >
      <AssetSearchPopupComponent
        :hideSold="true"
        @addAssetAction="addAsset"
      />
    </FullScreenPopupComponent>
    <LoaderComponent v-if="loading"/>
    <InventoryComponent
      v-else
      :inventory="inventory"
      :force-source-user="store.state.user"
      :force-dest-user="{_id: 'ebay'}"
      :submitButtonText="'Mark as sold'"
      :serialize-dest-list="true"
      :always-show-dest="true"
      @submit="submit"
    >
      <div class="mt-4 flex flex-wrap">
        <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
          Order:
        </h1>
        <input
          type="text"
          placeholder="eBay Order ID"
          v-model="orderID"
          class="textbox max-w-sm"
        />
        <div class="flex w-full mt-4">
          <h1 class="my-4 w-full text-4xl md:w-fit">
            Assets:
          </h1>
          <PlusButton @click="togglePopup"/>
        </div>
        <EbayAssetComponent
          v-if="assets.length>0"
          v-for="asset of assets"
          class="w-full"
          :asset="asset"
          @delete="deleteAsset"
        />
        <p v-else>No assets here...</p>
        <h1 class="my-2 w-full text-4xl md:mb-0 mt-4">
          Parts:
        </h1>
      </div>
    </InventoryComponent>
  </div>
</template>
