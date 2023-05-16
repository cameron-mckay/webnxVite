<script setup lang="ts">
// Get http and store from props
import { Ref, onMounted, ref, watch } from 'vue';
import type { PartSchema } from '../../plugins/interfaces';
import CustomDropdownComponent from '../GenericComponents/CustomDropdownComponent.vue';

// Props interface
interface Props {
  title: string;
  submitText: string;
  strict: boolean;
  oldPart?: PartSchema;
  customResetText?: string;
}

const { title, submitText, strict, oldPart, customResetText } =
  defineProps<Props>();
// END OF PROPS
let part: Ref<PartSchema> = ref(
  JSON.parse(JSON.stringify(oldPart)) as PartSchema
);
let partCopy = JSON.parse(JSON.stringify(oldPart));
let image = ref<File>();
let imageUrl = ref<string>();
let url = import.meta.env.VITE_API_URL;
let serials = ref('');
const allowedFileTypes = ['image/png', 'image/jpeg', 'image/webp'];
// Reset form
function resetForm() {
  part.value = JSON.parse(JSON.stringify(partCopy));
  image = ref<File>();
  imageUrl.value = '';
  if (oldPart && JSON.stringify(oldPart) != JSON.stringify({}))
    imageUrl.value = `${url}/images/parts/${oldPart.nxid}`;
  serials.value = '';
}

// Any type because typedefs do not exists for File Uploads
function handleImageUpload(event: any) {
  // Check file type
  if (allowedFileTypes.includes(event.target.files![0].type)) {
    // File is allowed
    // Get blob
    image.value = event.target.files![0];
    // Create URL pointing to blob
    imageUrl.value = URL.createObjectURL(image.value!);
  } else {
    // Reset file blob
    image = ref<File>();
    // Reset image URL
    imageUrl.value = '';
    // Cheap trick so I don't have to make an extends
    let tempVar = document.getElementById('imageUpload') as any;
    tempVar.value = null;
  }
}

