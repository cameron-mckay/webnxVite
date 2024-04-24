<script setup lang="ts">
import { AssetSchema } from '../../plugins/interfaces';
import TrashButton from '../GenericComponents/Buttons/TrashButton.vue';
import FileButton from '../GenericComponents/Buttons/FileButton.vue';

interface Props {
  asset: AssetSchema;
}

const { asset } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="background-and-border group-hover:bab-hover p-1 text-center leading-8 group-hover:rounded-bl-none md:p-2 md:leading-10 flex justify-between"
    >
      <p class="font-bold">{{ asset.template_name }}</p>
      <div class="my-auto flex justify-end">
        <!-- BUTTONS GO HERE -->
        <FileButton @click="$emit('load')"/>
        <TrashButton @click="$emit('delete')"/>
      </div>
    </div>
    <div class="group-hover:bab-drop-hover bab-drop">
        <p class="font-bold text-xl">Asset Details:</p>
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
        <div class="my-4" v-if="asset.notes">
          <h1 class="mb-2 text-2xl">Notes:</h1>
          <pre class="whitespace-pre-wrap notes-with-links">{{ asset.notes }}</pre>
        </div>
        <br>
        <p v-if="asset.parts&&asset.parts.length>0" class="font-bold text-xl">Parts:</p>
        <p v-for="part of asset.parts">{{part.nxid}} - {{part.quantity}}</p>
    </div>
  </div>
</template>
