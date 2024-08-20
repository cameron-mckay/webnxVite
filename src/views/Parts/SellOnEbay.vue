<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import {
  User,
  CartItem,
  AssetSchema,
LoadedCartItem,
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
import InlinePartSpecComponent from '../../components/PartComponents/InlinePartSpecComponent.vue';
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
let destCount = ref(0)
let assets = ref([] as AssetSchema[])

let perUnitCosts =ref([] as LoadedCartItem[])

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
  let submitAssets = []
  for (let asset of assets.value) {
    let parts = asset.parts.map((p: any)=>{
      return {nxid: p.part.nxid, serial: p.serial}
    })
    submitAssets.push({asset_tag: asset.asset_tag, parts})
  }
  let cost = perUnitCosts.value.map((v)=>{
    return { nxid: v.part.nxid!, cost: v.quantity! }
  })
  // Move parts
  sellOnEbay(http, partList, submitAssets, orderID.value, cost, (data, err) => {
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
    handleUpdate()
  })
}

function deleteAsset(asset_tag: string) {
  for(let i = 0; i < assets.value.length; i++) {
    if(assets.value[i].asset_tag==asset_tag) {
      assets.value.splice(i,1)
      return handleUpdate()
    }
  }
}

function handleUpdate() {
  let dest = inventory.getDestInv()
  assets.value.map((a)=>{
    dest = dest.concat(a.parts)
  })
  let notOnPerUnit = dest.filter((v, i, arr)=>{
    return i == arr.findIndex((p)=>p.part.nxid==v.part.nxid)
  }).filter((v)=>{
    return perUnitCosts.value.findIndex((p)=>{
      return p.part.nxid==v.part.nxid
    })==-1
  })
  perUnitCosts.value = JSON.parse(JSON.stringify(perUnitCosts.value.filter((v)=>{
    return dest.findIndex((p)=>v.part.nxid==p.part.nxid) != -1
  }).concat(notOnPerUnit))).map((p: any)=>{
      delete p.quantity
      return p
  })
  destCount.value = dest.length
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
      :bypassSerialRequirement="store.state.user.roles?.includes('bypass_ebay_serial')"
      @update="handleUpdate"
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
        <div class="w-full" v-if="destCount>0"> 
          <h1 class="text-4xl my-4">Per Unit Price:</h1>
          <div
            class="relative grid grid-cols-3 md:grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
          >
            <p class="mt-auto hidden md:block">NXID</p>
            <p class="mt-auto">Manufacturer</p>
            <p class="mt-auto">Name</p>
            <p class="mt-auto">Price</p>
          </div>
          <div class="group relative my-1" v-for="item of perUnitCosts">
            <div
              class="group-hover:bab-hover background-and-border grid p-1 text-center leading-8 grid-cols-3 md:grid-cols-4 md:p-2 md:leading-10"
            >
              <p class="hidden md:block">{{ item.part.nxid ? item.part.nxid : "PNX0000000" }}</p>
              <p class="break-words">{{ item.part.manufacturer ? item.part.manufacturer : "DELETED PART" }}</p>
              <p class="break-words">{{ item.part.name ? item.part.name : "DELETED PART" }}</p>
              <div class="flex">
              <p>$</p>
              <input
                class="textbox pl-2"
                v-model="item.quantity"
                type="number"
                min="0"
                placeholder="0.00"
                step="0.01"
              />
              </div>
            </div>
            <InlinePartSpecComponent
              class="group-hover:bab-drop-hover bab-drop relative"
              :part="item.part.type ? item.part : { type: 'DELETED', notes: 'The part info associated with this NXID has been deleted' }"
            />
          </div>
        </div>
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
