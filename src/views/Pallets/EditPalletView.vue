<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import BackButton from '../../components/GenericComponents/BackButton.vue';
import PalletManagerComponent from '../../components/PalletComponents/PalletManagerComponent.vue';
import {
  getPalletByID,
  getPartsOnPallet,
  updatePallet,
} from '../../plugins/dbCommands/palletManager';
import { getUserInventory } from '../../plugins/dbCommands/userManager';
import type {
  CartItem,
  LoadedCartItem,
  PartSchema,
  UserState,
  AssetPart,
  PalletSchema
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
let palletCopy = {} as PalletSchema;
let partsOnPallet = ref([] as AssetPart[]);
let partsOnPalletCopy = [] as AssetPart[];
let inventory = ref([] as AssetPart[]);
let inventoryCopy = [] as AssetPart[];
let loading = ref(false)
let maxQuantityMap = new Map<string, number>()
onBeforeMount(() => {
  if (router.currentRoute.value.query.pallet_tag) {
    loading.value = true
    // get asset tag from url
    let nxid = router.currentRoute.value.query.pallet_tag as string;
    // Check mode
    // Get asset from API
    getPalletByID(http, nxid, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      // Set asset to res
      palletRef.value = res as PalletSchema;
      // Save a copy for reset value
      palletCopy = JSON.parse(JSON.stringify(palletRef.value));
      // Get parts from api
      getPartsOnPallet(http, palletRef.value.pallet_tag!, (res1, err) => {
        if (err) {
          errorHandler(err);
        }
        // Set reactive array to API response
        partsOnPallet.value = res1 as LoadedCartItem[];
        // Save a copy for reset value
        partsOnPalletCopy = JSON.parse(JSON.stringify(res1 as LoadedCartItem[]));

        getUserInventory(http, (res, err) => {
          if (err) {
            errorHandler(err);
          }
          inventory.value = res as LoadedCartItem[];
          inventoryCopy = JSON.parse(JSON.stringify(inventory.value));
          // Set reactive array to API response
          partsOnPallet.value = res1 as LoadedCartItem[];
          // Save a copy for reset value
          partsOnPalletCopy = JSON.parse(JSON.stringify(res1 as LoadedCartItem[]));

          inventoryCopy.filter((p)=>p.quantity).map((p)=>{
            if(maxQuantityMap.has(p.part.nxid!))
              return maxQuantityMap.set(p.part.nxid!, maxQuantityMap.get(p.part.nxid!)!+p.quantity!)
            maxQuantityMap.set(p.part.nxid!, p.quantity!)
          })
          partsOnPalletCopy.filter((p)=>p.quantity).map((p)=>{
            if(maxQuantityMap.has(p.part.nxid!))
              return maxQuantityMap.set(p.part.nxid!, maxQuantityMap.get(p.part.nxid!)!+p.quantity!)
            maxQuantityMap.set(p.part.nxid!, p.quantity!)
          })
          maxQuantityMap.forEach((v, k)=>{
            console.log(k+": "+v)
          })
          partsOnPallet.value = (res1 as AssetPart[]).map((p)=>{
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

function palletSubmit(correction: boolean) {
  // Use create part method from API commands
  let unloadedParts = partsOnPallet.value.map((part) => {
    if (part.serial) {
      return { nxid: part.part.nxid as string, serial: part.serial };
    }
    return { nxid: part.part.nxid as string, quantity: part.quantity };
  }) as CartItem[];
  let assets = [] as string[]
  // Iterate through list of parts and strip only the NXID and quantity
  updatePallet(http, palletRef.value, unloadedParts, assets, correction, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    router.back();
  });
}

function plusPart(item: AssetPart, correction: boolean) {
  // Check asset edit mode
  if (correction) {
    // If serialized part
    if (item.part.serialized) {
      // Push to asset and return
      partsOnPallet.value.push(item);
      return;
    }
    // Check if part already exists
    let i = partsOnPallet.value.findIndex((e) => e.part.nxid == item.part.nxid);
    // If part does not exist
    if (i < 0) {
      // Set quantity
      item.max_quantity = item.quantity
      item.quantity = 1;
      // Push to asset and return
      partsOnPallet.value.push(item);
      return;
    }
    // Increment quantity
    partsOnPallet.value[i].quantity! += 1;
    return;
  }
  // Use move function for inventory checks
  move(inventory, partsOnPallet, item.part, 1, item.serial!);
}

function minusPart(item: LoadedCartItem, correction: boolean) {
  if (correction) {
    // If part is serialized
    if (item.part.serialized) {
      // Find and splice serialized part
      let i = partsOnPallet.value.findIndex((e) => e.serial == item.serial);
      partsOnPallet.value.splice(i, 1);
      return;
    }
    // Find index of part
    let i = partsOnPallet.value.findIndex((e) => e.part.nxid == item.part.nxid);
    // If part found, decrement
    if (i < 0) return;
      partsOnPallet.value[i].quantity! -= 1;
    // Check if part needs to be spliced from part list
    if (partsOnPallet.value[i].quantity! < 1)
      partsOnPallet.value.splice(i, 1);
    return;
  }
  // move with inventory checks
  move(partsOnPallet, inventory, item.part, 1, item.serial!);
}

function updateQuantity(item: AssetPart, quantity: number, correction: boolean) {
  if (correction) {
    // If part is serialized
    if (item.part.serialized) {
      return;
    }
    // Find index of part
    let i = partsOnPallet.value.findIndex((e) => e.part.nxid == item.part.nxid);
    // If part found, decrement
    if (i < 0) {
      // Set quantity
      item.max_quantity = item.quantity
      item.quantity = quantity;
      // Push to asset and return
      partsOnPallet.value.push(item);
      return;
    }
    // Increment quantity
    partsOnPallet.value[i].quantity! += quantity;
    if (partsOnPallet.value[i].quantity! < 1)
      partsOnPallet.value.splice(i, 1);
    return;
  }
  console.log(quantity)
  // move with inventory checks
  if(quantity<0)
    move(partsOnPallet, inventory, item.part, quantity*-1, item.serial!);
  else 
    move(inventory, partsOnPallet, item.part, quantity, item.serial!);
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
  move(inventory, partsOnPallet, item.part, item.quantity!, item.serial!);
}

function deletePart(part: LoadedCartItem) {
  inventory.value.push(JSON.parse(JSON.stringify(part)));
  partsOnPallet.value.splice(partsOnPallet.value.indexOf(part), 1);
}

function reset() {
  palletRef.value = JSON.parse(JSON.stringify(palletCopy));
  partsOnPallet.value = JSON.parse(JSON.stringify(partsOnPalletCopy));
  inventory.value = JSON.parse(JSON.stringify(inventoryCopy));
}
</script>

<template>
  <div
    class="background-and-border p-4"
  >
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/pallets')" class="mr-2 mb-2"/>
    <div v-if="loading" class="my-4 flex justify-center">
      <div class="loader text-center"></div>
    </div>
    <PalletManagerComponent
      v-else
      :http="http"
      :title="'Edit Pallet:'"
      :submitText="'Update Pallet'"
      :strict="true"
      :palletRef="palletRef"
      :parts="partsOnPallet"
      :errorHandler="errorHandler"
      :inventory="inventory"
      :displayMessage="displayMessage"
      :inventorySearch="true"
      :isAdmin="(store.state.user.roles?.includes('admin')||store.state.user.roles?.includes('lead'))?true:false"
      @assetSubmit="palletSubmit"
      @plusPart="plusPart"
      @addAll="addAll"
      @minusPart="minusPart"
      @deletePart="deletePart"
      @assetReset="reset"
      @updateQuantity="updateQuantity"
  /> 
  </div>
</template>
