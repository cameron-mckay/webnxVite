<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  PalletEvent,
  PalletSchema,
  AssetSchema,
  CartItem,
  LoadedCartItem,
  PartSchema,
  User,
  BoxSchema,
} from '../../plugins/interfaces';
import AssetEventPartComponent from '../AssetComponents/AssetEventPartComponent.vue';
import PalletEventAssetComponent from './PalletEventAssetComponent.vue';
import PalletEventBoxComponent from './PalletEventBoxComponent.vue';

interface Props {
  pallets: Map<string, PalletSchema>;
  user: User;
  parts: Map<string, PartSchema>;
  assets: Map<string, AssetSchema>;
  boxes: Map<string, BoxSchema>;
  event: PalletEvent;
}

let { pallets, user, parts, assets, boxes, event } = defineProps<Props>();

let pallet = ref({
  _id: '',
  pallet_tag: '',
  prev: '',
  next: '',
  building: 3,
  location: "",
  notes: "",
  by: "",
  date_created: new Date(),
  date_replaced: new Date(),
} as PalletSchema);

let prevPallet = ref({} as PalletSchema);
let existingParts = ref([] as LoadedCartItem[]);
let addedParts = ref([] as LoadedCartItem[]);
let removedParts = ref([] as LoadedCartItem[]);
let existingAssets = ref([] as AssetSchema[]);
let addedAssets = ref([] as AssetSchema[]);
let removedAssets = ref([] as AssetSchema[]);
let existingBoxes = ref([] as BoxSchema[]);
let addedBoxes = ref([] as BoxSchema[]);
let removedBoxes = ref([] as BoxSchema[]);

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
  pallet.value = pallets.has(event.pallet_id)
    ? pallets.get(event.pallet_id)!
    : pallet.value;
  // Load existing parts
  existingParts.value = event.existingParts.map(loadPart);
  // Load added parts
  addedParts.value = event.addedParts.map(loadPart);
  // Laod removed parts
  removedParts.value = event.removedParts.map(loadPart);

  existingAssets.value = event.existingAssets.map((a)=>{return assets.has(a)?assets.get(a)!:{} as AssetSchema})
  addedAssets.value = event.addedAssets.map((a)=>{return assets.has(a)?assets.get(a)!:{} as AssetSchema})
  removedAssets.value = event.removedAssets.map((a)=>{return assets.has(a)?assets.get(a)!:{} as AssetSchema})
  existingBoxes.value = event.existingBoxes.map((a)=>{return boxes.has(a)?boxes.get(a)!:{} as BoxSchema})
  addedBoxes.value = event.addedBoxes.map((a)=>{return boxes.has(a)?boxes.get(a)!:{} as BoxSchema})
  removedBoxes.value = event.removedBoxes.map((a)=>{return boxes.has(a)?boxes.get(a)!:{} as BoxSchema})

  // Check if asset info is updated
  if (event.info_updated && pallet.value?.prev != null) {
    // Get previous asset for strikethrough
    prevPallet.value = pallets.get(pallet.value?.prev)
      ? pallets.get(pallet.value?.prev)!
      : {} as PalletSchema;
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
          {{ pallet.pallet_tag }}
        </h1>
        <p class="hidden"></p>
        <p>Building:</p>
        <p>
          <del v-if="prevPallet.building&&(prevPallet.building!=pallet.building)">{{ prevPallet.building }}</del>
          {{ pallet.building }}
        </p>

        <p>Location:</p>
        <p>
          <del v-if="prevPallet.location&&(prevPallet.location!=pallet.location)">{{ prevPallet.location }}</del>
          {{ pallet.location }}
        </p>
        <div v-if="pallet.notes || prevPallet.notes" class="detail-row col-span-2">
          <p class="col-span-2">Notes:</p>
          <pre class="col-span-2 whitespace-pre-wrap notes-with-links">
            <del v-if="prevPallet.notes && (prevPallet.notes != pallet.notes)">{{ prevPallet.notes }}</del>
            {{ pallet.notes }}
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
      <div class="col-span-2"
          v-if="existingAssets.length > 0 || addedAssets.length > 0 || removedAssets.length > 0"
      >
        <h1
          class="mb-4 mt-4 text-4xl leading-8 md:mt-0 md:leading-10"
        >
          Assets:
        </h1>
        <div
          class="grid grid-cols-2 md:grid-cols-3 text-center font-bold px-2"
        >
          <p>Asset Tag</p>
          <p class="md:block hidden">Manufacturer</p>
          <p>Type</p>
        </div>
        <PalletEventAssetComponent v-for="item of existingAssets" :asset="item" />
        <PalletEventAssetComponent
          v-for="item of addedAssets"
          :asset="item"
          :plus="true"
        />
        <del>
          <PalletEventAssetComponent
            v-for="item of removedAssets"
            :asset="item"
            :minus="true"
          />
        </del>
      </div>
      <div class="hidden md:block md:col-span1 md:h-full"></div>
      <div class="col-span-2"
          v-if="existingBoxes.length > 0 || addedBoxes.length > 0 || removedBoxes.length > 0"
      >
        <h1
          class="mb-4 mt-4 text-4xl leading-8 md:mt-0 md:leading-10"
        >
          Boxes:
        </h1>
        <div
          class="grid grid-cols-2 md:grid-cols-3 text-center font-bold px-2"
        >
          <p>Box Tag</p>
          <p class="md:block hidden">Building</p>
          <p>Location</p>
        </div>
        <PalletEventBoxComponent v-for="item of existingBoxes" :box="item" />
        <PalletEventBoxComponent
          v-for="item of addedBoxes"
          :box="item"
          :plus="true"
        />
        <del>
          <PalletEventBoxComponent
            v-for="item of removedBoxes"
            :box="item"
            :minus="true"
          />
        </del>
      </div>
    </div>
  </div>
</template>
