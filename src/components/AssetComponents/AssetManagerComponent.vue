<script setup lang="ts">
import { ref, onMounted, watch, onBeforeMount } from 'vue';
import {
AssetSchema,
} from '../../plugins/interfaces';
import CustomDropdownComponent from '../GenericComponents/CustomDropdownComponent.vue';

interface Props {
  title: string;
  submitText: string;
  strict: boolean;
  oldAsset: AssetSchema;
  untracked?: boolean;
  isAdmin?: boolean;
  clearOnReset?: boolean;
}

// Begin props
const {
  title,
  submitText,
  strict,
  oldAsset,
  untracked,
  isAdmin,
  clearOnReset
} = defineProps<Props>();
// End props
let correction = ref(false)
let assetRef = ref({} as AssetSchema)
let assetCopy = {} as AssetSchema
let emit = defineEmits(['assetSubmit', 'assetReset', 'correctionChanged']);
let key = 0;

onBeforeMount(()=>{
  if(oldAsset)
    assetRef.value = JSON.parse(JSON.stringify(oldAsset))
  if(untracked) {
    correction.value = true
  }
  assetCopy = JSON.parse(JSON.stringify(assetRef.value))
})

function submitForm() {
  if((untracked||correction.value)&&!window.confirm("Are you sure you want to submit?"))
    return
  emit("assetSubmit", assetRef.value, correction.value)
}

function reset() {
  assetRef.value = {}
  if(clearOnReset!=true)
    assetRef.value = JSON.parse(JSON.stringify(assetCopy))
  // Key swap to refresh custom drop downs
  key++
  emit("assetReset")
}

watch(correction, ()=>{
  emit("correctionChanged", correction.value)
})

onMounted(()=>{
  document.getElementById("tag")?.focus()
})

