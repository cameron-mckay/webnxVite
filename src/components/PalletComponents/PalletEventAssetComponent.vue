<script setup lang="ts">
import { AssetSchema } from '../../plugins/interfaces';
import SVGRoundMinus from '../GenericComponents/SVG/SVGRoundMinus.vue';
import SVGRoundPlus from '../GenericComponents/SVG/SVGRoundPlus.vue';
interface Props {
  asset: AssetSchema;
  plus?: boolean;
  minus?: boolean;
}

const { asset } = defineProps<Props>();
</script>

<template>
  <div class="group relative col-span-4 my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-2 md:grid-cols-3 rounded-md p-1 text-center leading-8 md:p-2 md:leading-10"
    >
      <div class="flex">
        <!-- Plus -->
        <SVGRoundPlus
          class="my-auto h-8 w-8 shrink-0 p-2 text-green-500 shadow-none mx-1 md:h-10 md:w-10"
          v-if="plus"
        />
        <!-- Minus -->
        <SVGRoundMinus
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-red-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-else-if="minus"
        />
        <div
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        ></div>
        <p>{{ asset.asset_tag }}</p>
      </div>
      <p class="break-words hidden md:block">{{ asset.manufacturer }}</p>
      <p class="break-words">{{ asset.asset_type }}</p>
    </div>
    <div
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="asset.part"
    >
        <p v-if="asset.building">Building: {{ asset.building }}</p>
        <p v-if="asset.asset_type">Asset Type: {{ asset.asset_type }}</p>
        <p v-if="asset.chassis_type">Chassis Type: {{ asset.chassis_type }}</p>
        <p v-if="asset.manufacturer">Manufacturer: {{ asset.manufacturer }}</p>
        <p v-if="asset.model">Model: {{ asset.model }}</p>
        <p v-if="asset.serial">Serial: {{ asset.serial }}</p>
        <p v-if="asset.bay">Bay: {{ asset.bay }}</p>
        <p v-if="asset.parent">Chassis Tag: {{ asset.parent }}</p>
        <p v-if="asset.live != undefined">Status: {{ asset.live ? "Live" : "Invactive" }}</p>
        <p v-if="asset.rails != undefined">Rails: {{ asset.rails ? "Yes" : "No"}}</p>
        <p v-if="asset.in_rack != undefined">In Rack: {{ asset.in_rack ? "Yes" : "No"}}</p>
        <p v-if="asset.public_port">Public Port: {{ asset.public_port }}</p>
        <p v-if="asset.private_port">Private Port: {{ asset.private_port }}</p>
        <p v-if="asset.ipmi_port">IPMI Port: {{ asset.ipmi_port }}</p>
        <p v-if="asset.power_port">Power Port: {{ asset.power_port }}</p>
        <p v-if="asset.pallet">Pallet: {{ asset.pallet }}</p>
        <p>Date added: {{ new Date(Date.parse(asset.date_created!)).toLocaleString() }}</p>
        <p v-if="asset.date_replaced">Date removed: {{ new Date(Date.parse(asset.date_replaced!)).toLocaleString() }}</p>
        <div class="my-4" v-if="asset.notes">
          <h1 class="mb-2 text-2xl">Notes:</h1>
          <pre class="whitespace-pre-wrap notes-with-links">{{ asset.notes }}</pre>
        </div>
    </div>
  </div>
</template>
