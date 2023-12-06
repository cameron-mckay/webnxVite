<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import {
  User,
  CartItem
} from '../../plugins/interfaces';

import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';
import InventoryComponent from '../../components/InventoryComponents/InventoryComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import { checkin, movePart } from '../../plugins/dbCommands/partManager';

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

let inventory:Inventory;
let loading = ref(true);
let processingCheckin = false

onBeforeMount(async ()=>{
  inventory = new Inventory(store.state.user)
  loading.value = false
})

function submit(sourceUser: User, destUser: User, transferList: CartItem[], callback: ()=>void) {
  if (!processingCheckin) {
    processingCheckin = true;
    // Move parts
    checkin(http, transferList, sourceUser._id!, (data, err) => {
      processingCheckin = false;
      if (err) {
        return errorHandler(err);
      }
      displayMessage('Successfully checked in.');
      callback();
    });
  }
}

</script>
<template>
  <div>
    <LoaderComponent v-if="loading"/>
    <InventoryComponent
      v-else
      :inventory="inventory"
      :force-dest-user="{_id: 'ebay'}"
      :submitButtonText="'Check In'"
      :override-source-text="'Inventory: '"
      @submit="submit"
    >
      <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
        Checking In: 
      </h1>
    </InventoryComponent>
  </div>
</template>
