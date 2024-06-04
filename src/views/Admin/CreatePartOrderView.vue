<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type {
CartItem,
  UserState,
} from '../../plugins/interfaces';
import AssetPartInventoryComponent from '../../components/AssetComponents/AssetPartInventoryComponent.vue';
import Inventory from '../../plugins/InventoryClass';
import { createPartOrder } from '../../plugins/dbCommands/partManager';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, store, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS

let processing = false
let notes = ref("")
let inventory = new Inventory(store.state.user)

onBeforeMount(() => {
  inventory.setCorrection(true)
})

function localCreatePartOrder() {
  if(processing)
    return
  processing = true
  let unloadedParts = inventory.getDestInv().map((p)=>{
    return {nxid: p.part.nxid, quantity: p.quantity} as CartItem
  })
  createPartOrder(http, unloadedParts, notes.value, (data, err)=>{
    processing = false
    if(err)
      return errorHandler(err)
    inventory.clearDestInv()
    notes.value = ""
    displayMessage(data as string)
  })
}

</script>
<template>
  <form @submit.prevent="localCreatePartOrder">
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/orders')" class="mr-2 mb-2"/>
    <AssetPartInventoryComponent
      :untracked="true"
      :inventory="inventory"
      title="Create Part Order:"
    />

    <div class="col-span-2 my-4">
      <!-- -->
      <h1 class="inline-block text-4xl leading-8 md:leading-10">Notes:</h1>
      <textarea
        class="textbox m-1 h-40"
        v-model="notes"
        placeholder="Drag to resize"
      />
      <!-- -->
    </div>
    <div class="flex justify-center">
      <input type="submit" class="submit mx-1" value="Submit" />
    </div>
  </form>
</template>
