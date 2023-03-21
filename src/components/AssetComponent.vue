<script setup lang="ts">
import { AssetSchema } from "../plugins/interfaces";

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
      class="background-and-border group-hover:bab-hover grid grid-cols-4 p-2 text-center leading-10 group-hover:rounded-bl-none md:grid-cols-6"
    >
      <p>{{ asset.asset_tag }}</p>
      <p class="break-words">{{ asset.building }}</p>
      <p class="hidden break-words md:block">{{ asset.asset_type }}</p>
      <p class="hidden break-words md:block">{{ asset.chassis_type }}</p>
      <p v-if="asset.live">Live</p>
      <p v-else>Inactive</p>
      <div class="flex justify-end">
        <img
          v-if="edit === true"
          class="button-icon"
          src="../assets/pencil-solid.svg"
          v-on:click="$emit('editPartAction')"
        />
        <img
          v-if="add === true"
          class="button-icon"
          src="../assets/plus-solid.svg"
          v-on:click="$emit('addPartAction')"
        />
        <img
          v-if="view === true"
          class="button-icon"
          src="../assets/eye-solid.svg"
          v-on:click="$emit('viewPartAction')"
        />
      </div>
    </div>
    <div class="group-hover:bab-drop-hover hidden">
      <p>{{ "Type: " + asset.asset_type }}</p>
      <p>{{ "Chassis: " + asset.chassis_type }}</p>
      <p>{{ "Manufacturer: " + asset.manufacturer }}</p>
      <p>{{ "Model: " + asset.model }}</p>
      <p>
        {{
          "Date Updated: " +
          new Date(Date.parse(asset.date_updated!)).toDateString()
        }}
      </p>
      <p>
        {{
          "Date Created: " +
          new Date(Date.parse(asset.date_created!)).toDateString()
        }}
      </p>
    </div>
  </div>
</template>
