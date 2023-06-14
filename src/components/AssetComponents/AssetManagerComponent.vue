<script setup lang="ts">
import { AxiosError, AxiosInstance } from 'axios';
import { ref, onMounted, watch } from 'vue';
import { Router } from 'vue-router';
import {
AssetSchema,
LoadedCartItem,
PartSchema,
} from '../../plugins/interfaces';
import AssetCartItemComponent from '../AssetComponents/AssetCartItemComponent.vue';
import AssetPartSearchComponent from '../AssetComponents/SearchPartOnAssetComponent.vue';
import CustomDropdownComponent from '../GenericComponents/CustomDropdownComponent.vue';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import InventoryPopup from '../InventoryComponents/InventoryPopup.vue';

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
  untracked?: boolean;
  isAdmin?: boolean;
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
  untracked,
  isAdmin
} = defineProps<Props>();
// End props
let correction = ref(false)
let partSearchPopup = ref(false);
let inventorySearchPopup = ref(false);

let emit = defineEmits(['assetSubmit', 'assetReset', 'plusPart', 'minusPart', 'deletePart']);

// Emit add part to asset as new record
function addToAsset(part: PartSchema) {
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

watch(correction, ()=>{
  if(!correction.value)
    emit("assetReset")
})
</script>
<template>
  <div class="body">
    <p class="my-2 w-full rounded-md bg-red-400 p-2" v-if="oldAsset.migrated">
      This asset was automatically migrated from the old asset tracking system
      and is incomplete. Please edit and update the information if you can.
    </p>
    <h1 class="mb-4 text-4xl leading-8 md:leading-10">{{ title }}</h1>
    <div class="flex" v-if="isAdmin">
      <label class="mr-1">Correction mode:</label>
      <input type="checkbox" v-model="correction" class="text-white my-1">
    </div>
    <form
      id="form"
      @submit.prevent="$emit('assetSubmit', correction)"
      @reset.prevent="$emit('assetReset')"
      class="grid grid-cols-2"
    >
      <label>Asset Tag:</label>
      <input
        class="textbox m-1"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="oldAsset.asset_tag"
        type="text"
        pattern="WNX([0-9]{7})"
        placeholder="WNX0000000"
      />
      <label>Manufacturer:</label>
      <input
        class="textbox m-1"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="oldAsset.manufacturer"
        type="text"
        placeholder="Manufacturer"
      />
      <label>Model:</label>
      <input
        class="textbox m-1"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="oldAsset.model"
        type="text"
        placeholder="Model"
      />
      <label>Building:</label>
      <CustomDropdownComponent
        :required="strict"
        :options="['3', '1', '4']"
        @updateValue="(value: string) => { oldAsset.building = parseInt(value) }"
        :defaultValue="oldAsset.building?.toString()"
      />
      <label>Bay:</label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="oldAsset.bay"
        type="number"
        placeholder="Bay"
      />
      <label>Serial Number:</label>
      <input
        class="textbox m-1"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="oldAsset.serial"
        type="text"
        placeholder="Serial Number"
      />
      <label>Asset Type:</label>
      <CustomDropdownComponent
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
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
        <div
          v-if="oldAsset.asset_type == 'Server'"
          class="col-span-2 grid grid-cols-2"
        >
          <label>Chassis Type:</label>
          <CustomDropdownComponent
            :required="strict"
            :disabled="strict&&!untracked&&!correction"
            :options="['Rack', 'Node', 'Node Chassis', 'Tower']"
            @updateValue="(value: string) => { oldAsset.chassis_type = value }"
            :defaultValue="oldAsset.chassis_type"
          />
          <div
            v-if="oldAsset.chassis_type == 'Rack'||oldAsset.chassis_type=='Node Chassis'"
            class="col-span-2 grid grid-cols-2"
          >
            <label>Rack Units:</label>
            <input
              class="textbox m-1"
              :disabled="strict&&!untracked&&!correction"
              :required="strict"
              v-model="oldAsset.units"
              type="number"
              min="1"
              placeholder="Rack Units"
            />
            <label>Num Bays:</label>
            <input
              class="textbox m-1"
              :required="strict"
              :disabled="strict&&!untracked&&!correction"
              v-model="oldAsset.num_bays"
              type="number"
              min="0"
              placeholder="Num Bays"
            />

            <div
              v-if="oldAsset.num_bays && oldAsset.num_bays > 0"
              class="col-span-2 grid grid-cols-2"
            >
              <label>Bay Size:</label>
              <select
                :required="strict"
                :disabled="strict&&!untracked&&!correction"
                v-model="oldAsset.bay_type"
                class="textbox m-1"
              >
                <option :value="undefined" selected disabled>Select</option>
                <option :value="'3.5'">3.5"</option>
                <option :value="'2.5'">2.5"</option>
                <option :value="'Both'">Both</option>
              </select>
            </div>
            <label>PDU Cables::</label>
            <select
              :required="strict"
              :disabled="strict&&!untracked&&!correction"
              v-model="oldAsset.cable_type"
              class="textbox m-1"
            >
              <option :value="undefined" selected disabled>Select</option>
              <option :value="'short'">Short</option>
              <option :value="'long'">Long</option>
              <option :value="'none'">None</option>
            </select>

            <label>Num PSUs:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.num_psu"
              type="number"
              min="0"
              placeholder="Num PSUs"
            />
            <div
              v-if="oldAsset.num_psu && oldAsset.num_psu > 0"
              class="col-span-2 grid grid-cols-2"
            >
              <label>PSU Model:</label>
              <CustomDropdownComponent
                :required="oldAsset.num_psu>0"
                :options="[
                  'PWS-501P-1R',
                  'PWS-741P-1R',
                  'PWS-920P-1R',
                  'PWS-920P-SQ',
                  'PWS-1K28P-SQ',
                  'PWS-504P-1R',
                ]"
                @updateValue="(value: string) => { oldAsset.psu_model = value }"
                :defaultValue="oldAsset.psu_model"
              />
            </div>
            <label>Rails:</label>
            <select
              :required="strict"
              v-model="oldAsset.rails"
              class="textbox m-1"
            >
              <option :value="undefined" selected disabled>Select</option>
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
            <div v-if="oldAsset.rails" class="col-span-2 grid grid-cols-2">
              <label>In Rack:</label>
              <select
                :required="strict"
                v-model="oldAsset.in_rack" class="textbox m-1" >
                <option :value="undefined" selected disabled>Select</option>
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>
          </div>

          <div v-else-if="oldAsset.chassis_type == 'Node'" class="col-span-2 grid grid-cols-2">
            <label>Chassis Tag:</label>
            <input
              class="textbox m-1"
              :required="false"
              v-model="oldAsset.parent"
              type="text"
              pattern="WNX([0-9]{7})"
              placeholder="WNX0000000"
            />
            <div v-if="oldAsset.parent" class="col-span-2 grid grid-cols-2">
              <label>In Rack:</label>
              <select
                :required="strict"
                v-model="oldAsset.in_rack"
                class="textbox m-1"
              >
                <option :value="undefined" selected disabled>Select</option>
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>


          </div>

          <div
            v-else-if="oldAsset.chassis_type == 'Tower'"
            class="col-span-2 grid grid-cols-2"
          >
            <label>Status:</label>
            <select
              :required="strict"
              v-model="oldAsset.live"
              class="textbox m-1"
            >
              <option :value="undefined" selected disabled>Select</option>
              <option :value="true">Live</option>
              <option :value="false">Inactive</option>
            </select>
            <div
              v-if="oldAsset.live == true"
              class="col-span-2 grid grid-cols-2"
            >
              <label>Power Port:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="oldAsset.power_port"
                type="text"
                placeholder="Power Port"
              />
              <label>Public Port:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="oldAsset.public_port"
                type="text"
                placeholder="Public Port"
              />
              <label>Private Port:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="oldAsset.private_port"
                type="text"
                placeholder="Private Port"
              />
              <label>IPMI Port:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="oldAsset.ipmi_port"
                type="text"
                placeholder="IPMI Port"
              />
              <label>SID:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="oldAsset.sid"
                type="number"
                placeholder="Service ID"
              />
            </div>
          </div>
          <div
            v-if="oldAsset.in_rack || oldAsset.power_port"
            class="col-span-2 grid grid-cols-2"
          >
            <label>Power Port:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.power_port"
              type="text"
              placeholder="Power Port"
            />
            <label>Public Port:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.public_port"
              type="text"
              placeholder="Public Port"
            />
            <label>Private Port:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.private_port"
              type="text"
              placeholder="Private Port"
            />
            <label>IPMI Port:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.ipmi_port"
              type="text"
              placeholder="IPMI Port"
            />
            <label>Status:</label>
            <select
              :required="strict"
              v-model="oldAsset.live"
              class="textbox m-1"
            >
              <option :value="undefined" selected disabled>Select</option>
              <option :value="true">Live</option>
              <option :value="false">Inactive</option>
            </select>
            <div v-if="oldAsset.live" class="col-span-2 grid grid-cols-2">
              <label>SID:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="oldAsset.sid"
                type="number"
                placeholder="Service ID"
              />
            </div>
          </div>
          <!-- Part Search here -->
          <div
            v-if="oldAsset.in_rack == false"
            class="col-span-2 grid grid-cols-2"
          >
            <label>Pallet:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.pallet"
              type="text"
              placeholder="Pallet"
            />
          </div>
        </div>
        <div v-else class="col-span-2 grid grid-cols-2">
          <label>FW Revision:</label>
          <input
            class="textbox m-1"
            :required="strict"
            v-model="oldAsset.fw_rev"
            type="text"
            placeholder="FW Revision"
          />
          <label v-if="!(oldAsset.in_rack || oldAsset.power_port)">Status:</label>
          <select :required="strict" v-model="oldAsset.live" class="textbox m-1" v-if="!(oldAsset.in_rack || oldAsset.power_port)">
            <option :value="undefined" selected disabled>Select</option>
            <option :value="true">Live</option>
            <option :value="false">Inactive</option>
          </select>
        </div>
        <div
          v-if="oldAsset.asset_type == 'PDU' || oldAsset.asset_type == 'Switch'"
          class="col-span-2 grid grid-cols-2"
        >
          <div v-if="oldAsset.live" class="col-span-2 grid grid-cols-2">
            <label>Rack Location:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.power_port"
              type="text"
              placeholder=" Rack Location"
            />
          </div>
          <div
            v-if="oldAsset.live == false"
            class="col-span-2 grid grid-cols-2"
          >
            <label>Pallet:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="oldAsset.pallet"
              type="text"
              placeholder="Pallet"
            />
          </div>
        </div>
      </div>
      <div v-if="strict" class="col-span-2 my-4">
        <h1 class="inline-block text-4xl leading-8 md:leading-10">Notes:</h1>
        <textarea
          class="textbox m-1"
          rows="4"
          v-model="oldAsset.notes"
          placeholder="Drag to resize"
        />
      </div>

      <div v-if="http != undefined" v-show="oldAsset.asset_type == 'Server'&&oldAsset.chassis_type!='Node Chassis'"  class="col-span-2">
        <div class="flex">
          <h1 class="inline-block text-4xl leading-8 md:leading-10">Parts:</h1>
          <!-- Plus -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            class="button-icon hover:button-icon-hover active:button-icon-active ml-4"
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
          v-if="partSearch || oldAsset.migrated || correction"
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
          v-if="inventorySearch && inventory && !oldAsset.migrated && !correction"
          v-show="inventorySearchPopup"
          @toggle="togglePopup"
        >
          <InventoryPopup
            @addPartAction="addPartFromInventory"
            :inventory="inventory"
          />
        </FullScreenPopupComponent>
        <p class="my-2 w-full rounded-md bg-red-400 p-2" v-if="correction">
          You are in asset correction mode.  Any parts added here will be treat as new inventory and removed parts will be marked as deleted.  
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
          :item="part"
          :untracked="untracked || oldAsset.migrated"
          @plus="$emit('plusPart', part, correction)"
          @minus="$emit('minusPart', part, correction)"
          @delete="$emit('deletePart', part, correction)"
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
<style scoped>
label {
  @apply my-auto;
}
</style>
