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
  users: Map<string, User>;
  parts: Map<string, PartSchema>;
  event: AssetEvent;
}

let { assets, users, parts, event } = defineProps<Props>();

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

let user = ref(users.get(asset.value?.by!));
let prevAsset = ref({} as AssetSchema);
let existing = ref([] as LoadedCartItem[]);
let added = ref([] as LoadedCartItem[]);
let removed = ref([] as LoadedCartItem[]);

function loadPart(part: CartItem) {
  return {
    part: parts.get(part.nxid),
    serial: part.serial,
    quantity: part.quantity,
  } as LoadedCartItem;
}

onMounted(() => {
  asset.value = assets.get(event.asset_id)
    ? assets.get(event.asset_id)!
    : asset.value;
  existing.value = event.existing.map(loadPart);
  added.value = event.added.map(loadPart);
  removed.value = event.removed.map(loadPart);
  if (event.info_updated && asset.value?.prev != null) {
    prevAsset.value = assets.get(asset.value?.prev)
      ? assets.get(asset.value?.prev)!
      : {};
  }
});
</script>
<template>
  <div class="background-and-border my-4 p-4">
    <h1 class="mb-8 text-4xl leading-8 md:leading-10">
      {{ new Date(event.date_begin).toLocaleString() }}
    </h1>
    <div class="grid md:grid-cols-3">
      <div
        v-if="event.info_updated && asset.prev != null"
        class="detail-row col-span-1"
      >
        <h1 class="col-span-2 mb-4 text-4xl leading-8 md:leading-10">
          {{ asset.asset_tag }}
        </h1>
        <p class="hidden"></p>
        <p>Building:</p>
        <p v-if="asset.building != asset.building">
          <del>{{ prevAsset.building }}</del>
          {{ asset.building }}
        </p>
        <p v-else>{{ prevAsset.building }}</p>
        <p>Asset Type:</p>
        <p v-if="asset.asset_type != asset.asset_type">
          <del>{{ prevAsset.asset_type }}</del>
          {{ asset.asset_type }}
        </p>
        <p v-else>{{ prevAsset.asset_type }}</p>

        <p v-if="asset.chassis_type">Chassis Type</p>
        <p
          v-if="
            asset.chassis_type &&
            prevAsset.chassis_type &&
            prevAsset.chassis_type != asset.chassis_type
          "
        >
          <del>{{ prevAsset.chassis_type }}</del>
          {{ asset.chassis_type }}
        </p>
        <p v-else-if="asset.chassis_type">
          {{ asset.chassis_type }}
        </p>

        <p v-if="asset.manufacturer">Manufacturer:</p>
        <p
          v-if="
            asset.manufacturer &&
            prevAsset.manufacturer &&
            prevAsset.manufacturer != asset.manufacturer
          "
        >
          <del>{{ prevAsset.manufacturer }}</del>
          {{ asset.manufacturer }}
        </p>
        <p v-else-if="asset.manufacturer">
          {{ asset.manufacturer }}
        </p>

        <p v-if="asset.model">Model:</p>
        <p
          v-if="
            asset.model && prevAsset.model && asset.model != prevAsset.model
          "
        >
          <del>{{ prevAsset.model }}</del>
          {{ asset.model }}
        </p>
        <p v-else-if="asset.model">{{ asset.model }}</p>

        <p v-if="asset.serial">Serial:</p>
        <p
          v-if="
            asset.serial && prevAsset.serial && asset.serial != prevAsset.serial
          "
        >
          <del>{{ prevAsset.serial }}</del>
          {{ asset.serial }}
        </p>
        <p v-else-if="asset.serial">{{ asset.serial }}</p>
        <p v-if="asset.bay">Bay:</p>
        <p v-if="asset.bay && prevAsset.bay && asset.bay != prevAsset.bay">
          <del>{{ prevAsset.bay }}</del>
          {{ asset.bay }}
        </p>
        <p v-else-if="asset.bay">{{ asset.bay }}</p>


        
        <div v-if="asset.asset_type!='Laptop'" class="detail-row col-span-2">
          <p>In Rack:</p>
          <p
          v-if="
            (asset.in_rack && prevAsset.in_rack) ||
            (asset.in_rack && prevAsset.in_rack == undefined)
            "
            >
            Yes
          </p>
          <p
          v-else-if="
                (!asset.in_rack && !prevAsset.in_rack) ||
                (!asset.in_rack && prevAsset.in_rack == undefined)
              "
            >
            No
          </p>
          <p v-else-if="!asset.in_rack && prevAsset.in_rack">
            <del>Yes</del>
            No
          </p>
          <p v-else-if="asset.in_rack && !prevAsset.in_rack">
            <del>No</del>
            Yes
          </p>
        </div>


        <div v-if="asset.asset_type=='Server'" class="detail-row col-span-2">

          <p>Status:</p>
          <p
            v-if="(asset.live && prevAsset.live) ||
              (asset.live && prevAsset.live == undefined)">
            Live
          </p>
          <p
            v-else-if="
              (!asset.live && !prevAsset.live) ||
              (!asset.live && prevAsset.live == undefined)
            "
          >
            Inactive
          </p>
          <p v-else-if="!asset.live && prevAsset.live">
            <del>Live</del>
            Inactive
          </p>
          <p v-else-if="asset.live && !prevAsset.live">
            <del>Inactive</del>
            Live
          </p>
        </div>

        <div v-if="asset.asset_type=='Server'" class="detail-row col-span-2"> 
          <p>Rails:</p>
          <p
          v-if="
                    (asset.rails && prevAsset.rails) ||
                    (asset.rails && prevAsset.rails == undefined)
                    "
                >
            Yes
          </p>
          <p
          v-else-if="
                (!asset.rails && !prevAsset.rails) ||
                (!asset.rails && prevAsset.rails == undefined)
                "
            >
            No
          </p>
          <p v-else-if="asset.rails && !prevAsset.rails">
            <del>No</del>
            Yes
          </p>
          <p v-else-if="!asset.rails && prevAsset.rails">
            <del>Yes</del>
            No
          </p>
        </div>
      
      
      
      <div v-if="asset.in_rack||prevAsset.in_rack" class="detail-row col-span-2">
        <p v-if="asset.power_port||prevAsset.power_port">Power Port:</p>
        <p
      v-if="
            asset.power_port||prevAsset.power_port
            "
        >
        <del>{{ prevAsset.power_port }}</del>
        {{ asset.power_port }}
      </p>
      <p v-if="asset.public_port||prevAsset.public_port">Public Port:</p>
      <p
      v-if="
            prevAsset.public_port &&
            asset.public_port != prevAsset.public_port
          "
        >
        <del>{{ prevAsset.public_port }}</del>
        {{ asset.public_port }}
      </p>
      <p v-else-if="asset.public_port">{{ asset.public_port }}</p>
      
      <p v-if="asset.private_port||prevAsset.private_port">Private Port:</p>
      <p
      v-if="
            prevAsset.private_port &&
            asset.private_port != prevAsset.private_port
            "
        >
        <del>{{ prevAsset.private_port }}</del>
        {{ asset.private_port }}
      </p>
        <p v-else-if="asset.private_port">{{ asset.private_port }}</p>

        <p v-if="prevAsset.ipmi_port||asset.ipmi_port">IPMI Port:</p>
        <p
          v-if="
            prevAsset.ipmi_port &&
            asset.ipmi_port != prevAsset.ipmi_port
            "
        >
        <del>{{ prevAsset.ipmi_port }}</del>
        {{ asset.ipmi_port }}
      </p>
      <p v-else-if="asset.ipmi_port">{{ asset.ipmi_port }}</p>
    </div>
  </div>
    
    
      <div v-else class="detail-row col-span-1">
        <h1 class="col-span-2 mb-4 text-4xl leading-8 md:leading-10">
          {{ asset.asset_tag }}
        </h1>
        <div class="hidden"></div>
        <p>Building:</p>
        <p>{{ asset.building }}</p>
        <p>Asset Type:</p>
        <p>{{ asset.asset_type }}</p>
        <p v-if="asset.chassis_type">Chassis Type</p>
        <p v-if="asset.chassis_type">
          {{ asset.chassis_type }}
        </p>
        <p v-if="asset.manufacturer">Manufacturer:</p>
        <p v-if="asset.manufacturer">
          {{ asset.manufacturer }}
        </p>
        <p v-if="asset.model">Model:</p>
        <p v-if="asset.model">{{ asset.model }}</p>
        <p v-if="asset.serial">Serial:</p>
        <p v-if="asset.serial">{{ asset.serial }}</p>
        <p v-if="asset.live != undefined">Status:</p>
        <p v-if="asset.live">Live</p>
        <p v-else-if="asset.live != undefined">Inactive</p>
        <p v-if="asset.rails != undefined">Rails:</p>
        <p v-if="asset.rails">Yes</p>
        <p v-else-if="asset.rails != undefined">No</p>
        <p v-if="asset.bay">Bay:</p>
        <p v-if="asset.bay">{{ asset.bay }}</p>
        <p v-if="asset.power_port">Power Port:</p>
        <p v-if="asset.power_port">{{ asset.power_port }}</p>
        <p v-if="asset.public_port">Public Port:</p>
        <p v-if="asset.public_port">{{ asset.public_port }}</p>
        <p v-if="asset.private_port">Private Port:</p>
        <p v-if="asset.private_port">
          {{ asset.private_port }}
        </p>
        <p v-if="asset.ipmi_port">IPMI Port:</p>
        <p v-if="asset.ipmi_port">{{ asset.ipmi_port }}</p>
      </div>
      <div class="md:col-span-2">
        <h1
          v-if="existing.length > 0 || added.length > 0 || removed.length > 0"
          class="mb-4 mt-4 text-4xl leading-8 md:mt-0 md:leading-10"
        >
          Parts:
        </h1>
        <div class="grid grid-cols-3 text-center font-bold md:grid-cols-4" v-if="existing.length > 0 || added.length > 0 || removed.length > 0">
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
