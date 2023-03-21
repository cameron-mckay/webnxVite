<script setup lang="ts">
// Get http and store from props
import { Ref, onMounted, ref, watch } from "vue";
import type { PartSchema } from "../plugins/interfaces";
import CustomDropdownCompononent from "./CustomDropdownComponent.vue";

// Props interface
interface Props {
  title: string;
  submitText: string;
  strict: boolean;
  oldPart?: PartSchema;
}

const { title, submitText, strict, oldPart } = defineProps<Props>();
// END OF PROPS
let part: Ref<PartSchema> = ref(
  JSON.parse(JSON.stringify(oldPart)) as PartSchema
);
let partCopy = JSON.parse(JSON.stringify(oldPart));
let firstLoad = false;

// Reset form
function resetForm() {
  part.value = JSON.parse(JSON.stringify(partCopy));
}

// Clear out fields when part type is changed
onMounted(() => {
  watch(
    () => part.value.type,
    () => {
      delete part.value.frequency;
      delete part.value.chipset;
      delete part.value.memory_type;
      delete part.value.peripheral_type;
      delete part.value.storage_interface;
      delete part.value.capacity;
      delete part.value.capacity_unit;
      delete part.value.num_ports;
      delete part.value.port_type;
      delete part.value.cable_end1;
      delete part.value.cable_end2;
    }
  );

  // Clear out connector type when storage interface is changed
  watch(
    () => part.value.storage_interface,
    () => {
      if (part.value.storage_interface != "NVME") {
        delete part.value.port_type;
      }
    }
  );
});
</script>

