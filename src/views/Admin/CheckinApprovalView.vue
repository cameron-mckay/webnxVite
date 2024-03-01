<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import CheckInRequestComponent from '../../components/KioskComponents/CheckInRequestComponent.vue';
import RefreshButton from '../../components/GenericComponents/Buttons/RefreshButton.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import type {
UserState,
CheckInRequest,
User,
PartSchema
} from '../../plugins/interfaces';
import { getCheckInQueue, getPartByID, processCheckInRequest } from '../../plugins/dbCommands/partManager';
import { getAllUsers } from '../../plugins/dbCommands/userManager';

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
let checkInQueue = ref([] as CheckInRequest[])
let kiosks = ref([] as User[])
let users = new Map<string, User>()
let partsMap = new Map<string, PartSchema>()

onBeforeMount(()=>{
  loadQueue()
  const bc = new BroadcastChannel("nx-push")
  bc.onmessage = (event) => {
    if(checkInQueue.value.length==0)
      loadQueue()
  }

  const payloadChannel = new BroadcastChannel("nx-payload")
  payloadChannel.onmessage = (event) => {
    const data = event.data
    console.log(data)
    if(data.type=="partRequestRemoved") {
      let index = checkInQueue.value.findIndex((e)=>{
        console.log("Request time: "+e.date.toISOString())
        return e.date.toISOString() == data.date && e.by == data.by
      })
      if(index>=0) {
        checkInQueue.value.splice(index, 1)
        displayMessage("A fulfilled request was removed from the list.")
      }
    }
  }

})

function loadQueue() {
  checkInQueue.value = []
  loading.value = true
  getCheckInQueue(http, async (data, err) => {
    if(err) {
      return errorHandler("Failed to fetch queue.")
    }
    // Load all users now.
    let queue = data as CheckInRequest[]
    // Get all parts and map
    // Evil promise code
    await Promise.all(queue.map((r)=>{
      return Promise.all(r.parts.map((p)=>{
        return new Promise((res)=>{
          if(partsMap.has(p.nxid))
            res("")
          getPartByID(http, p.nxid, 3, (data, err) => {
            if(err)
              partsMap.delete(p.nxid)
            partsMap.set(p.nxid, data as PartSchema)
            res("")
          })
        })
      }))
    }))
    // Get all users
    getAllUsers(http, (data, err) => {
      if(err) {
        return errorHandler("Could not load users.")
      }
      // Temporary array
      let allUsers = data as User[]
      // Process all users
      kiosks.value = []
      for (let u of allUsers) {
        // Check if kiosk
        if(u.roles&&u.roles.includes("is_kiosk")) {
          // Push to kiosks array
          kiosks.value.push(u)
        }
        // Set user map
        users.set(u._id!, u)
      }
      // Push check in queue to ref
      loading.value = false
      checkInQueue.value = queue
    })
  })
}

function submit(req: CheckInRequest) {
  // Quick local validity check
  for (let p of req.parts) {
    // Check if everything has been approved/denied
    if(p.approved==undefined&&p.approvedCount==undefined)
      return errorHandler(p.nxid + " has not been approved or denied")
    // Check if new location exists
    if((p.approved||(p.approvedCount&&p.approvedCount>1))&&(p.newLocation==undefined||p.newLocation==""))
      return errorHandler(p.nxid+" needs a new location.")
  }
  // Send request to API
  processCheckInRequest(http, req, (data, err)=>{
    if(err)
      return errorHandler(err)
    displayMessage(data as string)
    checkInQueue.value.splice(checkInQueue.value.findIndex((e)=>e.by==req.by&&e.date==req.date), 1)
  })
}

</script>
<template>
  <div>
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/manage')" class="mr-2 mb-2"/>
    <div class="flex">
      <h1 class="my-auto text-4xl">Check In Queue</h1>
      <RefreshButton class="ml-2" @click="loadQueue"/>
    </div>
    <LoaderComponent v-if="loading"/>
    <CheckInRequestComponent v-for="request of checkInQueue" :key="request.by+request.date" :request="request" :kiosks="kiosks" :user="users.get(request.by)!" :parts="partsMap" @submit="submit"/>
    <p class="mt-4" v-if="checkInQueue.length<1&&!loading">Queue is empty and will auto refresh when a new request is received...</p>
  </div>
</template>
