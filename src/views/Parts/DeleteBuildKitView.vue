<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import type {
  BuildKitSchema,
  CartItem,
  InventoryEntry,
  KioskQuantity,
  LoadedCartItem,
  User,
  UserState,
} from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';
import { createBuildKit, deleteBuildKit, getBuildKitByID } from '../../plugins/dbCommands/partManager';
import Cacher from '../../plugins/Cacher';
import BuildKitPartComponent from '../../components/AdminComponents/BuildKitPartComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';

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
// FUCK YOU IM NOT NAMING THIS
let otherSerialMap = new Map<string, User>()
let kiosks = ref([] as User[])
let buildKit = ref({} as BuildKitSchema)
let loadedParts = ref([] as LoadedCartItem[])
let loading = ref(true)

onBeforeMount(async () => {
  // Check for kit ID
  if (router.currentRoute.value.query.id) {
    // Get kit ID from router
    let kit_id = router.currentRoute.value.query.id as string;
    await Cacher.loadAllUsersFromAPISync()
    // Get current user
    let currentUser = Cacher.getCurrentUser()
    // Load kiosks
    kiosks.value = (Cacher.getKiosks().filter((u)=>{
      return u.building == currentUser.building
    }) as User[])
    // Get the build kit by ID
    getBuildKitByID(http, kit_id, async (data, err) => {
      if(err)
        return errorHandler(err)
      // Set build kit
      buildKit.value = data as BuildKitSchema
      // Load all parts
      loadedParts.value = await Cacher.loadCartItems(buildKit.value.parts!)
      for(let p of loadedParts.value) {
        if(p.quantity) {
          let kq = kiosks.value.map((k)=>{
            return {
              kiosk: k.first_name + " " + k.last_name,
              quantity: p.quantity,
              max: p.quantity
            } as KioskQuantity
          })
          quantityMap.set(p.part.nxid!, kq)
        }
      }
      loading.value = false
    })
  }
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
  })
}

function updateSliders(nxid: string, quantities: KioskQuantity[], serials: string[]) {
  quantityMap.set(nxid, quantities)
  serialMap.set(nxid, serials)
}

function updateSingleSerialized(nxid: string, serial: string, kiosk: User) {
  otherSerialMap.set(nxid+serial, kiosk)
}

function deleteKit() {
  // Check if already processing
  if(processingSubmission)
    return
  // Set flag
  processingSubmission = true
  // Create flag for errors
  let error = false
  let locationsMap = new Map<string, CartItem[]>()
  // Map inventory to a usable list
  loadedParts.value.map((p)=>{
    let arr = []
    if(p.serial) {
      let kiosk = otherSerialMap.get(p.part.nxid+p.serial)
      if(!kiosk) {
        errorHandler("Location not selected for "+p.part.nxid+" with serial number: "+p.serial)
        error = true
      }
      let location = kiosk?.first_name + " " + kiosk?.last_name
      arr = locationsMap.has(location) ? locationsMap.get(location)! : []
      arr.push({nxid: p.part.nxid!, serial: p.serial})
      locationsMap.set(location, arr)
    }
    else {
      let kiosk_quantities = quantityMap.has(p.part.nxid!) ? quantityMap.get(p.part.nxid!)! : []
      for(let kq of kiosk_quantities) {
        if(kq.quantity==0)
          continue
        if(kq.kiosk=="Unsorted") {
          error = true
          errorHandler(p.part.nxid + " has unsorted parts.")
        }
        arr = locationsMap.has(kq.kiosk) ? locationsMap.get(kq.kiosk)! : []
        arr.push({nxid: p.part.nxid!, quantity: kq.quantity})
        locationsMap.set(kq.kiosk, arr)
      }
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
  
  deleteBuildKit(http, buildKit.value._id, finalReq, (data, err) => {
    processingSubmission = false
    if(err)
      return errorHandler(err)
    displayMessage(data as string)
    router.push({name: "Build Kit Search"})
  })
}

</script>
<template>
  <LoaderComponent v-if="loading"/>
  <form
    @submit.prevent="deleteKit"
    v-else
    class="background-and-border p-4"
  >
    <PageHeaderWithBackButton :router="router" prev-path="/assets" >Delete Build Kit</PageHeaderWithBackButton>

    <div class="flex">
      <p class="detail-label">Kit Name:</p>
      <p class="detail-data ml-2">{{ buildKit.kit_name }}</p>
    </div>
    <div class="flex">
      <p class="detail-label">Kiosk:</p>
      <p class="detail-data ml-2">{{ buildKit.kiosk }}</p>
    </div>
      <h1 class="my-4 text-xl font-bold">Notes:</h1>
      <p>{{ buildKit.notes }}</p>
    <div>
      <div
        class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 group-hover:rounded-bl-none group-hover:bg-zinc-400 group-hover:shadow-lg md:grid-cols-5 md:leading-10"
      >
        <p class="hidden md:block">NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p>Quantity/SN</p>
        <p></p>
      </div>
      <BuildKitPartComponent
        class="col-span-2"
        v-for="part in loadedParts"
        :item="part"
        :maxQuantity="part.part.quantity!"
        :kiosk_quantities="quantityMap"
        :kiosks="kiosks"
        :hide-buttons="true"
        @update="updateSliders"
        @update-serialized="updateSingleSerialized"
      />
    </div>
    <input
      class="block submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700 mx-auto mt-4"
      type="submit"
      value="Delete"
    />
  </form>
</template>
