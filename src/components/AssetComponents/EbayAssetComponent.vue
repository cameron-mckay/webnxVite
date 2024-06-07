<script setup lang="ts">
import {
  AssetSchema,
} from '../../plugins/interfaces';
import TrashButton from '../GenericComponents/Buttons/TrashButton.vue';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';

interface Props {
  asset: AssetSchema;
  readOnly?: boolean
}

let { asset, readOnly } = defineProps<Props>();

</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="grid md:grid-cols-3">
      <div
        class="detail-row col-span-1"
      >
        <h1
          v-if="asset.migrated"
          class="col-span-2 mb-4 rounded-md bg-green-400 p-2 text-center text-4xl leading-8 md:leading-10"
        >MIGRATED</h1>
        <h1 class="col-span-2 mb-4 text-4xl leading-8 md:leading-10">
          {{ asset.asset_tag }}
        </h1>
        <p class="hidden"></p>
        <p>Building:</p>
        <p>
          {{ asset.building }}
        </p>

        <p>Asset Type:</p>
        <p>
          {{ asset.asset_type }}
        </p>

        <div v-if="asset.chassis_type" class="detail-row col-span-2">
          <p>Chassis Type</p>
          <p>
            {{ asset.chassis_type }}
          </p>
        </div>

        <div v-if="asset.manufacturer" class="detail-row col-span-2">
          <p>Manufacturer:</p>
          <p>
            {{ asset.manufacturer }}
          </p>
        </div>

        <div v-if="asset.model" class="detail-row col-span-2">
          <p>Model:</p>
          <p>
            {{ asset.model }}
          </p>
        </div>

        <div v-if="asset.serial" class="detail-row col-span-2">
          <p>Serial:</p>
          <p>
            {{ asset.serial }}
          </p>
        </div>

        <div v-if="asset.units" class="detail-row col-span-2">
          <p>Rack Units:</p>
          <p>
            {{ asset.units }}
          </p>
        </div>
        
        <div v-if="asset.num_psu" class="detail-row col-span-2">
          <p>Num PSUs:</p>
          <p>
            {{ asset.num_psu }}
          </p>
        </div>
        
        <div v-if="asset.psu_model" class="detail-row col-span-2">
          <p>PSU model:</p>
          <p>
            {{ asset.psu_model }}
          </p>
        </div>
        
        <div v-if="asset.parent" class="detail-row col-span-2">
          <p>Parent Chassis:</p>
          <p>
            {{ asset.parent }}
          </p>
        </div>

        <div v-if="asset.cable_type" class="detail-row col-span-2">
          <p>Cable Type:</p>
          <p>
            {{ asset.cable_type }}
          </p>
        </div>

        <div v-if="asset.num_bays" class="detail-row col-span-2">
          <p>Num bays:</p>
          <p>
            {{ asset.num_bays }}
          </p>
        </div>

        <div v-if="asset.bay_type" class="detail-row col-span-2">
          <p>Bay Type:</p>
          <p>
            {{ asset.bay_type }}
          </p>
        </div>

        <div v-if="asset.fw_rev" class="detail-row col-span-2">
          <p>FW Revision:</p>
          <p>
            {{ asset.fw_rev }}
          </p>
        </div>
        <div v-if="asset.bay" class="detail-row col-span-2">
          <p>Bay:</p>
          <p>
            {{ asset.bay }}
          </p>
        </div>

        <div v-if="asset.in_rack" class="detail-row col-span-2">
          <p>In Rack:</p>
          <p>
            {{ asset.in_rack ? "Yes" : "No" }}
          </p>
        </div>

        <div v-if="asset.live" class="detail-row col-span-2">
          <p>Status:</p>
          <p>
            {{ asset.live ? "Live" : "Inactive" }}
          </p>
        </div>

        <div v-if="asset.rails" class="detail-row col-span-2">
          <p>Rails:</p>
          <p>
            {{ asset.rails ? "Yes" : "No" }}
          </p>
        </div>

        <div v-if="asset.power_port" class="detail-row col-span-2">
          <p>Power Port:</p>
          <p>
            {{ asset.power_port }}
          </p>
        </div>

        <div v-if="asset.public_port" class="detail-row col-span-2">
          <p>Public Port:</p>
          <p>
            {{ asset.public_port }}
          </p>
        </div>

        <div v-if="asset.private_port" class="detail-row col-span-2">
          <p>Private Port:</p>
          <p>
            {{ asset.private_port }}
          </p>
        </div>

        <div v-if="asset.ipmi_port" class="detail-row col-span-2">
          <p>IPMI Port:</p>
          <p>
            {{ asset.ipmi_port }}
          </p>
        </div>

        <div v-if="asset.pallet" class="detail-row col-span-2">
          <p>Pallet:</p>
          <p>
            {{ asset.pallet }}
          </p>
        </div>

        <div v-if="asset.notes" class="detail-row col-span-2">
          <p class="col-span-2">Notes:</p>
          <pre class="col-span-2 notes-with-links whitespace-pre-wrap">{{ asset.notes }}</pre>
        </div>

      </div>
      <div class="md:col-span-2"
          v-if="asset.parts.length>0"
      >
        <div class="flex justify-between">
        <h1
          class="mb-4 mt-4 text-4xl leading-8 md:mt-0 md:leading-10"
        >
          Parts:
        </h1>

        <TrashButton v-if="!readOnly" class="mt-0" @click="$emit('delete', asset.asset_tag)"/>
        </div>
        <div
          class="grid grid-cols-3 text-center font-bold md:grid-cols-4"
        >
          <p class="hidden md:block">NXID</p>
          <p>Manufacturer</p>
          <p>Name</p>
          <p>Serial</p>
        </div>
        <div class="group relative col-span-4 my-1" v-for="item of asset.parts">
          <div
            class="group-hover:bab-hover background-and-border grid grid-cols-3 rounded-md p-1 text-center leading-8 md:grid-cols-4 md:p-2 md:leading-10"
          >
            <p>{{ item.part.nxid }}</p>
            <p class="break-words">{{ item.part.manufacturer }}</p>
            <p class="break-words">{{ item.part.name }}</p>
            <p v-if="item.alreadySerialized||readOnly" class="break-words">{{ item.serial }}</p>
            <input v-else class="break-words search" type="text" placeholder="Serial" v-model="item.serial" required/>
          </div>
          <InlinePartSpecComponent
            class="group-hover:bab-drop-hover bab-drop relative"
            :part="item.part"
          />
        </div>
      </div>
      <div v-else class="col-span-2 flex justify-end">
        <TrashButton v-if="!readOnly" class="mt-0" @click="$emit('delete', asset.asset_tag)"/>
      </div>
    </div>
  </div>
</template>
