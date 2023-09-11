<script setup lang="ts">
import { AxiosError, AxiosInstance } from 'axios';
import { ref, onMounted, watch } from 'vue';
import { Router } from 'vue-router';
import {
PalletSchema,
LoadedCartItem,
AssetPart,
PartSchema,
} from '../../plugins/interfaces';
import AssetCartItemComponent from '../AssetComponents/AssetCartItemComponent.vue';
import AssetPartSearchComponent from '../AssetComponents/SearchPartOnAssetComponent.vue';
import CustomDropdownComponent from '../GenericComponents/CustomDropdownComponent.vue';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import InventoryPopup from '../InventoryComponents/InventoryPopup.vue';
import PlusButton from '../GenericComponents/PlusButton.vue';

interface Props {
  title: string;
  submitText: string;
  strict: boolean;
  palletRef: PalletSchema;
  parts: AssetPart[];
  errorHandler?: (err: Error | AxiosError | string) => void;
  displayMessage?: (message: string) => void;
  http?: AxiosInstance;
  router?: Router;
  partSearch?: boolean;
  inventorySearch?: boolean;
  inventory?: AssetPart[];
  untracked?: boolean;
  isAdmin?: boolean;
}

// Begin props
const {
  title,
  submitText,
  strict,
  palletRef,
  parts,
  http,
  errorHandler,
  displayMessage,
  partSearch,
  inventorySearch,
  inventory,
  untracked,
  isAdmin
} = defineProps<Props>();
// End props
let correction = ref(false)
let partSearchPopup = ref(false);
let inventorySearchPopup = ref(false);

let emit = defineEmits(['palletSubmit', 'palletReset', 'plusPart', 'minusPart', 'deletePart', 'addAll', 'updateQuantity']);

// Emit add part to asset as new record
function addToPallet(part: PartSchema) {
  emit('plusPart', { part, quantity: 1 }, correction.value);
}

// Toggle popup menus
function togglePopup() {
  partSearchPopup.value = !partSearchPopup.value;
  inventorySearchPopup.value = !inventorySearchPopup.value;
}

// Add Part from user inventory
function addPartFromInventory(item: LoadedCartItem) {
  emit('plusPart', item, correction.value);
}

function addAllFromInventory(item: LoadedCartItem) {
  emit('addAll', item);
}

function submitForm() {
  if((untracked||correction.value)&&!window.confirm("Are you sure you want to submit?"))
    return
  emit("palletSubmit", correction.value)
}

function updateQuantity(item: AssetPart, quantity: number) {
  console.log(item)
  emit("updateQuantity", item, quantity, correction.value)
}

watch(correction, ()=>{
  emit("palletReset")
})

onMounted(()=>{
  document.getElementById("tag")?.focus()
})

</script>
<template>
  <div class="body">
    <h1 class="mb-4 text-4xl leading-8 md:leading-10">{{ title }}</h1>
    <div class="flex" v-if="isAdmin">
      <label class="mr-1">Correction mode:</label>
      <input type="checkbox" v-model="correction" class="text-white my-1">
    </div>
    <form
      id="form"
      @submit.prevent="submitForm"
      @reset.prevent="$emit('palletReset')"
      class="grid grid-cols-2"
    >
      <label>Pallet Tag:</label>
      <input
        v-on:keydown.enter.prevent
        class="textbox m-1"
        id="tag"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="palletRef.pallet_tag"
        type="text"
        pattern="PAL([0-9]{7})"
        placeholder="PAL0000000"
      />
      <label>Location:</label>
      <input
        v-on:keydown.enter.prevent
        class="textbox m-1"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="palletRef.location"
        type="text"
        placeholder="Location"
      />
      <label>Building:</label>
      <CustomDropdownComponent
        :required="strict"
        :options="['3', '1', '4']"
        @updateValue="(value: string) => { palletRef.building = parseInt(value) }"
        :defaultValue="palletRef.building?.toString()"
      />
      <div v-if="strict" class="col-span-2 my-4">
        <h1 class="inline-block text-4xl leading-8 md:leading-10">Notes:</h1>
        <textarea
          class="textbox m-1 h-40"
          v-model="palletRef.notes"
          placeholder="Drag to resize"
        />
      </div>
      <div v-if="http != undefined" class="col-span-2">
        <div class="flex">
          <h1 class="inline-block text-4xl leading-8 md:leading-10">Parts:</h1>
          <!-- Plus -->
	  <PlusButton @click="togglePopup"/>
        </div>
        <FullScreenPopupComponent
          v-if="partSearch || correction"
          v-show="partSearchPopup"
          @toggle="togglePopup"
        >
          <AssetPartSearchComponent
            :http="http"
            :errorHandler="errorHandler!"
            :displayMessage="displayMessage!"
            @addPartAction="addToPallet"
          />
        </FullScreenPopupComponent>
        <FullScreenPopupComponent
          v-if="inventorySearch && inventory && !correction"
          v-show="inventorySearchPopup"
          @toggle="togglePopup"
        >
          <InventoryPopup
            @addPartAction="addPartFromInventory"
            @addAll="addAllFromInventory"
            :inventory="inventory"
          />
        </FullScreenPopupComponent>
        <p class="my-2 w-full rounded-md bg-red-400 p-2" v-if="correction">
          You are in pallet correction mode.  Any parts added here will be treat as new inventory and removed parts will be marked as deleted.  
        </p>
        <div
          v-if="(parts!.length > 0)"
          class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 group-hover:rounded-bl-none group-hover:bg-zinc-400 group-hover:shadow-lg md:grid-cols-5 md:leading-10"
        >
          <p class="hidden md:block">NXID</p>
          <p>Manufacturer</p>
          <p>Name</p>
          <p>Quantity/SN</p>
          <p></p>
        </div>
        <div v-else class="my-2">
          <p>No parts yet..</p>
        </div>
        <AssetCartItemComponent
          class="col-span-2"
          v-for="part in parts"
          :key="part.part.nxid!+part.serial+(correction ? 't':'f')"
          :item="part"
          :untracked="untracked || correction"
          @delete="$emit('deletePart', part, correction)"
          @updateQuantity="updateQuantity"
        />
      </div>
      <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        value="Reset"
      />
      <input 
        v-on:keydown.enter.prevent
        class="submit col-span-2" type="submit" :value="submitText" />
    </form>
  </div>
</template>
