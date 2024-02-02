<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { KioskQuantities, KioskQuantity, LoadedCartItem, PartSchema } from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import SearchPartOnAssetComponent from '../AssetComponents/SearchPartOnAssetComponent.vue';
import BuildKitPartComponent from './BuildKitPartComponent.vue';
import Cacher from '../../plugins/Cacher';
import { getKioskQuantities } from '../../plugins/dbCommands/partManager';

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
let quantityMap = new Map<string, KioskQuantity[]>()
let emit = defineEmits(['update'])

onBeforeMount(()=>{
  inventory.registerRefreshCallback(refreshInv)
  refreshInv()
})

function moveToDestList(part: PartSchema, difference: number, serial?: string) {
  // User the helper function
  inventory.moveToDestList(part, difference, serial)
}

function moveToSourceList(part: PartSchema, difference: number, serial?: string) {
  // Use the helper function
  inventory.moveToSourceList(part, difference, serial)
}

// Uses the loader to force a component refresh
async function refreshInv() {
  // Set loader
  loading.value = true
  // This is hacky and stupid but this is what makes the asset inv load properly
  togglePopup()
  togglePopup()
  // Get inventories from helper class
  invParts.value = inventory.getSourceInv()
  assetParts.value = inventory.getDestInv()
  key.value = Date.now()

  let partSet = new Set<string>()
  // Load part info
  for(let r of assetParts.value) {
    partSet.add(r.part.nxid!)
    await Cacher.getPartInfo(r.part.nxid!)
  }
  loading.value = false
}

function togglePopup() {
  showPopup.value = !showPopup.value
}

function addPartFromSearch(part: PartSchema) {
  getKioskQuantities(Cacher.getHttp(), [part.nxid!], (data, err) => {
    if(err)
      return
    // Save to var
    let quantities = data as KioskQuantities[]
    // Iterate and create map
    for (let q of quantities) {
      quantityMap.set(q.nxid, q.kiosk_quantities)
    }
    // Page is loaded
    moveToDestList(part, -1)
  })
}

function updateSliders(nxid: string, quantities: KioskQuantity[], serials: string[]) {
  emit("update", nxid, quantities, serials)
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
        :showQuantity="true"
      />
    </FullScreenPopupComponent>
    <div>
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
      <BuildKitPartComponent
        class="col-span-2"
        v-for="part in assetParts"
        :key="key+assetParts.indexOf(part)"
        :untracked="untracked"
        :item="part"
        :maxQuantity="part.part.quantity!"
        :kiosk_quantities="quantityMap"
        @move-part="moveToSourceList"
        @update="updateSliders"
      />
    </div>
  </div>
</template>