<template>
  <div class="body">
    <h1 class="mb-4 text-4xl">{{ title }}</h1>
    <form
      id="form"
      @submit.prevent="$emit('partSubmit', part)"
      @reset.prevent="resetForm"
      class="grid grid-cols-2"
    >
      <label>NXID: </label>
      <input
        :required="strict"
        v-model="part.nxid"
        type="text"
        placeholder="NXID"
      />
      <label>Manufacturer: </label>
      <input
        :required="strict"
        v-model="part.manufacturer"
        type="text"
        placeholder="Manufacturer"
      />
      <label>Part Name: </label>
      <input
        :required="strict"
        v-model="part.name"
        type="text"
        placeholder="Part Name"
      />
      <label v-if="strict && JSON.stringify(oldPart) == JSON.stringify({})"
        >Quantity:
      </label>
      <input
        :required="strict"
        v-if="strict && JSON.stringify(oldPart) == JSON.stringify({})"
        v-model="part.quantity"
        type="number"
        min="0"
        placeholder="Quantity"
      />
      <label>Shelf Location: </label>
      <input
        :required="strict"
        v-model="part.shelf_location"
        type="text"
        placeholder="Shelf Location"
      />
      <label>Part Type: </label>
      <CustomDropdownCompononent
        :required="strict"
        :defaultValue="part.type"
        :options="[
          'Motherboard',
          'CPU',
          'Memory',
          'Storage',
          'Peripheral Card',
          'GPU',
          'Cable',
          'Backplane',
        ]"
        @updateValue="
          (value) => {
            part.type = value;
          }
        "
      />

      <div
        v-if="part.type == 'Motherboard'"
        class="col-span-2 grid grid-cols-2"
      >
        <label class="col-span-1">Chipset: </label>
        <input
          class="col-span-1"
          :required="strict"
          v-model="part.chipset"
          type="text"
          placeholder="Chipset"
        />
      </div>

      <div v-if="part.type == 'CPU'" class="col-span-2 grid grid-cols-2">
        <label>Chipset: </label>
        <input
          :required="strict"
          v-model="part.chipset"
          type="text"
          placeholder="Chipset"
        />
        <label>Frequency(GHz): </label>
        <input
          :required="strict"
          v-model="part.frequency"
          type="number"
          step="any"
          min="0"
          placeholder="Frequency"
        />
      </div>
      <div v-if="part.type == 'Memory'" class="col-span-2 grid grid-cols-2">
        <label>Frequency(MHz): </label>
        <input
          :required="strict"
          v-model="part.frequency"
          type="number"
          step="any"
          min="0"
          placeholder="Frequency"
        />
        <label>Capacity(GB): </label>
        <input
          :required="strict"
          v-model="part.capacity"
          type="number"
          step="any"
          min="0"
          placeholder="Capacity"
        />
        <label>Type: </label>
        <select v-model="part.memory_type">
          <option disabled value="">Memory type</option>
          <option>UDIMM</option>
          <option>ECC</option>
          <option>REG</option>
        </select>
      </div>
      <div
        v-if="part.type == 'Peripheral Card'"
        class="col-span-2 grid grid-cols-2"
      >
        <label>Card type: </label>
        <CustomDropdownCompononent
          :required="strict"
          :options="['RAID', 'JBOD', 'NIC', 'Adapter']"
          @updateValue="
            (value) => {
              part.peripheral_type = value;
            }
          "
          :defaultValue="part.peripheral_type"
        />
        <label>Port Type: </label>
        <CustomDropdownCompononent
          v-if="part.port_type == 'NIC'"
          :required="strict"
          :options="['SFP', 'RJ45']"
          @updateValue="
            (value) => {
              part.port_type = value;
            }
          "
          :defaultValue="part.port_type"
        />
        <CustomDropdownCompononent
          v-else
          :required="strict"
          :options="['SAS', 'Mini SAS HD']"
          @updateValue="
            (value) => {
              part.port_type = value;
            }
          "
          :defaultValue="part.port_type"
        />
      </div>
      <div v-if="part.type == 'Storage'" class="col-span-2 grid grid-cols-2">
        <label>Storage interface: </label>
        <select :required="strict" v-model="part.storage_interface">
          <option disabled value="">Pick one</option>
          <option>SATA</option>
          <option>SAS</option>
          <option>NVME</option>
        </select>
        <label>Capacity: </label>
        <div class="flex justify-between">
          <input
            :required="strict"
            v-model="part.capacity"
            step="any"
            min="0"
            type="number"
          />
          <CustomDropdownCompononent
            :required="strict"
            :options="['GB', 'TB']"
            @updateValue="
              (value) => {
                part.capacity_unit = value;
              }
            "
            :defaultValue="part.capacity_unit"
          />
        </div>
        <div
          v-if="part.storage_interface == 'NVME'"
          class="col-span-2 grid grid-cols-2"
        >
          <label>Connector Type: </label>
          <CustomDropdownCompononent
            :required="strict"
            :options="['SAS', 'M.2']"
            @updateValue="
              (value) => {
                part.port_type = value;
              }
            "
            :defaultValue="part.port_type"
          />
        </div>
      </div>
      <div v-if="part.type == 'GPU'" class="col-span-2 grid grid-cols-2">
        <!--   -->
      </div>
      <div v-if="part.type == 'Cable'" class="col-span-2 grid grid-cols-2">
        <label>Cable end 1: </label>
        <input :required="strict" v-model="part.cable_end1" type="text" />
        <label>Cable end 2: </label>
        <input :required="strict" v-model="part.cable_end2" type="text" />
      </div>
      <div v-if="part.type == 'Backplane'" class="col-span-2 grid grid-cols-2">
        <label>Storage interface: </label>
        <CustomDropdownCompononent
          :required="strict"
          :options="['SAS', 'NVME']"
          @updateValue="
            (value) => {
              part.storage_interface = value;
            }
          "
          :defaultValue="part.storage_interface"
        />
        <label>Ports: </label>
        <CustomDropdownCompononent
          :required="strict"
          :options="['SAS', 'Mini SAS HD']"
          @updateValue="
            (value) => {
              part.port_type = value;
            }
          "
          :defaultValue="part.port_type"
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
