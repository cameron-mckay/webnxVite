<!-- Identical to PartSearchComponent but without quantities and query strings -->
<template>
  <div>
    <!-- If there are parts -->
    <h1 class="mb-4 text-4xl">Your Inventory:</h1>
    <div v-if="inventory.length != 0">
      <!-- Headers -->
      <div
        class="relative grid grid-cols-4 p-1 text-center font-bold leading-8 transition md:grid-cols-5 md:p-2 md:leading-10"
      >
        <p class="hidden md:block">NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p>Quantity</p>
        <p></p>
      </div>
      <!-- Asset part component for each search result -->
      <PopupInventoryItemComponent
        v-for="item in inventory"
        v-bind:key="item.part._id"
        @plus="$emit('addPartAction', item)"
        :item="item"
      />
    </div>
    <!-- If there are no results -->
    <div v-else>
      <p>is empty...</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { LoadedCartItem } from "../../plugins/interfaces";
import PopupInventoryItemComponent from "./PopupInventoryItemComponent.vue";

// Props interface
interface Props {
  inventory: LoadedCartItem[];
}

// Define shit
let { inventory } = defineProps<Props>();
// Search function
</script>
