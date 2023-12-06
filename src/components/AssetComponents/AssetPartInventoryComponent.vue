<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import { LoadedCartItem, PartSchema } from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
import InventoryPopup from '../InventoryComponents/InventoryPopup.vue';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import AssetCartItemComponent from './AssetCartItemComponent.vue';
import SearchPartOnAssetComponent from './SearchPartOnAssetComponent.vue';

interface Props {
  inventory: Inventory;
  correction?: boolean;
  untracked?: boolean;
}

let { inventory, correction, untracked } = defineProps<Props>()

let loading = ref(true)
let invParts = ref([] as LoadedCartItem[])
let assetParts = ref([] as LoadedCartItem[])
let showPopup = ref(false)
let key = ref(Date.now())

onBeforeMount(()=>{
  inventory.registerRefreshCallback(refreshInv)
  refreshInv()
})

function moveToDestList(part: PartSchema, difference: number, serial?: string) {
  console.log(part)
  // User the helper function
  inventory.moveToDestList(part, difference, serial)
}

function moveToSourceList(part: PartSchema, difference: number, serial?: string) {
  // Use the helper function
  inventory.moveToSourceList(part, difference, serial)
}

// Uses the loader to force a component refresh
function refreshInv() {
  // Set loader
  loading.value = true
  // This is hacky and stupid but this is what makes the asset inv load properly
  togglePopup()
  togglePopup()
  // Get inventories from helper class
  invParts.value = inventory.getSourceInv()
  assetParts.value = inventory.getDestInv()
  key.value = Date.now()
  // Unset loaer
  loading.value = false
}

function togglePopup() {
  showPopup.value = !showPopup.value
}

function addPartFromSearch(part: PartSchema) {
  moveToDestList(part, -1, part.serialized?"":undefined)
}
</script>
<template>
  <div class="col-span-2">
    <div class="flex">
      <h1 class="inline-block text-4xl leading-8 md:leading-10">Parts:</h1>
      <!-- Plus -->
      <PlusButton @click="togglePopup"/>
    </div>
    <FullScreenPopupComponent
      v-if="correction || untracked"
      v-show="showPopup"
      @toggle="togglePopup"
    >
      <SearchPartOnAssetComponent
        @addPartAction="addPartFromSearch"
      />
    </FullScreenPopupComponent>
    <FullScreenPopupComponent
      v-else
      v-show="showPopup"
      @toggle="togglePopup"
    >
      <InventoryPopup
        @movePart="moveToDestList"
        :inventory="invParts"
        :key="key"
      />
    </FullScreenPopupComponent>
    <p class="my-2 w-full rounded-md bg-red-400 p-2" v-if="correction">
      You are in correction mode.  Any parts added here will be treat as new inventory and removed parts will be marked as deleted.  
    </p>
    <div
      v-if="(assetParts.length > 0)"
      class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 group-hover:rounded-bl-none group-hover:bg-zinc-400 group-hover:shadow-lg md:grid-cols-5 md:leading-10"
    >
      <p class="hidden md:block">NXID</p>
      <p>Manufacturer</p>
      <p>Name</p>
      <p>Quantity/SN</p>
      <p></p>
    </div>
    <div v-else class="my-2">
      <p>No parts yet..</p>
    </div>
    <AssetCartItemComponent
      class="col-span-2"
      v-for="part in assetParts"
      :key="key+assetParts.indexOf(part)"
      :item="part"
      :maxQuantity="correction?undefined:inventory.getMaxQuantity(part.part.nxid!)"
      :untracked="correction||untracked"
      @move-part="moveToSourceList"
    />
  </div>
</template>