</script>
<template>
  <div class="body" :key="key">
    <p class="my-2 w-full rounded-md bg-red-400 p-2" v-if="assetRef.migrated">
      This asset was automatically migrated from the old asset tracking system
      and is incomplete. Please edit and update the information if you can.
    </p>
    <h1 class="mb-4 text-4xl leading-8 md:leading-10">{{ title }}</h1>
    <div class="flex" v-if="isAdmin&&!assetRef.migrated">
      <!-- -->
      <label class="mr-1">Correction mode:</label>
      <input type="checkbox" v-model="correction" class="text-white my-1">
      <!-- -->
    </div>
    <form
      id="form"
      @submit.prevent="submitForm"
      @reset.prevent="reset"
      v-on:keydown.enter.prevent
      class="grid grid-cols-2"
    >
      <!-- -->
      <label>Asset Tag:</label>
      <input
        class="textbox m-1"
        id="tag"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="assetRef.asset_tag"
        type="text"
        pattern="WNX([0-9]{7})"
        placeholder="WNX0000000"
      />
      <!-- -->
      <label>Manufacturer:</label>
      <input
        class="textbox m-1"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="assetRef.manufacturer"
        type="text"
        placeholder="Manufacturer"
      />
      <!-- -->
      <label>Model:</label>
      <input
        class="textbox m-1"
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        v-model="assetRef.model"
        type="text"
        placeholder="Model"
      />
      <!-- -->
      <label>Building:</label>
      <CustomDropdownComponent
        :required="strict"
        :options="['3', '1', '4']"
        @updateValue="(value: string) => { assetRef.building = parseInt(value) }"
        :defaultValue="assetRef.building?.toString()"
      />
      <!-- -->
      <label>Bay:</label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="assetRef.bay"
        type="number"
        placeholder="Bay"
      />
      <!-- -->
      <label>Serial Number:</label>
      <input
        class="textbox m-1"
        v-model="assetRef.serial"
        type="text"
        placeholder="Serial Number"
      />
      <!-- -->
      <label>Asset Type:</label>
      <CustomDropdownComponent
        :required="strict"
        :disabled="strict&&!untracked&&!correction"
        :options="['Server', 'Laptop', 'Switch', 'PDU']"
        @updateValue="(value: string) => { assetRef.asset_type = value }"
        :defaultValue="assetRef.asset_type"
      />
      <!-- -->
      <div
        v-if="
          assetRef.asset_type == 'Server' ||
          assetRef.asset_type == 'Switch' ||
          assetRef.asset_type == 'PDU'
        "
        class="col-span-2 grid grid-cols-2"
      >
        <div
          v-if="assetRef.asset_type == 'Server'"
          class="col-span-2 grid grid-cols-2"
        >
          <!-- -->
          <label>Chassis Type:</label>
          <CustomDropdownComponent
            :required="strict"
            :disabled="strict&&!untracked&&!correction"
            :options="['Rack', 'Node', 'Node Chassis', 'Tower']"
            @updateValue="(value: string) => { assetRef.chassis_type = value }"
            :defaultValue="assetRef.chassis_type"
          />
          <!-- -->
          <div
            v-if="assetRef.chassis_type == 'Rack'||assetRef.chassis_type=='Node Chassis'"
            class="col-span-2 grid grid-cols-2"
          >
            <!-- -->
            <label>Rack Units:</label>
            <input
              class="textbox m-1"
              :disabled="strict&&!untracked&&!correction"
              :required="strict"
              v-model="assetRef.units"
              type="number"
              min="1"
              placeholder="Rack Units"
            />
            <!-- -->
            <label>Num Bays:</label>
            <input
              class="textbox m-1"
              :required="strict"
              :disabled="strict&&!untracked&&!correction"
              v-model="assetRef.num_bays"
              type="number"
              min="0"
              placeholder="Num Bays"
            />
            <!-- -->
            <div
              v-if="assetRef.num_bays && assetRef.num_bays > 0"
              class="col-span-2 grid grid-cols-2"
            >
              <!-- -->
              <label>Bay Size:</label>
              <select
                :required="strict"
                :disabled="strict&&!untracked&&!correction"
                v-model="assetRef.bay_type"
                class="textbox m-1"
              >
                <option :value="undefined" selected disabled>Select</option>
                <option :value="'3.5'">3.5"</option>
                <option :value="'2.5'">2.5"</option>
                <option :value="'Both'">Both</option>
              </select>
              <!-- -->
            </div>
            <!-- -->
            <label>PDU Cables::</label>
            <select
              :required="strict"
              :disabled="strict&&!untracked&&!correction"
              v-model="assetRef.cable_type"
              class="textbox m-1"
            >
              <option :value="undefined" selected disabled>Select</option>
              <option :value="'short'">Short</option>
              <option :value="'long'">Long</option>
              <option :value="'none'">None</option>
            </select>
            <!-- -->
            <label>Num PSUs:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="assetRef.num_psu"
              type="number"
              min="0"
              placeholder="Num PSUs"
            />
            <!-- -->
            <div
              v-if="assetRef.num_psu && assetRef.num_psu > 0"
              class="col-span-2 grid grid-cols-2"
            >
              <!-- -->
              <label>PSU Model:</label>
              <CustomDropdownComponent
                :required="assetRef.num_psu>0"
                :options="[
                  'PWS-501P-1R',
                  'PWS-741P-1R',
                  'PWS-920P-1R',
                  'PWS-920P-SQ',
                  'PWS-1K28P-SQ',
                  'PWS-504P-1R',
                ]"
                @updateValue="(value: string) => { assetRef.psu_model = value }"
                :defaultValue="assetRef.psu_model"
              />
              <!-- -->
            </div>
            <!-- -->
            <label>Rails:</label>
            <select
              :required="strict"
              v-model="assetRef.rails"
              class="textbox m-1"
            >
              <option :value="undefined" selected disabled>Select</option>
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
            <!-- -->
            <div v-if="assetRef.rails" class="col-span-2 grid grid-cols-2">
              <!-- -->
              <label>In Rack:</label>
              <select
                :required="strict"
                v-model="assetRef.in_rack" class="textbox m-1"
              >
                <option :value="undefined" selected disabled>Select</option>
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
              <!-- -->
            </div>
          </div>
          <div v-else-if="assetRef.chassis_type == 'Node'" class="col-span-2 grid grid-cols-2">
            <!-- -->
            <label>Chassis Tag:</label>
            <input
              class="textbox m-1"
              :required="false"
              v-model="assetRef.parent"
              type="text"
              pattern="WNX([0-9]{7})"
              placeholder="WNX0000000"
            />
            <!-- -->
            <div v-if="assetRef.parent" class="col-span-2 grid grid-cols-2">
              <label>In Rack:</label>
              <select
                :required="strict"
                v-model="assetRef.in_rack"
                class="textbox m-1"
              >
                <option :value="undefined" selected disabled>Select</option>
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
              <!-- -->
            </div>
          </div>
          <div
            v-else-if="assetRef.chassis_type == 'Tower'"
            class="col-span-2 grid grid-cols-2"
          >
            <!-- -->
            <label>Status:</label>
            <select
              :required="strict"
              v-model="assetRef.live"
              class="textbox m-1"
            >
              <option :value="undefined" selected disabled>Select</option>
              <option :value="true">Live</option>
              <option :value="false">Inactive</option>
            </select>
            <!-- -->
            <div
              v-if="assetRef.live == true"
              class="col-span-2 grid grid-cols-2"
            >
              <!-- -->
              <label>Power Port:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="assetRef.power_port"
                type="text"
                placeholder="Power Port"
              />
              <!-- -->
              <label>Public Port:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="assetRef.public_port"
                type="text"
                placeholder="Public Port"
              />
              <!-- -->
              <label>Private Port:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="assetRef.private_port"
                type="text"
                placeholder="Private Port"
              />
              <!-- -->
              <label>IPMI Port:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="assetRef.ipmi_port"
                type="text"
                placeholder="IPMI Port"
              />
              <!-- -->
              <label>SID:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="assetRef.sid"
                type="number"
                placeholder="Service ID"
              />
              <!-- -->
            </div>
          </div>
          <div
            v-if="(assetRef.in_rack || assetRef.power_port)&&!(assetRef.chassis_type == 'Tower')"
            class="col-span-2 grid grid-cols-2"
          >
            <!-- -->
            <label>Power Port:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="assetRef.power_port"
              type="text"
              placeholder="Power Port"
            />
            <!-- -->
            <label>Public Port:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="assetRef.public_port"
              type="text"
              placeholder="Public Port"
            />
            <!-- -->
            <label>Private Port:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="assetRef.private_port"
              type="text"
              placeholder="Private Port"
            />
            <!-- -->
            <label>IPMI Port:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="assetRef.ipmi_port"
              type="text"
              placeholder="IPMI Port"
            />
            <!-- -->
            <label>Status:</label>
            <select
              :required="strict"
              v-model="assetRef.live"
              class="textbox m-1"
            >
              <option :value="undefined" selected disabled>Select</option>
              <option :value="true">Live</option>
              <option :value="false">Inactive</option>
            </select>
            <div v-if="assetRef.live" class="col-span-2 grid grid-cols-2">
              <!-- -->
              <label>SID:</label>
              <input
                class="textbox m-1"
                :required="strict"
                v-model="assetRef.sid"
                type="number"
                placeholder="Service ID"
              />
            </div>
          </div>
          <!-- Part Search here -->
          <div
            v-if="assetRef.in_rack == false"
            class="col-span-2 grid grid-cols-2"
          >
            <!-- -->
            <label>Pallet:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="assetRef.pallet"
              type="text"
              placeholder="Pallet"
            />
          </div>
        </div>
        <div v-else class="col-span-2 grid grid-cols-2">
          <!-- -->
          <label>FW Revision:</label>
          <input
            class="textbox m-1"
            :required="strict"
            v-model="assetRef.fw_rev"
            type="text"
            placeholder="FW Revision"
          />
          <!-- -->
          <label v-if="!(assetRef.in_rack || assetRef.power_port)">Status:</label>
          <select 
            :required="strict"
            v-model="assetRef.live"
            class="textbox m-1"
            v-if="!(assetRef.in_rack || assetRef.power_port)"
          >
            <option :value="undefined" selected disabled>Select</option>
            <option :value="true">Live</option>
            <option :value="false">Inactive</option>
          </select>
          <!-- -->
        </div>
        <div
          v-if="assetRef.asset_type == 'PDU' || assetRef.asset_type == 'Switch'"
          class="col-span-2 grid grid-cols-2"
        >
          <div v-if="assetRef.live" class="col-span-2 grid grid-cols-2">
            <!-- -->
            <label>Rack Location:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="assetRef.power_port"
              type="text"
              placeholder=" Rack Location"
            />
            <!-- -->
          </div>
          <div
            v-if="assetRef.live == false"
            class="col-span-2 grid grid-cols-2"
          >
            <!-- -->
            <label>Pallet:</label>
            <input
              class="textbox m-1"
              :required="strict"
              v-model="assetRef.pallet"
              type="text"
              placeholder="Pallet"
            />
            <!-- -->
          </div>
        </div>
      </div>
      <div v-if="strict" class="col-span-2 my-4">
        <!-- -->
        <h1 class="inline-block text-4xl leading-8 md:leading-10">Notes:</h1>
        <textarea
          class="textbox m-1 h-40"
          v-model="assetRef.notes"
          placeholder="Drag to resize"
        />
        <!-- -->
      </div>
      <slot v-if="assetRef.asset_type == 'Server'"></slot>
      <!-- -->
      <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        value="Reset"
      />
      <!-- -->
      <input 
        class="submit col-span-2" type="submit" :value="submitText"
      />
    </form>
  </div>
</template>
