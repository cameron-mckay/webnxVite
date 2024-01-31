<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import type {
  BuildKitSchema,
  InventoryEntry,
  KioskQuantity,
  User,
  UserState,
} from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';
import BuildKitManager from '../../components/AdminComponents/BuildKitManager.vue';
import BuildKitInventoryComponent from '../../components/AdminComponents/BuildKitInventoryComponent.vue';
import { createBuildKit } from '../../plugins/dbCommands/partManager';
import Cacher from '../../plugins/Cacher';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, router, store, errorHandler, displayMessage } =
  defineProps<Props>();

let processingSubmission = false
let inventory = new Inventory(store.state.user)
let quantityMap = new Map<string, KioskQuantity[]>()
let serialMap = new Map<string, string[]>()
let kiosks = ref([] as User[])

onBeforeMount(async () => {
  let currentUser = Cacher.getCurrentUser()
  kiosks.value = (Cacher.getKiosks().filter((u)=>{
    return u.building == currentUser.building
  }) as User[])
  inventory.setCorrection(true)
});

function submit(kit: BuildKitSchema) {
  // Check if already processing
  if(processingSubmission)
    return
  // Set flag
  processingSubmission = true
  // Create flag for errors
  let error = false
  let locationsMap = new Map<string, InventoryEntry[]>()
  // Map inventory to a usable list
  inventory.getDestInv().map((p)=>{
    // Get serials array
    let allSerials = (serialMap.has(p.part.nxid!) ? serialMap.get(p.part.nxid!) : [])?.filter((s)=>s!="")!
    // Get quantities array
    let quantities = (quantityMap.has(p.part.nxid!) ? quantityMap.get(p.part.nxid!)! : []).filter((q)=>q.quantity>0)
    // Index of the serial array
    let i = 0
    // Loop through all the kiosk quantities
    for(let kq of quantities) {
      if(kq.kiosk=="Unsorted") {
        error = true
        errorHandler(p.part.nxid + " has unsorted parts.")
      }
      // Array for the cart items
      let arr = [] as InventoryEntry[]
      // If the map already has location
      if(locationsMap.has(kq.kiosk)) {
        // Fetch existing array
        arr = locationsMap.get(kq.kiosk)!
      }
      // Number of parts pushed to array
      let q = 0
      let serials = [] as string []
      // If the serial index is still less than the length
      if(i<allSerials.length) {
        // While index less than serial length and quantity is less than total
        while(i<allSerials.length&&q<kq.quantity) {
          // Push serial at index
          serials.push(allSerials[i])
          // Increment vars
          i++
          q++
        }
      }
      // Push them as cart items
      arr.push({nxid: p.part.nxid, unserialized: kq.quantity, serials: [], newSerials: serials})
      // Save the array to map
      locationsMap.set(kq.kiosk, arr)
    }
  })
  // Unsorted parts - cancel submission
  if(error) {
    processingSubmission = false
    return
  }
  // Create final request array
  let finalReq = [] as any[]
  // Convert map entries to object
  locationsMap.forEach((v, k) => {
    finalReq.push({kiosk: k, parts: v})
  })
  // Send to API here
  createBuildKit(http, kit.kit_name, finalReq, kit.kiosk, kit.notes, (data, err) => {
    processingSubmission = false
    if(err)
      return errorHandler(err)
    displayMessage(data as string)
    router.push({name: "Build Kit Search"})
  })
}

async function reset() {
  inventory.clearDestInv()
  quantityMap.clear()
  serialMap.clear()
}

function updateSliders(nxid: string, quantities: KioskQuantity[], serials: string[]) {
  quantityMap.set(nxid, quantities)
  serialMap.set(nxid, serials)
}

</script>
<template>
  <div
    class="background-and-border p-4"
  >
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/assets')" class="mr-2 mb-2"/>
    <BuildKitManager
      title="Create Build Kit"
      submit-text="Create"
      :strict="true"
      :old-kit="{}"
      :untracked="true"
      :kiosks="kiosks"
      @kit-submit="submit"
      @kit-reset="reset"
    >
      <BuildKitInventoryComponent
        :inventory="inventory"
        :untracked="true"
        @update="updateSliders"
      />
    </BuildKitManager>
  </div>
</template>
