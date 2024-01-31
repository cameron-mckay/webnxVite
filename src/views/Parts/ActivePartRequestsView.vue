<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import RefreshButton from '../../components/GenericComponents/Buttons/RefreshButton.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import ReadOnlyPartRequestComponent from '../../components/KioskComponents/ReadOnlyPartRequestComponent.vue';
import type {
UserState,
PartRequestSchema,
} from '../../plugins/interfaces';
import { getActivePartRequests, cancelPartRequest } from '../../plugins/dbCommands/partManager';
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
let requests = ref([] as PartRequestSchema[])

onBeforeMount(()=>{
  loadQueue()
})

function loadQueue() {
  loading.value = true
  requests.value = []
  // Get checkout queue
  getActivePartRequests(http, async (data, err) => {
    if(err)
      return
    // Load the requests
    requests.value = data as PartRequestSchema[]
    // Load part info
    for(let r of requests.value) {
      await Promise.all(r.parts.map((p)=>{
        // Save nxid to set for getting kiosk quantities
        return Cacher.getPartInfo(p)
      }))
    }
    loading.value = false
  }, store.state.user._id)
}

function cancel(id: string) {
  cancelPartRequest(http, id, (data, err) => {
    if(err)
      return errorHandler(err)
    displayMessage(data as string)
  })
}

</script>
<template>
  <div>
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/manage')" class="mr-2 mb-2"/>
    <div class="flex">
      <h1 class="my-auto text-4xl">Active Part Requests</h1>
      <RefreshButton class="ml-2" @click="loadQueue"/>
    </div>
    <LoaderComponent v-if="loading"/>
    <div v-else-if="requests.length == 0">
      <p class="mt-4">List is empty...</p>
    </div>
    <div v-else>
      <ReadOnlyPartRequestComponent
        v-for="request of requests"
        :key="request.date_created+request.requested_by"
        :request="request"
        @cancel="cancel(request._id!)"
      />
    </div>
  </div>
</template>
