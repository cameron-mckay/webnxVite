<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  AssetEvent,
  AssetSchema,
  CartItem,
  LoadedCartItem,
  PartSchema,
  User,
} from '../../plugins/interfaces';
import AssetEventPartComponent from './AssetEventPartComponent.vue';

interface Props {
  assets: Map<string, AssetSchema>;
  user: User;
  parts: Map<string, PartSchema>;
  event: AssetEvent;
}

let { assets, user, parts, event } = defineProps<Props>();

let asset = ref({
  _id: '',
  asset_tag: '',
  prev: '',
  next: '',
  building: 3,
  asset_type: '',
  chassis_type: '',
  manufacturer: '',
  model: '',
  serial: '',
  rails: false,
  live: false,
  bay: 3,
  power_port: '',
  public_port: '',
  private_port: '',
  ipmi_port: '',
  by: '',
  sid: 1,
  date_created: '',
  date_replaced: '',
} as AssetSchema);

let prevAsset = ref({} as AssetSchema);
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
  asset.value = assets.has(event.asset_id)
    ? assets.get(event.asset_id)!
    : asset.value;
  // Load existing parts
  existing.value = event.existing.map(loadPart);
  // Load added parts
  added.value = event.added.map(loadPart);
  // Laod removed parts
  removed.value = event.removed.map(loadPart);
  // Check if asset info is updated
  if (event.info_updated && asset.value?.prev != null) {
    // Get previous asset for strikethrough
    prevAsset.value = assets.get(asset.value?.prev)
      ? assets.get(asset.value?.prev)!
      : {};
  }
});
</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="flex justify-between">
      <h1 class="mb-8 text-4xl leading-8 md:leading-10">
        {{ new Date(event.date_begin).toLocaleString() }}
      </h1>
      <p v-if="asset.migrated">
        By:
        {{ asset.old_by }}
      </p>
      <p v-else>
        By:
        {{
          user.first_name + ' ' + user.last_name
        }}
      </p>
    </div>
    <div class="grid md:grid-cols-3">
      <div
        class="detail-row col-span-1"
      >
        <h1
          v-if="asset.migrated"
          class="col-span-2 mb-4 rounded-md bg-green-400 p-2 text-center text-4xl leading-8 md:leading-10"
        >MIGRATED</h1>
        <h1 class="col-span-2 mb-4 text-4xl leading-8 md:leading-10">
          {{ asset.asset_tag }}
        </h1>
        <p class="hidden"></p>
        <p>Building:</p>
        <p>
          <del v-if="prevAsset.building&&(prevAsset.building!=asset.building)">{{ prevAsset.building }}</del>
          {{ asset.building }}
        </p>

        <p>Asset Type:</p>
        <p>
          <del v-if="prevAsset.asset_type&&(prevAsset.asset_type!=asset.asset_type)">{{ prevAsset.asset_type }}</del>
          {{ asset.asset_type }}
        </p>

        <div v-if="asset.chassis_type || prevAsset.chassis_type" class="detail-row col-span-2">
          <p>Chassis Type</p>
          <p>
            <del v-if="prevAsset.chassis_type&&(prevAsset.chassis_type!=asset.chassis_type)">{{ prevAsset.chassis_type }}</del>
            {{ asset.chassis_type }}
          </p>
        </div>

        <div v-if="asset.manufacturer || prevAsset.manufacturer" class="detail-row col-span-2">
          <p>Manufacturer:</p>
          <p>
            <del v-if="prevAsset.manufacturer&&(prevAsset.manufacturer!=asset.manufacturer)">{{ prevAsset.manufacturer }}</del>
            {{ asset.manufacturer }}
          </p>
        </div>

        <div v-if="asset.model || prevAsset.model" class="detail-row col-span-2">
          <p>Model:</p>
          <p>
            <del v-if="prevAsset.model&&(prevAsset.model!=asset.model)">{{ prevAsset.model }}</del>
            {{ asset.model }}
          </p>
        </div>

        <div v-if="asset.serial || prevAsset.serial" class="detail-row col-span-2">
          <p>Serial:</p>
          <p>
            <del v-if="prevAsset.serial&&(prevAsset.serial!=asset.serial)">{{ prevAsset.serial }}</del>
            {{ asset.serial }}
          </p>
        </div>

        <div v-if="asset.units || prevAsset.units" class="detail-row col-span-2">
          <p>Rack Units:</p>
          <p>
            <del v-if="prevAsset.units && (prevAsset.units != asset.units)">{{ prevAsset.units }}</del>
            {{ asset.units }}
          </p>
        </div>
        
        <div v-if="asset.num_psu || prevAsset.num_psu" class="detail-row col-span-2">
          <p>Num PSUs:</p>
          <p>
            <del v-if="prevAsset.num_psu && (prevAsset.num_psu != asset.num_psu)">{{ prevAsset.num_psu }}</del>
            {{ asset.num_psu }}
          </p>
        </div>
        
        <div v-if="asset.psu_model || prevAsset.psu_model" class="detail-row col-span-2">
          <p>PSU model:</p>
          <p>
            <del v-if="prevAsset.psu_model && (prevAsset.psu_model != asset.psu_model)">{{ prevAsset.psu_model }}</del>
            {{ asset.psu_model }}
          </p>
        </div>
        
        <div v-if="asset.parent || prevAsset.parent" class="detail-row col-span-2">
          <p>Parent Chassis:</p>
          <p>
            <del v-if="prevAsset.parent && (prevAsset.parent != asset.parent)">{{ prevAsset.parent }}</del>
            {{ asset.parent }}
          </p>
        </div>

        <div v-if="asset.cable_type || prevAsset.cable_type" class="detail-row col-span-2">
          <p>Cable Type:</p>
          <p>
            <del v-if="prevAsset.cable_type && (prevAsset.cable_type != asset.cable_type)">{{ prevAsset.cable_type }}</del>
            {{ asset.cable_type }}
          </p>
        </div>

        <div v-if="asset.num_bays || prevAsset.num_bays" class="detail-row col-span-2">
          <p>Num bays:</p>
          <p>
            <del v-if="prevAsset.num_bays && (prevAsset.num_bays != asset.num_bays)">{{ prevAsset.num_bays }}</del>
            {{ asset.num_bays }}
          </p>
        </div>

        <div v-if="asset.bay_type || prevAsset.bay_type" class="detail-row col-span-2">
          <p>Bay Type:</p>
          <p>
            <del v-if="prevAsset.bay_type && (prevAsset.bay_type != asset.bay_type)">{{ prevAsset.bay_type }}</del>
            {{ asset.bay_type }}
          </p>
        </div>

        <div v-if="asset.fw_rev || prevAsset.fw_rev" class="detail-row col-span-2">
          <p>FW Revision:</p>
          <p>
            <del v-if="prevAsset.fw_rev && (prevAsset.fw_rev != asset.fw_rev)">{{ prevAsset.fw_rev }}</del>
            {{ asset.fw_rev }}
          </p>
        </div>
        <div v-if="asset.bay || prevAsset.bay" class="detail-row col-span-2">
          <p>Bay:</p>
          <p>
            <del v-if="prevAsset.bay&&(prevAsset.bay!=asset.bay)">{{ prevAsset.bay }}</del>
            {{ asset.bay }}
          </p>
        </div>

        <div v-if="asset.in_rack || prevAsset.in_rack" class="detail-row col-span-2">
          <p>In Rack:</p>
          <p>
            <del v-if="prevAsset.in_rack&&(prevAsset.in_rack!=asset.in_rack)">{{ prevAsset.in_rack ? "Yes" : "No" }}</del>
            {{ asset.in_rack ? "Yes" : "No" }}
          </p>
        </div>

        <div v-if="asset.live || prevAsset.live" class="detail-row col-span-2">
          <p>Status:</p>
          <p>
            <del v-if="prevAsset.live&&(prevAsset.live!=asset.live)">{{ prevAsset.live ? "Live" : "Inactive"}}</del>
            {{ asset.live ? "Live" : "Inactive" }}
          </p>
        </div>

        <div v-if="asset.rails || prevAsset.rails" class="detail-row col-span-2">
          <p>Rails:</p>
          <p>
            <del v-if="prevAsset.rails && (prevAsset.rails != asset.rails)">{{ prevAsset.rails ? "Yes" : "No" }}</del>
            {{ asset.rails ? "Yes" : "No" }}
          </p>
        </div>

        <div v-if="asset.power_port || prevAsset.power_port" class="detail-row col-span-2">
          <p>Power Port:</p>
          <p>
            <del v-if="prevAsset.power_port&&(prevAsset.power_port!=asset.power_port)">{{ prevAsset.power_port }}</del>
            {{ asset.power_port }}
          </p>
        </div>

        <div v-if="asset.public_port || prevAsset.public_port" class="detail-row col-span-2">
          <p>Public Port:</p>
          <p>
            <del v-if="prevAsset.public_port && (prevAsset.public_port != asset.public_port)">{{ prevAsset.public_port }}</del>
            {{ asset.public_port }}
          </p>
        </div>

        <div v-if="asset.private_port || prevAsset.private_port" class="detail-row col-span-2">
          <p>Private Port:</p>
          <p>
            <del v-if="prevAsset.private_port && (prevAsset.private_port != asset.private_port)">{{ prevAsset.private_port }}</del>
            {{ asset.private_port }}
          </p>
        </div>

        <div v-if="asset.ipmi_port || prevAsset.ipmi_port" class="detail-row col-span-2">
          <p>IPMI Port:</p>
          <p>
            <del v-if="prevAsset.ipmi_port && (prevAsset.ipmi_port != asset.ipmi_port)">{{ prevAsset.ipmi_port }}</del>
            {{ asset.ipmi_port }}
          </p>
        </div>

        <div v-if="asset.pallet || prevAsset.pallet" class="detail-row col-span-2">
          <p>Pallet:</p>
          <p>
            <del v-if="prevAsset.pallet && (prevAsset.pallet != asset.pallet)">{{ prevAsset.pallet }}</del>
            {{ asset.pallet }}
          </p>
        </div>

        <div v-if="asset.notes || prevAsset.notes" class="detail-row col-span-2">
          <p class="col-span-2">Notes:</p>
          <p class="col-span-2">
            <del v-if="prevAsset.notes && (prevAsset.notes != asset.notes)">{{ prevAsset.notes }}</del>
            {{ asset.notes }}
          </p>
        </div>

      </div>
      <div class="md:col-span-2">
        <h1
          v-if="existing.length > 0 || added.length > 0 || removed.length > 0"
          class="mb-4 mt-4 text-4xl leading-8 md:mt-0 md:leading-10"
        >
          Parts:
        </h1>
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
    </div>
  </div>
</template>
