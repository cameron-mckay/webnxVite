<script setup lang="ts">
import { AxiosError, AxiosInstance } from "axios";
import { ref } from "vue";
import { Router } from "vue-router";
import { AssetSchema, LoadedCartItem, PartSchema } from "../plugins/interfaces";
import AssetCartItemComponent from "./AssetCartItemComponent.vue";
import CustomDropdownComponent from "./CustomDropdownComponent.vue";
import FullScreenPopupComponent from "./FullScreenPopupComponent.vue";
import InventoryPopup from "./InventoryPopup.vue";
import AssetPartSearchComponent from "./SearchPartOnAssetComponent.vue";

interface Props {
  title: string;
  submitText: string;
  strict: boolean;
  oldAsset: AssetSchema;
  parts: LoadedCartItem[];
  errorHandler?: (err: Error | AxiosError | string) => void;
  displayMessage?: (message: string) => void;
  http?: AxiosInstance;
  router?: Router;
  partSearch?: boolean;
  inventorySearch?: boolean;
  inventory?: LoadedCartItem[];
}

// Begin props
const {
  title,
  submitText,
  strict,
  oldAsset,
  parts,
  http,
  errorHandler,
  displayMessage,
  partSearch,
  inventorySearch,
  inventory,
} = defineProps<Props>();
// End props

let inRack = ref(false);
let partSearchPopup = ref(false);
let inventorySearchPopup = ref(false);

let emit = defineEmits(["assetSubmit", "plusPart", "minusPart", "deletePart"]);

// Emit add part to asset as new record
function addToAsset(part: PartSchema) {
  emit("plusPart", { part, quantity: 1 });
}

// Toggle popup menus
function togglePopup() {
  partSearchPopup.value = !partSearchPopup.value;
  inventorySearchPopup.value = !inventorySearchPopup.value;
}

