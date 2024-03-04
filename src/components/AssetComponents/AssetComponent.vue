<script setup lang="ts">
import { AssetSchema } from '../../plugins/interfaces';
import SVGPencil from '../GenericComponents/SVG/SVGPencil.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
import SVGEye from '../GenericComponents/SVG/SVGEye.vue';

interface Props {
  asset: AssetSchema;
  edit?: boolean;
  add?: boolean;
  view?: boolean;
}

const { asset, edit, add, view } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="background-and-border group-hover:bab-hover grid grid-cols-3 p-1 text-center leading-8 group-hover:rounded-bl-none md:grid-cols-6 md:p-2 md:leading-10"
    >
      <p>{{ asset.asset_tag }}</p>
      <p class="hidden break-words md:block">{{ asset.building }}</p>
      <p class="break-words">{{ asset.asset_type }}</p>
      <p class="hidden break-words md:block">{{ asset.chassis_type }}</p>
      <p class="hidden break-words md:block" v-if="asset.live">Live</p>
      <p class="hidden break-words md:block" v-else-if="asset.asset_type=='Server'&&asset.in_rack">AVAIL</p>
      <p class="hidden break-words md:block" v-else>Inactive</p>
      <div class="my-auto flex justify-end">
        <!-- Pencil -->
        <RouterLink :to="'/assets/edit?asset_tag='+asset.asset_tag"
            v-if="edit === true"
            class="button-icon hover:button-icon-hover active:button-icon-active"
            title="Edit asset"
        >
          <SVGPencil
            v-on:click="$emit('editPartAction')"
          />
        </RouterLink>
        <!-- Plus -->
        <PlusButton
          v-if="add === true"
          v-on:click="$emit('addPartAction')"
        />
        <!-- Eyeball -->
        <RouterLink :to="'/assets/view?asset_tag='+asset.asset_tag"
            v-if="view === true"
            title="View Asset"
            class="button-icon hover:button-icon-hover active:button-icon-active"
        >
          <SVGEye
            v-on:click="$emit('viewPartAction')"
          />
        </RouterLink>
      </div>
    </div>
    <div class="group-hover:bab-drop-hover bab-drop">
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
          <pre>{{ asset.notes }}</pre>
        </div>
    </div>
  </div>
</template>
