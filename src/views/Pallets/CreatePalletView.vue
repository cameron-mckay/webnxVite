<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onMounted, ref, watch } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import PalletManagerComponent from '../../components/PalletComponents/PalletManagerComponent.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import { createPallet } from '../../plugins/dbCommands/palletManager';
import type {
PalletSchema,
CartItem,
LoadedCartItem,
UserState,
} from '../../plugins/interfaces';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let palletRef = ref({} as PalletSchema);
let partsOnPallet = ref([] as LoadedCartItem[]);
let processingSubmission = false

function palletSubmit(assets: string) {
  if(processingSubmission)
    return
  processingSubmission = true
  // Use create part method from API commands
  let unloadedParts = [] as CartItem[];
  // Iterate through list of parts and strip only the NXID and quantity
  for (const part of partsOnPallet.value) {
    if (part.serial) {
      unloadedParts.push({
        nxid: part.part.nxid as string,
        serial: part.serial,
      });
    } else {
      unloadedParts.push({
        nxid: part.part.nxid as string,
        quantity: part.quantity,
      });
    }
  }
  createPallet(http, palletRef.value, unloadedParts, assets, (data, err) => {
    processingSubmission = false
    if (err) {
      return errorHandler(err);
    }
    router.back();
  });
}

function plusPart(item: LoadedCartItem) {
  if (item.part.serialized) {
    // Find existing item
    partsOnPallet.value.push({
      part: item.part,
      serial: item.serial ? item.serial : '',
    });
  } else {
    // Find matching part in array 1
    let item2 = partsOnPallet.value.find((e) => e.part.nxid == item.part.nxid);
    // If it doesn't exist, push a new entry
    if (!item2) partsOnPallet.value.push({ part: item.part, quantity: 1 });
    // Otherwise increment existing entry
    else item2.quantity! += 1;
  }
}

function minusPart(item: LoadedCartItem) {
  if (item.part.serialized) {
    // Find existing item
    let i = partsOnPallet.value.indexOf(item);
    partsOnPallet.value.splice(i, 1);
  } else {
    // Find matching part in array 1
    let item2 = partsOnPallet.value.find((e) => e.part.nxid == item.part.nxid);
    // If it doesn't exist, push a new entry
    if (!item2) return;
    // Otherwise increment existing entry
    else item2.quantity! -= 1;
    if (item.quantity! < 1) {
      let i = partsOnPallet.value.indexOf(item2);
      partsOnPallet.value.splice(i, 1);
    }
  }
}

function updateQuantity(item: LoadedCartItem, quantity: number) {
  item.quantity! += quantity
  if (item.part.serialized||item.quantity! < 1) {
    let i = partsOnPallet.value.indexOf(item);
    partsOnPallet.value.splice(i, 1);
  }
}

function deletePart(part: LoadedCartItem) {
  partsOnPallet.value.splice(partsOnPallet.value.indexOf(part), 1);
}
</script>

<template>
  <div
    class="background-and-border p-4"
  >
    <BackButton @click="router.back()" class="mr-2 mb-2"/>
    <PalletManagerComponent
      :http="http"
      :title="'Create Pallet:'"
      :untracked="true"
      :submitText="'Create Pallet'"
      :strict="true"
      :palletRef="palletRef"
      :parts="partsOnPallet"
      :assets="[]"
      :errorHandler="errorHandler"
      :displayMessage="displayMessage"
      :partSearch="true"
      @palletSubmit="palletSubmit"
      @plusPart="plusPart"
      @minusPart="minusPart"
      @deletePart="deletePart"
      @updateQuantity="updateQuantity"
    />
  </div>
</template>