// Clear out fields when part type is changed
onMounted(() => {
  if (oldPart && JSON.stringify(oldPart) != JSON.stringify({}))
    imageUrl.value = `${url}/images/parts/${oldPart.nxid}`;
  if (JSON.stringify(oldPart) == JSON.stringify({}) && strict)
    part.value.serialized = false;

  watch(
    () => part.value.type,
    () => {
      delete part.value.frequency;
      delete part.value.chipset;
      delete part.value.memory_type;
      delete part.value.memory_gen;
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
  watch(serials, () => {
    // Watch S/Ns and update part record with spliced and filtered records
    if (serials.value != '') {
      part.value.serials = serials.value
        // Splits string at newline
        .split('\n')
        // Filters out blank lines
        .filter((sn) => sn != '')
        // Gets rid of duplicates
        .filter((sn, i, arr) => i == arr.indexOf(sn))
        .map((sn: string) => sn.replace(/[, ]+/g, ' ').trim());
    }
  });
  watch(
    () => part.value.serialized,
    () => {
      if (part.value.serialized && !part.value.serials) {
        part.value.serials = [];
      }
      if (!part.value.serialized) {
        delete part.value.serials;
      }
    }
  );

  // Clear out connector type when storage interface is changed
  watch(
    () => part.value.storage_interface,
    () => {
      if (part.value.storage_interface != 'NVME') {
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
      @submit.prevent="
        () => {
          if (strict) $emit('partSubmit', part, image);
          else $emit('partSubmit', part);
        }
      "
      @reset.prevent="resetForm"
      class="grid grid-cols-2"
    >
      <label v-if="strict">Image:</label>
      <div v-if="strict">
        <input
          class="m-1 text-black dark:text-gray-200"
          type="file"
          accept="image/*"
          id="imageUpload"
          @change="handleImageUpload"
        />
        <img class="col-span-2 my-2" v-if="imageUrl" :src="imageUrl" />
      </div>
      <label>NXID:</label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="part.nxid"
        type="text"
        placeholder="NXID"
      />
      <label>Manufacturer:</label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="part.manufacturer"
        type="text"
        placeholder="Manufacturer"
      />
      <label>Part Name:</label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="part.name"
        type="text"
        placeholder="Part Name"
      />
      <label v-if="strict && JSON.stringify(oldPart) == JSON.stringify({})">
        Serialized:
      </label>
      <select
        :required="strict"
        v-model="part.serialized"
        v-if="strict && JSON.stringify(oldPart) == JSON.stringify({})"
        class="textbox m-1"
      >
        <option selected :value="false">No</option>
        <option :value="true">Yes</option>
      </select>
      <label
        v-if="
          strict &&
          JSON.stringify(oldPart) == JSON.stringify({}) &&
          part.serialized === false
        "
      >
        Quantity:
      </label>
      <input
        class="textbox m-1"
        required
        v-if="
          strict &&
          JSON.stringify(oldPart) == JSON.stringify({}) &&
          part.serialized === false
        "
        v-model="part.quantity"
        type="number"
        min="0"
        placeholder="Quantity"
      />
      <label
        v-if="
          strict &&
          JSON.stringify(oldPart) == JSON.stringify({}) &&
          part.serialized
        "
      >
        Serial numbers:
      </label>
      <textarea
        class="textbox m-1"
        v-if="
          strict &&
          JSON.stringify(oldPart) == JSON.stringify({}) &&
          part.serialized
        "
        v-model="serials"
        placeholder="One per line.  Drag to resize"
      />
      <label>Rack Number:</label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="part.rack_num"
        type="number"
        min="0"
        placeholder="Rack Number"
      />
      <label>Shelf Location:</label>
      <input
        class="textbox m-1"
        :required="strict"
        v-model="part.shelf_location"
        type="text"
        placeholder="Shelf Location"
      />
      <label>Part Type:</label>
      <CustomDropdownComponent
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
          'Heatsink',
          'Optic',
        ]"
        @updateValue="
          (value: string) => {
            part.type = value;
          }
        "
      />

      <div
        v-if="part.type == 'Motherboard'"
        class="col-span-2 grid grid-cols-2"
      >
        <label class="col-span-1">Chipset:</label>
        <input
          class="textbox col-span-1 m-1"
          :required="strict"
          v-model="part.chipset"
          type="text"
          placeholder="Chipset"
        />
        <label>Memory Generation:</label>
        <CustomDropdownComponent
          :required="strict"
          :defaultValue="part.memory_gen"
          :options="['DDR5', 'DDR4', 'DDR3', 'DDR2', 'DDR']"
          @updateValue="
            (value: string) => {
              part.memory_gen = value;
            }
          "
        />
      </div>

      <div v-if="part.type == 'CPU'" class="col-span-2 grid grid-cols-2">
        <label>Chipset:</label>
        <input
          class="textbox m-1"
          :required="strict"
          v-model="part.chipset"
          type="text"
          placeholder="Chipset"
        />
      </div>
      <div v-if="part.type == 'Memory'" class="col-span-2 grid grid-cols-2">
        <label>Frequency(MHz):</label>
        <input
          class="textbox m-1"
          :required="strict"
          v-model="part.frequency"
          type="number"
          step="any"
          min="0"
          placeholder="Frequency"
        />
        <label>Memory Generation:</label>
        <CustomDropdownComponent
          :required="strict"
          :defaultValue="part.memory_gen"
          :options="['DDR5', 'DDR4', 'DDR3', 'DDR2', 'DDR']"
          @updateValue="
            (value: string) => {
              part.memory_gen = value;
            }
          "
        />
        <label>Capacity(GB):</label>
        <input
          class="textbox m-1"
          :required="strict"
          v-model="part.capacity"
          type="number"
          step="any"
          min="0"
          placeholder="Capacity"
        />
        <label>Type:</label>
        <select v-model="part.memory_type" class="textbox m-1">
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
        <label>Card type:</label>
        <CustomDropdownComponent
          :required="strict"
          :options="['RAID', 'JBOD', 'NIC', 'Adapter']"
          @updateValue="
            (value: string) => {
              part.peripheral_type = value;
            }
          "
          :defaultValue="part.peripheral_type"
        />
        <label>Port Type:</label>
        <CustomDropdownComponent
          v-if="part.port_type == 'NIC'"
          :required="strict"
          :options="['SFP', 'RJ45']"
          @updateValue="
            (value: string) => {
              part.port_type = value;
            }
          "
          :defaultValue="part.port_type"
        />
        <CustomDropdownComponent
          v-else
          :required="strict"
          :options="['SAS', 'Mini SAS HD']"
          @updateValue="
            (value: string) => {
              part.port_type = value;
            }
          "
          :defaultValue="part.port_type"
        />

        <label>Num Ports:</label>
        <input
          class="textbox m-1"
          :required="strict"
          v-model="part.num_ports"
          type="number"
          min="0"
          placeholder="Num Ports"
        />
      </div>
      <div v-if="part.type == 'Storage'" class="col-span-2 grid grid-cols-2">
        <label>Storage interface:</label>
        <select
          :required="strict"
          v-model="part.storage_interface"
          class="textbox m-1"
        >
          <option disabled value="">Pick one</option>
          <option>SATA</option>
          <option>SAS</option>
          <option>NVME</option>
        </select>
        <label>Capacity:</label>
        <div class="flex justify-between">
          <input
            class="textbox m-1"
            :required="strict"
            v-model="part.capacity"
            step="any"
            min="0"
            type="number"
          />
          <CustomDropdownComponent
            :required="strict"
            :options="['GB', 'TB']"
            @updateValue="
              (value: string) => {
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
          <label>Connector Type:</label>
          <CustomDropdownComponent
            :required="strict"
            :options="['U.2', 'U.3', 'M.2']"
            @updateValue="
              (value: string) => {
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
      <div v-if="part.type == 'Heatsink'" class="col-span-2 grid grid-cols-2">
        <!--   -->
      </div>
      <div v-if="part.type == 'Optic'" class="col-span-2 grid grid-cols-2">
        <!--   -->
      </div>
      <div v-if="part.type == 'Cable'" class="col-span-2 grid grid-cols-2">
        <label>Cable end 1:</label>
        <input
          class="textbox m-1"
          :required="strict"
          v-model="part.cable_end1"
          type="text"
        />
        <label>Cable end 2:</label>
        <input
          class="textbox m-1"
          :required="strict"
          v-model="part.cable_end2"
          type="text"
        />
      </div>
      <div v-if="part.type == 'Backplane'" class="col-span-2 grid grid-cols-2">
        <label>Storage interface:</label>
        <CustomDropdownComponent
          :required="strict"
          :options="['SAS', 'NVME']"
          @updateValue="
            (value: string) => {
              part.storage_interface = value;
            }
          "
          :defaultValue="part.storage_interface"
        />
        <label>Ports:</label>
        <CustomDropdownComponent
          :required="strict"
          :options="['SAS', 'Mini SAS HD']"
          @updateValue="
            (value: string) => {
              part.port_type = value;
            }
          "
          :defaultValue="part.port_type"
        />
      </div>
      <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        :value="customResetText ? customResetText : 'Reset'"
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
