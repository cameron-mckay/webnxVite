<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onMounted, ref, watch } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetManagerComponent from '../../components/AssetComponents/AssetManagerComponent.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import { createAsset } from '../../plugins/dbCommands/assetManager';
import type {
AssetSchema,
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

let oldAsset = ref({} as AssetSchema);
let partsOnAsset = ref([] as LoadedCartItem[]);

function assetSubmit() {
  // Use create part method from API commands
  let unloadedParts = [] as CartItem[];
  // Iterate through list of parts and strip only the NXID and quantity
  for (const part of partsOnAsset.value) {
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
  createAsset(http, oldAsset.value, unloadedParts, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    router.back();
  });
}

// Clear out fields when part type is changed
onMounted(() => {
  watch(
    () => oldAsset.value.asset_type,
    () => {
      if(oldAsset.value.asset_type!='Server') {
        partsOnAsset.value = []
      }
    }
  );
  watch(()=>oldAsset.value.chassis_type, ()=>{
    if(oldAsset.value.chassis_type=='Node Chassis') {
      partsOnAsset.value = []
    }
  })
});

function plusPart(item: LoadedCartItem) {
  if (item.part.serialized) {
    // Find existing item
    partsOnAsset.value.push({
      part: item.part,
      serial: item.serial ? item.serial : '',
    });
  } else {
    // Find matching part in array 1
    let item2 = partsOnAsset.value.find((e) => e.part.nxid == item.part.nxid);
    // If it doesn't exist, push a new entry
    if (!item2) partsOnAsset.value.push({ part: item.part, quantity: 1 });
    // Otherwise increment existing entry
    else item2.quantity! += 1;
  }
}

function minusPart(item: LoadedCartItem) {
  if (item.part.serialized) {
    // Find existing item
    let i = partsOnAsset.value.indexOf(item);
    partsOnAsset.value.splice(i, 1);
  } else {
    // Find matching part in array 1
    let item2 = partsOnAsset.value.find((e) => e.part.nxid == item.part.nxid);
    // If it doesn't exist, push a new entry
    if (!item2) return;
    // Otherwise increment existing entry
    else item2.quantity! -= 1;
    if (item.quantity! < 1) {
      let i = partsOnAsset.value.indexOf(item2);
      partsOnAsset.value.splice(i, 1);
    }
  }
}

function updateQuantity(item: LoadedCartItem, quantity: number, correction: boolean) {
  item.quantity! += quantity
  if (item.part.serialized||item.quantity! < 1) {
    let i = partsOnAsset.value.indexOf(item);
    partsOnAsset.value.splice(i, 1);
  }
}

function deletePart(part: LoadedCartItem) {
  partsOnAsset.value.splice(partsOnAsset.value.indexOf(part), 1);
}
</script>

<template>
  <div
    class="background-and-border p-4"
  >
    <BackButton @click="router.back()" class="mr-2 mb-2"/>
    <AssetManagerComponent
      :http="http"
      :title="'Add Untracked Asset:'"
      :submitText="'Create Asset'"
      :strict="true"
      :oldAsset="oldAsset"
      :parts="partsOnAsset"
      :errorHandler="errorHandler"
      :displayMessage="displayMessage"
      :partSearch="true"
      :untracked="true"
      @assetSubmit="assetSubmit"
      @plusPart="plusPart"
      @minusPart="minusPart"
      @deletePart="deletePart"
      @updateQuantity="updateQuantity"
    />
  </div>
</template>
