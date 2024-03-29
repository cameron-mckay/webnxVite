<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import CheckoutRequestComponent from '../../components/KioskComponents/CheckoutRequestComponent.vue';
import RefreshButton from '../../components/GenericComponents/Buttons/RefreshButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import type {
  UserState,
  PartRequestSchema,
  KioskQuantities,
  KioskQuantity,
  InventoryEntry,
  BuildKitSchema
} from '../../plugins/interfaces';
import { getKioskQuantities, getActivePartRequests, fulfillPartRequest, getBuildKitByID, processBuildKitRequest } from '../../plugins/dbCommands/partManager';
import Cacher from '../../plugins/Cacher';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let loading = ref(false)
let processing = false
let requests = ref([] as PartRequestSchema[])
let quantityMap = new Map<string, KioskQuantity[]>()
let buildKits = new Map<string, BuildKitSchema>()

onBeforeMount(()=>{
  loadQueue()
  const payloadChannel = new BroadcastChannel("nx-payload")
  payloadChannel.onmessage = (event) => {
    const data = event.data
    if(data.type=="partRequestRemoved") {
      let index = requests.value.findIndex((e)=>{
        return e._id == data.id
      })
      if(index>=0) {
        requests.value.splice(index, 1)
        displayMessage("A fulfilled request was removed from the list.")
      }
    }
  }
  // Autorefresh on notification
  const notificationChannel = new BroadcastChannel("nx-notification")
  notificationChannel.onmessage = () => {
    if(requests.value.length==0)
      loadQueue()
  }
})

function loadBuildKit(kit_id: string) {
  return new Promise<BuildKitSchema>((res) => {
    getBuildKitByID(http, kit_id, (data, err) => {
      if(err)
        res({} as BuildKitSchema)
      res(data as BuildKitSchema)
    })
  })
}

function loadQueue() {
  loading.value = true
  requests.value = []
  let partSet = new Set<string>()
  // Get checkout queue
  getActivePartRequests(http, async (data, err) => {
    if(err)
      return
    // Load the requests
    requests.value = data as PartRequestSchema[]
    // Load part info
    for(let r of requests.value) {
      // Check for build kit
      if(r.build_kit_id) {
        let kit = await loadBuildKit(r.build_kit_id)
        buildKits.set(r.build_kit_id, kit)
        r.parts = kit.parts!
      }
      await Promise.all(r.parts.map(async (p)=>{
        // Save nxid to set for getting kiosk quantities
        partSet.add(p.nxid)
        return Cacher.getPartInfo(p)
      }))
    }
    // Load kiosk quantities
    getKioskQuantities(http, Array.from(partSet), (data, err) => {
      if(err)
        return
      // Save to var
      let quantities = data as KioskQuantities[]
      // Iterate and create map
      for (let q of quantities) {
        quantityMap.set(q.nxid, q.kiosk_quantities)
      }
      // Page is loaded
      loading.value = false
    })
  })
}

function submit(request_id: string, req: KioskQuantities[], notes: string) {
  if(processing)
    return
  processing = true
  let locationsMap = new Map<string, InventoryEntry[]>()
  // Loop trhough all the parts
  for(let part of req) {
    // Filter out blank serials
    part.serials = part.serials ? part.serials.filter((s)=>s!="") : []
    // Index for the serial array
    let i = 0
    // Loop through all the kiosk quantities
    for(let kq of part.kiosk_quantities) {
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
      if(i<part.serials.length) {
        // While index less than serial length and quantity is less than total
        while(i<part.serials.length&&q<kq.quantity) {
          // Push serial at index
          serials.push(part.serials[i])
          // Increment vars
          i++
          q++
        }
      }
      // Push them as cart items
      arr.push({nxid: part.nxid, unserialized: kq.quantity, serials: [], newSerials: serials})
      // Save the array to map
      locationsMap.set(kq.kiosk, arr)
    }
  }
  // Create final request array
  let finalReq = [] as any[]
  // Convert map entries to objects
  locationsMap.forEach((v, k) => {
    finalReq.push({kiosk: k, parts: v})
  })
  // Send to API here
  fulfillPartRequest(http, request_id, finalReq, notes, true, (data, err)=>{
    processing = false
    if(err)
      return errorHandler(err)
    displayMessage(data as string)
    loadQueue()
  })

}

function approve(req: PartRequestSchema, notes: string) {
  processBuildKitRequest(http, req._id!, notes, true, (data, err) => {
    if(err)
      return errorHandler(err)
    displayMessage(data as string)
    loadQueue()
  })
}

function deny(req: PartRequestSchema, notes: string) {
  if(req.build_kit_id)
    processBuildKitRequest(http, req._id!, notes, false, (data, err) => {
      if(err)
        return errorHandler(err)
      displayMessage(data as string)
      loadQueue()
    })
  else
    fulfillPartRequest(http, req._id!, [], notes, false, (data, err)=>{
      processing = false
      if(err)
        return errorHandler(err)
      displayMessage(data as string)
      loadQueue()
    })
}

</script>
<template>
  <div>
    <div class="flex">
      <h1 class="my-auto text-4xl">Part Request Queue</h1>
      <RefreshButton class="ml-2" @click="loadQueue"/>
    </div>
    <LoaderComponent v-if="loading"/>
    <div v-else>
      <CheckoutRequestComponent
        v-for="request of requests"
        :key="request.date_created+request.requested_by"
        :request="request"
        :kiosk_quantities="quantityMap"
        :kit="buildKits.get(request.build_kit_id!)"
        @submit="submit"
        @approve="(notes: string)=>{approve(request, notes)}"
        @deny="(notes: string)=>{deny(request, notes)}"
      />
    </div>
    <p class="mt-4" v-if="requests.length<1&&!loading">Queue is empty and will auto refresh when a new request is received...</p>
  </div>
</template>
