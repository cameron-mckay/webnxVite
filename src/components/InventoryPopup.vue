<!-- Identical to PartSearchComponent but without quantities and query strings -->
<template>
    <div v-smooth-resize="{ delay: 50, transition: 800, fineTune: 27 }">
        <!-- If there are parts -->
        <h1 class="text-4xl mb-4">Your Inventory:</h1>
        <div v-if="inventory.length != 0">
            <!-- Headers -->
            <div class="grid grid-cols-4 relative leading-10 text-center p-2 transition font-bold">
                <p>NXID</p>
                <p>Manufacturer</p>
                <p>Name</p>
                <p>Quantity</p>
                <p></p>
            </div>
            <!-- Asset part component for each search result -->
            <PopupInventoryItemComponent v-for="item in inventory" v-bind:key="item.part._id"
                @plus='$emit("addPartAction", item)' :item="item" />
        </div>
        <!-- If there are no results -->
        <div v-else>
            <p>is empty...</p>
        </div>
    </div>
</template>
<script setup lang="ts">
import type { LoadedCartItem } from '../plugins/interfaces';
import PopupInventoryItemComponent from './PopupInventoryItemComponent.vue';

// Props interface
interface Props {
    inventory: LoadedCartItem[]
}

// Define shit
let { inventory } = defineProps<Props>()
// Search function
</script>
