<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetManagerComponent from '../../components/AssetComponents/AssetManagerComponent.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
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
  AssetPart
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
let partsOnAsset = ref([] as AssetPart[]);
let partsOnAssetCopy = [] as AssetSchema[];
let inventory = ref([] as AssetPart[]);
let inventoryCopy = [] as AssetPart[];
let loading = ref(false)
let maxQuantityMap = new Map<string, number>()
onBeforeMount(() => {
  if (router.currentRoute.value.query.asset_tag) {
    loading.value = true
    // get asset tag from url
    let nxid = router.currentRoute.value.query.asset_tag as string;
    // Check mode
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
      getPartsOnAsset(http, oldAsset.value.asset_tag!, (res1, err) => {
        if (err) {
          errorHandler(err);
        }
        // Set reactive array to API response
        partsOnAsset.value = res1 as LoadedCartItem[];
        // Save a copy for reset value
        partsOnAssetCopy = JSON.parse(JSON.stringify(res1 as LoadedCartItem[]));

        getUserInventory(http, (res, err) => {
          if (err) {
            errorHandler(err);
          }
          inventory.value = res as LoadedCartItem[];
          inventoryCopy = JSON.parse(JSON.stringify(inventory.value));
          // Set reactive array to API response
          partsOnAsset.value = res1 as LoadedCartItem[];
          // Save a copy for reset value
          partsOnAssetCopy = JSON.parse(JSON.stringify(res1 as LoadedCartItem[]));

          inventoryCopy.filter((p)=>p.quantity).map((p)=>{
            if(maxQuantityMap.has(p.part.nxid!))
              return maxQuantityMap.set(p.part.nxid!, maxQuantityMap.get(p.part.nxid!)!+p.quantity!)
            maxQuantityMap.set(p.part.nxid!, p.quantity!)
          })
          partsOnAssetCopy.filter((p)=>p.quantity).map((p)=>{
            if(maxQuantityMap.has(p.part.nxid!))
              return maxQuantityMap.set(p.part.nxid!, maxQuantityMap.get(p.part.nxid!)!+p.quantity!)
            maxQuantityMap.set(p.part.nxid!, p.quantity!)
          })
          maxQuantityMap.forEach((v, k)=>{
            console.log(k+": "+v)
          })
          partsOnAsset.value = (res1 as AssetPart[]).map((p)=>{
            p.max_quantity = maxQuantityMap.has(p.part.nxid!) ? maxQuantityMap.get(p.part.nxid!) : 1
            return p
          })
          loading.value = false
        });
      });
    });
    // Get user inventory from api
  }
});

function assetSubmit(correction: boolean) {
  // Use create part method from API commands
  let unloadedParts = partsOnAsset.value.map((part) => {
    if (part.serial) {
      return { nxid: part.part.nxid as string, serial: part.serial };
    }
    return { nxid: part.part.nxid as string, quantity: part.quantity };
  }) as CartItem[];
  // Iterate through list of parts and strip only the NXID and quantity
  updateAsset(http, oldAsset.value, unloadedParts, correction, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    if(correction&&oldAsset.value.asset_tag!=assetCopy.asset_tag) {
      router.push({ name: 'View Asset', query: { asset_tag: oldAsset.value.asset_tag } });
    }
    else {
      router.back();
    }
  }, correction&&oldAsset.value.asset_tag!=assetCopy.asset_tag ? assetCopy.asset_tag : undefined);
}

function plusPart(item: AssetPart, correction: boolean) {
  // Check asset edit mode
  if (assetCopy.migrated||correction) {
    // If serialized part
    if (item.part.serialized) {
      // Push to asset and return
      partsOnAsset.value.push(item);
      return;
    }
    // Check if part already exists
    let i = partsOnAsset.value.findIndex((e) => e.part.nxid == item.part.nxid);
    // If part does not exist
    if (i < 0) {
      // Set quantity
      item.max_quantity = item.quantity
      item.quantity = 1;
      // Push to asset and return
      partsOnAsset.value.push(item);
      return;
    }
    // Increment quantity
    partsOnAsset.value[i].quantity! += 1;
    return;
  }
  // Use move function for inventory checks
  move(inventory, partsOnAsset, item.part, 1, item.serial!);
}

function minusPart(item: LoadedCartItem, correction: boolean) {
  if (assetCopy.migrated||correction) {
    // If part is serialized
    if (item.part.serialized) {
      // Find and splice serialized part
      let i = partsOnAsset.value.findIndex((e) => e.serial == item.serial);
      partsOnAsset.value.splice(i, 1);
      return;
    }
    // Find index of part
    let i = partsOnAsset.value.findIndex((e) => e.part.nxid == item.part.nxid);
    // If part found, decrement
    if (i < 0) return;
      partsOnAsset.value[i].quantity! -= 1;
    // Check if part needs to be spliced from part list
    if (partsOnAsset.value[i].quantity! < 1)
      partsOnAsset.value.splice(i, 1);
    return;
  }
  // move with inventory checks
  move(partsOnAsset, inventory, item.part, 1, item.serial!);
}

function updateQuantity(item: AssetPart, quantity: number, correction: boolean) {
  if (assetCopy.migrated||correction) {
    // If part is serialized
    if (item.part.serialized) {
      return;
    }
    // Find index of part
    let i = partsOnAsset.value.findIndex((e) => e.part.nxid == item.part.nxid);
    // If part found, decrement
    if (i < 0) {
      // Set quantity
      item.max_quantity = item.quantity
      item.quantity = quantity;
      // Push to asset and return
      partsOnAsset.value.push(item);
      return;
    }
    // Increment quantity
    partsOnAsset.value[i].quantity! += quantity;
    if (partsOnAsset.value[i].quantity! < 1)
      partsOnAsset.value.splice(i, 1);
    return;
  }
  console.log(quantity)
  // move with inventory checks
  if(quantity<0)
    move(partsOnAsset, inventory, item.part, quantity*-1, item.serial!);
  else 
    move(inventory, partsOnAsset, item.part, quantity, item.serial!);
}

function move(
  array1: Ref<AssetPart[]>,
  array2: Ref<AssetPart[]>,
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
    if (!item2)
      array2.value.push({ part, quantity, max_quantity: maxQuantityMap.get(part.nxid!)! });
    // Otherwise increment existing entry
    else
      item2.quantity! += quantity;  
  }
}

function addAll(item: LoadedCartItem) {
  // Use move function for inventory checks
  move(inventory, partsOnAsset, item.part, item.quantity!, item.serial!);
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
  <div
    class="background-and-border p-4"
  >
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/assets')" class="mr-2 mb-2"/>
    <div v-if="loading" class="my-4 flex justify-center">
      <div class="loader text-center"></div>
    </div>
    <AssetManagerComponent
      v-else
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
      :isAdmin="(store.state.user.roles?.includes('admin')||store.state.user.roles?.includes('lead'))?true:false"
      @assetSubmit="assetSubmit"
      @plusPart="plusPart"
      @addAll="addAll"
      @minusPart="minusPart"
      @deletePart="deletePart"
      @assetReset="reset"
      @updateQuantity="updateQuantity"
    />
  </div>
</template>