// Add Part from user inventory
function addPartFromInventory(item: LoadedCartItem) {
  emit("plusPart", item);
}
</script>
<template>
  <div class="body">
    <h1 class="mb-4 text-4xl leading-8 md:leading-10">{{ title }}</h1>
    <form
      id="form"
      @submit.prevent="$emit('assetSubmit')"
      @reset.prevent="$emit('assetReset')"
      class="grid grid-cols-2"
    >
      <label>Asset Tag: </label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="oldAsset.asset_tag"
        type="text"
        placeholder="Asset Tag"
      />
      <label>Manufacturer: </label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="oldAsset.manufacturer"
        type="text"
        placeholder="Manufacturer"
      />
      <label>Model: </label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="oldAsset.model"
        type="text"
        placeholder="Model"
      />
      <label>Building: </label>
      <CustomDropdownComponent
        :required="strict"
        :options="['3', '1', '4']"
        @updateValue="(value: string) => { oldAsset.building = parseInt(value) }"
        :defaultValue="oldAsset.building?.toString()"
      />
      <label>Bay: </label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="oldAsset.bay"
        type="number"
        placeholder="Bay"
      />
      <label>Serial Number: </label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="oldAsset.serial"
        type="text"
        placeholder="Serial Number"
      />
      <label>Asset Type: </label>
      <CustomDropdownComponent
        :required="strict"
        :options="['Server', 'Laptop', 'Switch', 'PDU']"
        @updateValue="(value: string) => { oldAsset.asset_type = value }"
        :defaultValue="oldAsset.asset_type"
      />
      <div
        v-if="
          oldAsset.asset_type == 'Server' ||
          oldAsset.asset_type == 'Switch' ||
          oldAsset.asset_type == 'PDU'
        "
        class="col-span-2 grid grid-cols-2"
      >
        <label>Status: </label>
        <select :required="strict" v-model="oldAsset.live" class="textbox m-1">
          <option :value="true">Live</option>
          <option :value="false">Inactive</option>
        </select>
        <div
          v-if="
            (oldAsset.asset_type == 'PDU' || oldAsset.asset_type == 'Switch') &&
            oldAsset.live
          "
          class="col-span-2 grid grid-cols-2"
        >
          <label>Rack Location: </label>
          <input
            class="textbox m-1"
            :required="strict"
            v-model="oldAsset.power_port"
            type="text"
            placeholder="Rack Location"
          />
        </div>
        <div
          v-if="oldAsset.asset_type == 'Server'"
          class="col-span-2 grid grid-cols-2"
        >
          <label>Chassis Type: </label>
          <CustomDropdownComponent
            :required="strict"
            :options="['Rack', 'Node', 'Tower']"
            @updateValue="(value: string) => { oldAsset.chassis_type = value }"
            :defaultValue="oldAsset.chassis_type"
          />
          <div
            v-if="!oldAsset.live && oldAsset.live != undefined"
            class="col-span-2 grid grid-cols-2"
          >
            <label>Rails: </label>
            <select
              :required="strict"
              v-model="oldAsset.rails"
              class="textbox m-1"
            >
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
            <div
              v-if="oldAsset.rails && oldAsset.rails != undefined"
              class="col-span-2 grid grid-cols-2"
            >
              <label>In Rack: </label>
              <select :required="strict" v-model="inRack" class="textbox m-1">
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>
          </div>
          <div
            v-if="oldAsset.live || inRack || oldAsset.power_port"
            class="col-span-2 grid grid-cols-2"
          >
            <label>Power Port: </label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.power_port"
              type="text"
              placeholder="Power Port"
            />
            <label>Public Port: </label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.public_port"
              type="text"
              placeholder="Public Port"
            />
            <label>Private Port: </label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.private_port"
              type="text"
              placeholder="Private Port"
            />
            <label>IPMI Port: </label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.ipmi_port"
              type="text"
              placeholder="IPMI Port"
            />
          </div>
          <div v-if="oldAsset.live" class="col-span-2 grid grid-cols-2">
            <label>SID: </label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.sid"
              type="number"
              placeholder="Service ID"
            />
          </div>
          <!-- Part Search here -->
        </div>
      </div>
      <div v-if="http != undefined" class="col-span-2">
        <div v-show="oldAsset.asset_type == 'Server'" class="flex">
          <h1 class="inline-block text-4xl leading-8 md:leading-10">Parts:</h1>
          <!-- Plus -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            class="button-icon ml-4"
            @click="togglePopup"
          >
            <path
              stroke="currentColor"
              fill="currentColor"
              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
            />
          </svg>
        </div>
        <FullScreenPopupComponent
          v-if="partSearch"
          v-show="partSearchPopup"
          @toggle="togglePopup"
        >
          <AssetPartSearchComponent
            :http="http"
            :errorHandler="errorHandler!"
            :displayMessage="displayMessage!"
            @addPartAction="addToAsset"
          />
        </FullScreenPopupComponent>
        <FullScreenPopupComponent
          v-if="inventorySearch && inventory"
          v-show="inventorySearchPopup"
          @toggle="togglePopup"
        >
          <InventoryPopup
            @addPartAction="addPartFromInventory"
            :inventory="inventory"
          />
        </FullScreenPopupComponent>
        <div
          v-if="(parts!.length > 0)"
          class="relative grid grid-cols-4 md:grid-cols-5 rounded-xl p-2 text-center font-bold leading-8 group-hover:rounded-bl-none group-hover:bg-zinc-400 group-hover:shadow-lg md:leading-10"
        >
          <p class="md:block hidden">NXID</p>
          <p>Manufacturer</p>
          <p>Name</p>
          <p>Quantity</p>
          <p></p>
        </div>
        <AssetCartItemComponent
          class="col-span-2"
          v-for="part in parts"
          :item="part"
          @plus="$emit('plusPart', part)"
          @minus="$emit('minusPart', part)"
          @delete="$emit('deletePart', part)"
        />
      </div>
      <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        value="Reset"
      />
      <input class="submit col-span-2" type="submit" :value="submitText" />
    </form>
  </div>
</template>
