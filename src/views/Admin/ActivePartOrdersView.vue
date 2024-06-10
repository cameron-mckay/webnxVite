<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import RefreshButton from '../../components/GenericComponents/Buttons/RefreshButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import TextAreaPopupComponent from '../../components/GenericComponents/TextAreaPopupComponent.vue';
import PartOrderComponent from '../../components/PartComponents/PartOrderComponent.vue';
import type {
UserState,
PartOrderSchema,
} from '../../plugins/interfaces';
import { cancelPartOrder, getActivePartOrders } from '../../plugins/dbCommands/partManager';
import Cacher from '../../plugins/Cacher';
import { replaceLinksWithAnchors } from '../../plugins/CommonMethods';

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
let orders = ref([] as PartOrderSchema[])
let showCancelNotes = ref(false)
let currentID = ""

onBeforeMount(()=>{
  loadQueue()
})

function loadQueue() {
  loading.value = true
  orders.value = []
  // Get checkout queue
  getActivePartOrders(http, async (data, err) => {
    if(err)
      return
    // Load the requests
    orders.value = data as PartOrderSchema[]
    // Load part info
    for(let o of orders.value) {
      await Promise.all(o.ordered_parts.map((p)=>{
        // Save nxid to set for getting kiosk quantities
        return Cacher.getPartInfo(p)
      }))
    }
    loading.value = false
    setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
  })
}

function cancelPressed(id: string) {
  showCancelNotes.value = true
  currentID = id
}

function toggle() {
  showCancelNotes.value = false
}

function cancel(notes: string) {
  cancelPartOrder(http, currentID, notes, (data, err) => {
    if(err)
      return errorHandler(err)
    toggle()
    displayMessage(data as string)
    loadQueue()
  })
}

function receive(id: string) {
  router.push({name: "Receive Part Order", query: {id}})

}

</script>
<template>
  <div>
    <TextAreaPopupComponent
      v-if="showCancelNotes"
      title="Cancel Notes:"
      placeholder="Notes go here.  Drag to expand..."
      @submit="cancel"
      @toggle="toggle"
    />
    <div class="flex mb-4">
      <h1 class="my-auto text-4xl">Part Orders</h1>
      <RefreshButton class="ml-2" @click="loadQueue"/>
    </div>

    <RouterLink
      class="cursor-pointer text-sm rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none mr-2"
      to="/orders/create"
    >
      Create Order
    </RouterLink>
    <RouterLink
      class="cursor-pointer text-sm rounded-md p-2 font-bold hover:bg-gray-400 hover:dark:bg-zinc-700 background-and-border hover:bab-hover hover:rounded-bl-md hover:transition-none"
      to="/orders/received"
    >
      View Past Orders
    </RouterLink>
    <LoaderComponent v-if="loading"/>
    <div v-else-if="orders.length == 0">
      <p class="mt-4">List is empty...</p>
    </div>
    <div v-else>
      <PartOrderComponent
        v-for="order of orders"
        :order="order"
        :key="order.date_created+order.created_by"
        :part-map="Cacher.getPartCache()"
        @cancel="cancelPressed(order._id!)"
        @received="receive(order._id!)"
      />
    </div>
  </div>
</template>
