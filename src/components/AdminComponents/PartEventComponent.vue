<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
PartEvent,
  CartItem,
  LoadedCartItem,
  PartSchema,
  User,
} from '../../plugins/interfaces';
import AssetEventPartComponent from '../AssetComponents/AssetEventPartComponent.vue';

interface Props {
  users: Map<string,User>;
  parts: Map<string, PartSchema>;
  event: PartEvent;
}

let { users, parts, event } = defineProps<Props>();

let user = users.get(event.info.by!)!
let added = ref([] as LoadedCartItem[]);
let removed = ref([] as LoadedCartItem[]);

function loadPart(part: CartItem) {
  // Load part from map
  return {
    part: parts.get(part.nxid)||{nxid: part.nxid, manufacturer: "DELETED PART", name: "DELETED PART", type: "DELETED", notes: "The part info associated with this NXID has been deleted."},
    serial: part.serial,
    quantity: part.quantity,
  } as LoadedCartItem;
}

onMounted(() => {
  // Get asset from map
  // Load existing parts
  // Load added parts
  added.value = event.added.map(loadPart);
  // Laod removed parts
  removed.value = event.removed.map(loadPart);
});
</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="flex justify-between">
      <h1 class="text-4xl leading-8 md:leading-10">
        {{ new Date(event.date).toLocaleString() }}
      </h1>
    </div>
    <div class="text-lg [&>*]:py-2">
      <p>
        By:
        {{
          user.first_name + ' ' + user.last_name
        }}
      </p>
      <p v-if="event.info.pallet_tag">
        Pallet Tag:
        {{
          event.info.pallet_tag
        }}
      </p>
      <p v-else-if="event.info.asset_tag">
        Asset Tag:
        {{
          event.info.asset_tag
        }}
      </p>
      <p v-else-if="event.info.owner&&event.info.owner=='sold'">
        eBay Order ID:
        {{
          event.info.ebay ? event.info.ebay : "Order ID not present"
        }}
      </p>
      <p v-else-if="event.info.owner">
        User Inventory:
        {{
          users.get(event.info.owner)?.first_name + " " + users.get(event.info.owner)?.last_name
        }}
      </p>
      <p v-else-if="event.info.location">
        Location:
        {{
          event.info.location
        }}
      </p>
      <p v-else>
        ERROR
      </p>
    </div>
    <div
      class="grid grid-cols-3 text-center font-bold md:grid-cols-4"
      v-if="added.length > 0 || removed.length > 0"
    >
      <p class="hidden md:block">NXID</p>
      <p>Manufacturer</p>
      <p>Name</p>
      <p>Quantity</p>
    </div>
    <AssetEventPartComponent
      v-for="item of added"
      :item="item"
      :plus="true"
    />
    <AssetEventPartComponent
      v-for="item of removed"
      :item="item"
      :minus="true"
    />
  </div>
</template>
