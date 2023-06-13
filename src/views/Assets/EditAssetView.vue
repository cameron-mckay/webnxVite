<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetManagerComponent from '../../components/AssetComponents/AssetManagerComponent.vue';
import {
  getAssetByID,
  getPartsOnAsset,
  updateAsset,
} from '../../plugins/dbCommands/assetManager';
import { getUserInventory } from '../../plugins/dbCommands/userManager';
import type {
  AssetSchema,
  CartItem,
  LoadedCartItem,
  PartSchema,
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
let assetCopy = {} as AssetSchema;
let partsOnAsset = ref([] as LoadedCartItem[]);
let partsOnAssetCopy = [] as AssetSchema[];
let inventory = ref([] as LoadedCartItem[]);
let inventoryCopy = [] as LoadedCartItem[];

onBeforeMount(() => {
  if (router.currentRoute.value.query.asset_tag) {
    // get asset tag from url
    let nxid = router.currentRoute.value.query.asset_tag as string;
    // Get asset from API
    getAssetByID(http, nxid, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      // Set asset to res
      oldAsset.value = res as AssetSchema;
      // Save a copy for reset value
      assetCopy = JSON.parse(JSON.stringify(oldAsset.value));
      // Get parts from api
      getPartsOnAsset(http, oldAsset.value.asset_tag!, (res, err) => {
        if (err) {
          errorHandler(err);
        }
        // Set reactive array to API response
        partsOnAsset.value = res as LoadedCartItem[];
        // Save a copy for reset value
        partsOnAssetCopy = JSON.parse(JSON.stringify(partsOnAsset.value));
      });
    });
    // Get user inventory from api
    getUserInventory(http, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      inventory.value = res as LoadedCartItem[];
      inventoryCopy = JSON.parse(JSON.stringify(inventory.value));
    });
  }
});

function assetSubmit() {
  // Use create part method from API commands
  let unloadedParts = partsOnAsset.value.map((part) => {
    if (part.serial) {
      return { nxid: part.part.nxid as string, serial: part.serial };
    }
    return { nxid: part.part.nxid as string, quantity: part.quantity };
  }) as CartItem[];
  // Iterate through list of parts and strip only the NXID and quantity
  updateAsset(http, oldAsset.value, unloadedParts, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    router.back();
  });
}

function plusPart(item: LoadedCartItem) {
  if (assetCopy.migrated) {
    if (item.part.serialized) {
      partsOnAsset.value.push(item);
      return;
    }
    let i = partsOnAsset.value.findIndex((e) => e.part.nxid == item.part.nxid);
    if (i < 0) {
      item.quantity = 1;
      partsOnAsset.value.push(item);
      return;
    }
    partsOnAsset.value[i].quantity! += 1;
    return;
  }
  move(inventory, partsOnAsset, item.part, 1, item.serial!);
}

function minusPart(item: LoadedCartItem) {
  if (assetCopy.migrated) {
    if (item.part.serialized) {
      let i = partsOnAsset.value.findIndex((e) => e.serial == item.serial);
      partsOnAsset.value.splice(i, 1);
      return;
    }
    let i = partsOnAsset.value.findIndex((e) => e.part.nxid == item.part.nxid);
    if (i < 0) return;
    partsOnAsset.value[i].quantity! -= 1;
    if (partsOnAsset.value[i].quantity! < 1) partsOnAsset.value.splice(i, 1);
    return;
  }
  move(partsOnAsset, inventory, item.part, 1, item.serial!);
}

function move(
  array1: Ref<LoadedCartItem[]>,
  array2: Ref<LoadedCartItem[]>,
  part: PartSchema,
  quantity: number,
  serial: string
) {
  // Create var for item to move
  let item1 = {} as LoadedCartItem | undefined;
  // If item is serialized
  if (serial != undefined) {
    // Find existing item
    item1 = array1.value.find((e) => e.serial == serial);
    // Return if not found
    if (!item1) {
      return;
    }
    // Remove from array 1
    array1.value.splice(array1.value.indexOf(item1), 1);
    // Push to array 2
    array2.value.push({ part, serial: serial });
  } else {
    // Find matching part in array 1
    item1 = array1.value.find((e) => e.part.nxid == part.nxid);
    // Return if not found
    if (!item1 || !quantity) {
      return;
    }
    // subtract quantity
    item1.quantity! -= quantity;
    // Remove from array if quantity < 1
    if (item1.quantity! < 1)
      array1.value.splice(array1.value.indexOf(item1), 1);
    // Find in array 2
    let item2 = array2.value.find((e) => e.part.nxid == part.nxid);
    // If it doesn't exist, push a new entry
    if (!item2) array2.value.push({ part, quantity });
    // Otherwise increment existing entry
    else item2.quantity! += quantity;
  }
}

function deletePart(part: LoadedCartItem) {
  inventory.value.push(JSON.parse(JSON.stringify(part)));
  partsOnAsset.value.splice(partsOnAsset.value.indexOf(part), 1);
}

function reset() {
  oldAsset.value = JSON.parse(JSON.stringify(assetCopy));
  partsOnAsset.value = JSON.parse(JSON.stringify(partsOnAssetCopy));
  inventory.value = JSON.parse(JSON.stringify(inventoryCopy));
}
</script>

<template>
  <AssetManagerComponent
    :http="http"
    :title="'Edit Asset:'"
    :submitText="'Update Asset'"
    :strict="true"
    :oldAsset="oldAsset"
    :parts="partsOnAsset"
    :errorHandler="errorHandler"
    :inventory="inventory"
    :displayMessage="displayMessage"
    :inventorySearch="true"
    :untracked="assetCopy.migrated?true:false"
    @assetSubmit="assetSubmit"
    @plusPart="plusPart"
    @minusPart="minusPart"
    @deletePart="deletePart"
    @assetReset="reset"
  />
</template>
