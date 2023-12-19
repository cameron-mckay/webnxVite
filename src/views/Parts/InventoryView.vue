<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
import { movePart } from '../../plugins/dbCommands/partManager';

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
let processingMove = false

onMounted(()=>{
  inventory = new Inventory(JSON.parse(JSON.stringify(store.state.user)),
    // Source users
    [
      {_id: 'all', first_name: "All Techs"},

    ],
    // Dest users
    [
      {_id: 'all', first_name: "All Techs", default: true},
      {_id: 'hdd', first_name: "Drive Wipe Shelf"},
      {_id: 'testing', first_name: "Testing Center"}
    ],
    // Admin sources
    [
      {_id: 'ny', first_name: "NY Transfers"},
      {_id: 'la', first_name: "LA Transfers"},
      {_id: 'og', first_name: "Ogden Transfers"},
      {_id: 'testing', first_name: "Testing Center"},
      {_id: 'hdd', first_name: "Drive Wipe Shelf"},
    ],
    // Admin destinations
    [
      {_id: 'ny', first_name: "NY Transfers"},
      {_id: 'la', first_name: "LA Transfers"},
      {_id: 'og', first_name: "Ogden Transfers"},
      {_id: 'deleted', first_name: "Deleted"},
      {_id: 'lost', first_name: "Lost"},
      {_id: 'broken', first_name: "Broken"},
    ]
  )
  loading.value = false
})

function submit(sourceUser: User, destUser: User, transferList: CartItem[], callback: () =>void) {
  if (!processingMove) {
    processingMove = true;
    // Move parts
    movePart(http, destUser._id!, sourceUser._id!, transferList, (data, err) => {
      processingMove = false;
      if (err) {
        return errorHandler(err);
      }
      displayMessage(data as string);
      callback()
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
      @submit="submit"
    />
  </div>
</template>
