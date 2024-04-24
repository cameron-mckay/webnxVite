<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { DEFAULT_BUILDING } from '../../plugins/Constants';
import {
BoxEvent,
BoxSchema,
  CartItem,
  LoadedCartItem,
  PartSchema,
  User,
} from '../../plugins/interfaces';
import AssetEventPartComponent from '../AssetComponents/AssetEventPartComponent.vue';

interface Props {
  boxes: Map<string, BoxSchema>;
  user: User;
  parts: Map<string, PartSchema>;
  event: BoxEvent;
}

let { boxes, user, parts, event } = defineProps<Props>();

let box = ref({
  _id: '',
  box_tag: '',
  prev: '',
  next: '',
  building: DEFAULT_BUILDING,
  location: "",
  notes: "",
  by: "",
  date_created: new Date(),
  date_replaced: new Date(),
} as BoxSchema);

let prevBox = ref({} as BoxSchema);
let existingParts = ref([] as LoadedCartItem[]);
let addedParts = ref([] as LoadedCartItem[]);
let removedParts = ref([] as LoadedCartItem[]);

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
  box.value = boxes.has(event.box_id)
    ? boxes.get(event.box_id)!
    : box.value;
  // Load existing parts
  existingParts.value = event.existingParts.map(loadPart);
  // Load added parts
  addedParts.value = event.addedParts.map(loadPart);
  // Laod removed parts
  removedParts.value = event.removedParts.map(loadPart);
  // Check if asset info is updated
  if (event.info_updated && box.value?.prev != null) {
    // Get previous asset for strikethrough
    prevBox.value = boxes.get(box.value?.prev)
      ? boxes.get(box.value?.prev)!
      : {} as BoxSchema;
  }
});
</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="flex justify-between">
      <h1 class="mb-8 text-4xl leading-8 md:leading-10">
        {{ new Date(event.date_begin).toLocaleString() }}
      </h1>
      <p>
        By:
        {{
          user.first_name + ' ' + user.last_name
        }}
      </p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3">
      <div
        class="detail-row col-span-1"
      >
        <h1 class="col-span-2 mb-4 text-4xl leading-8 md:leading-10">
          {{ box.box_tag }}
        </h1>
        <p class="hidden"></p>
        <p>Building:</p>
        <p>
          <del v-if="prevBox.building&&(prevBox.building!=box.building)">{{ prevBox.building }}</del>
          {{ box.building }}
        </p>

        <p>Location:</p>
        <p>
          <del v-if="prevBox.location&&(prevBox.location!=box.location)">{{ prevBox.location }}</del>
          {{ box.location }}
        </p>
        <div v-if="box.notes || prevBox.notes" class="detail-row col-span-2">
          <p class="col-span-2">Notes:</p>
          <pre class="col-span-2 font-extrabold notes-with-links whitespace-pre-wrap">
            <del v-if="prevBox.notes && (prevBox.notes != box.notes)">{{ prevBox.notes }}</del>
            {{ box.notes }}
          </pre>
        </div>
      </div>
      <div class="col-span-2">
        <h1
          v-if="existingParts.length > 0 || addedParts.length > 0 || removedParts.length > 0"
          class="mb-4 mt-4 text-4xl leading-8 md:mt-0 md:leading-10"
        >
          Parts:
        </h1>
        <div
          class="grid grid-cols-3 text-center font-bold md:grid-cols-4"
          v-if="existingParts.length > 0 || addedParts.length > 0 || removedParts.length > 0"
        >
          <p class="hidden md:block">NXID</p>
          <p>Manufacturer</p>
          <p>Name</p>
          <p>Quantity</p>
        </div>
        <AssetEventPartComponent v-for="item of existingParts" :item="item" />
        <AssetEventPartComponent
          v-for="item of addedParts"
          :item="item"
          :plus="true"
        />
        <del>
          <AssetEventPartComponent
            v-for="item of removedParts"
            :item="item"
            :minus="true"
          />
        </del>
      </div>
      <div class="hidden md:block md:col-span1 md:h-full"></div>
    </div>
  </div>
</template>
