<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
AllTechsEvent,
  CartItem,
  LoadedCartItem,
  PartSchema,
  User,
} from '../../plugins/interfaces';
import AssetEventPartComponent from '../AssetComponents/AssetEventPartComponent.vue';

interface Props {
  user: User;
  parts: Map<string, PartSchema>;
  event: AllTechsEvent;
}

let { user, parts, event } = defineProps<Props>();


let existing = ref([] as LoadedCartItem[]);
let added = ref([] as LoadedCartItem[]);
let removed = ref([] as LoadedCartItem[]);

function loadPart(part: CartItem) {
  // Load part from map
  return {
    part: parts.get(part.nxid),
    serial: part.serial,
    quantity: part.quantity,
  } as LoadedCartItem;
}

onMounted(() => {
  // Get asset from map
  // Load existing parts
  existing.value = event.existing.map(loadPart);
  // Load added parts
  added.value = event.added.map(loadPart);
  // Laod removed parts
  removed.value = event.removed.map(loadPart);
});
</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="flex justify-between">
      <h1 class="mb-8 text-4xl leading-8 md:leading-10">
        {{ new Date(event.date).toLocaleString() }}
      </h1>
      <p>
        By:
        {{
          user.first_name + ' ' + user.last_name
        }}
      </p>
    </div>
    <div
      class="grid grid-cols-3 text-center font-bold md:grid-cols-4"
      v-if="existing.length > 0 || added.length > 0 || removed.length > 0"
    >
      <p class="hidden md:block">NXID</p>
      <p>Manufacturer</p>
      <p>Name</p>
      <p>Quantity</p>
    </div>
    <AssetEventPartComponent v-for="item of existing" :item="item" />
    <AssetEventPartComponent
      v-for="item of added"
      :item="item"
      :plus="true"
    />
    <del>
      <AssetEventPartComponent
        v-for="item of removed"
        :item="item"
        :minus="true"
      />
    </del>
  </div>
</template>
