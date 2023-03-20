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
      class="grid grid-cols-4 rounded-lg p-2 text-center leading-10 group-hover:rounded-bl-none group-hover:bg-zinc-400 md:grid-cols-6"
    >
      <p>{{ asset.asset_tag }}</p>
      <p class="break-words">{{ asset.building }}</p>
      <p class="hidden break-words md:block">{{ asset.asset_type }}</p>
      <p class="hidden break-words md:block">{{ asset.chassis_type }}</p>
      <p v-if="asset.live">Live</p>
      <p v-else>Inactive</p>
      <div class="flex justify-center">
        <img
          v-if="edit === true"
          class="m-1 h-8 w-8 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500 md:h-10 md:w-10"
          src="../assets/pencil-solid.svg"
          v-on:click="$emit('editPartAction')"
        />
        <img
          v-if="add === true"
          class="m-1 h-8 w-8 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500 md:h-10 md:w-10"
          src="../assets/plus-solid.svg"
          v-on:click="$emit('addPartAction')"
        />
        <img
          v-if="view === true"
          class="m-1 h-8 w-8 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500 md:h-10 md:w-10"
          src="../assets/eye-solid.svg"
          v-on:click="$emit('viewPartAction')"
        />
      </div>
    </div>
    <div
      class="absolute z-50 hidden h-0 rounded-b-lg p-2 group-hover:block group-hover:h-auto group-hover:bg-zinc-400 group-hover:shadow-lg"
    >
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
