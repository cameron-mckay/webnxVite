<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import AssetCartItemComponent from '../../components/AssetComponents/AssetCartItemComponent.vue';
import PencilButton from '../../components/GenericComponents/Buttons/PencilButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import AssetComponent from '../../components/AssetComponents/AssetComponent.vue';
import { replaceLinksWithAnchors } from '../../plugins/CommonMethods'
import {
  getAssetByID,
  getNodesOnAsset,
  getPartsOnAsset,
} from '../../plugins/dbCommands/assetManager';
import type {
AssetSchema,
CartItem,
LoadedCartItem,
UserState,
} from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let assetLoading = ref(false)
let partsLoading = ref(false)
let nodes = ref([] as AssetSchema[])

let asset = ref({
  asset_tag: '',
  building: 3,
  asset_type: '',
} as AssetSchema);
let parts = ref([] as LoadedCartItem[]);

onBeforeMount(reload)

function reload() {
  if (router.currentRoute.value.query.asset_tag) {
    let nxid = router.currentRoute.value.query.asset_tag as string;
    asset.value = {}
    assetLoading.value = true
    partsLoading.value = true
    nodes.value = []
    getAssetByID(http, nxid, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      asset.value = res as AssetSchema;
      assetLoading.value = false
      // Defer
      setTimeout(()=>replaceLinksWithAnchors(document,  "notes-with-links"),0)
      getPartsOnAsset(http, asset.value.asset_tag!, async (res, err) => {
        if (err) {
          errorHandler(err);
        }
        let temp = await Cacher.loadCartItems(res as CartItem[])
        // Create sorted list using array filters
        let sortedList = temp.filter((p)=>p.part.type == "Motherboard")
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "CPU"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Heatsink"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Memory"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Storage"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Peripheral Card"))
        sortedList = sortedList.concat(temp.filter((p)=>p.part.type == "Cable"))
        // Catch all
        sortedList = sortedList.concat(temp.filter((p)=>
          (p.part.type != "Motherboard"&&
          p.part.type != "CPU"&&
          p.part.type != "Heatsink"&&
          p.part.type != "Memory"&&
          p.part.type != "Storage"&&
          p.part.type != "Peripheral Card"&&
          p.part.type != "Cable")
        )) 
        parts.value = sortedList
        partsLoading.value = false
      });
      if(asset.value.chassis_type=="Node Chassis") {
        getNodesOnAsset(http, asset.value.asset_tag!, async (res, err)=>{
          if (err) {
            return errorHandler(err);
          }
          nodes.value = res as AssetSchema[]
        })
      }
    });
  }
}

function edit() {
  router.push({
    name: 'Edit Asset',
    query: { asset_tag: asset.value.asset_tag },
  });
}

function toggleEdit(ass: AssetSchema) {
  router.push({ name: 'Edit Asset', query: { asset_tag: ass.asset_tag } });
}

function viewAsset(ass: AssetSchema) {
  router.push({ name: 'View Asset', query: { asset_tag: ass.asset_tag } }).then(()=>{
    reload();
  });
}

function prev() {
  if(router.options.history.state.back) {
    router.back()
    setTimeout(reload, 50)
    return
  }
  router.push('/assets')
}

</script>

<template>
  <LoaderComponent v-if="assetLoading" class="mt-16"/>
  <div 
    v-else
    class="body"
  >
    <BackButton @click="prev" class="mr-2 mb-2"/>
    <p class="my-2 w-full rounded-md bg-red-400 p-2" v-if="asset.migrated">
      This asset was automatically migrated from the old asset tracking system
      and is incomplete. Please edit and update the information if you can.
    </p>
    <div
      class="relative grid grid-cols-2 rounded-md group-hover:rounded-bl-none group-hover:bg-zinc-400 md:grid-cols-4"
    >
      <div class="col-span-2 mb-4 flex md:col-span-4">
        <h1 class="my-auto text-4xl leading-8 md:leading-10">
          {{ asset.asset_tag + ':' }}
        </h1>
        <!-- Pencil -->
        <PencilButton
          v-on:click="edit"
          v-if="store.state.user.roles?.includes('edit_assets')"
        />
        <RouterLink
          class="my-auto ml-2 rounded-md p-2 font-bold transition-colors hover:bg-gray-400 hover:dark:bg-zinc-700"
          :to="`/assets/history?nxid=${asset.asset_tag}`"
        >
          View History
        </RouterLink>
      </div>
      <div class="detail-row">
        <p>Building:</p>
        <p>{{ asset.building }}</p>
        <p>Asset Type:</p>
        <p>{{ asset.asset_type }}</p>
        <p v-if="asset.chassis_type">Chassis Type:</p>
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
        <p v-if="asset.bay">Bay:</p>
        <p v-if="asset.bay">{{ asset.bay }}</p>

        <p v-if="asset.parent">Chassis Tag:</p>
        <p v-if="asset.parent">{{ asset.parent }}</p>

        <p v-if="asset.live != undefined">Status:</p>
        <p v-if="asset.live">Live</p>
        <p v-else-if="asset.live != undefined">Inactive</p>

        <p v-if="asset.rails != undefined">Rails:</p>
        <p v-if="asset.rails">Yes</p>
        <p v-else-if="asset.rails != undefined">No</p>

        <p v-if="asset.in_rack != undefined">In Rack:</p>
        <p v-if="asset.in_rack">Yes</p>
        <p v-else-if="asset.in_rack != undefined">No</p>

        <p v-if="asset.public_port">Public Port:</p>
        <p v-if="asset.public_port">{{ asset.public_port }}</p>
        <p v-if="asset.private_port">Private Port:</p>
        <p v-if="asset.private_port">
          {{ asset.private_port }}
        </p>
        <p v-if="asset.ipmi_port">IPMI Port:</p>
        <p v-if="asset.ipmi_port">{{ asset.ipmi_port }}</p>
        <p v-if="asset.power_port">Power Port:</p>
        <p v-if="asset.power_port">{{ asset.power_port }}</p>
        <p v-if="asset.pallet">Pallet:</p>
        <p v-if="asset.pallet">{{ asset.pallet }}</p>
        <p>Last Updated:</p>
        <p>
          {{ asset.date_updated ? new Date(Date.parse(asset.date_updated!)).toLocaleString() : new Date(Date.parse(asset.date_created!)).toLocaleString() }}
        </p>
        <div class="col-span-2 my-4" v-if="asset.notes">
          <h1 class="col-span-2 mb-4 text-4xl">Notes:</h1>
          <pre class="whitespace-pre-wrap notes-with-links">{{ asset.notes }}</pre>
        </div>
      </div>
    </div>
    <LoaderComponent v-if="partsLoading"/>
    <div v-else-if="parts.length > 0">
      <h1 class="col-span-2 mb-4 text-4xl">Parts:</h1>
      <div
        v-if="(parts!.length > 0)"
        class="relative grid grid-cols-4 rounded-xl p-2 text-center font-bold leading-8 group-hover:rounded-bl-none group-hover:bg-zinc-400 group-hover:shadow-lg md:grid-cols-5 md:leading-10"
      >
        <p class="hidden md:block">NXID</p>
        <p>Manufacturer</p>
        <p>Name</p>
        <p>Quantity/SN</p>
        <p></p>
      </div>
      <AssetCartItemComponent
        class="col-span-2"
        v-for="part in parts"
        :item="part"
        @plus="$emit('plusPart', part)"
        @minus="$emit('minusPart', part)"
        @delete="$emit('deletePart', part)"
        :hideButtons="true"
      />
    </div>
    <div v-if="nodes.length > 0">
      <h1 class="col-span-2 my-4 text-4xl">Nodes:</h1>
      <div
        class="relative grid grid-cols-3 py-1 text-center font-bold leading-8 transition md:grid-cols-6 md:py-2 md:leading-10 mt-auto"
      >
        <p class="mt-auto">NXID</p>
        <p class="mt-auto md:block hidden">Building</p>
        <p class="mt-auto">Type</p>
        <p class="hidden md:block mt-auto">Chassis</p>
        <p class="hidden md:block mt-auto">Status</p>
      </div>
      <div class="md:animate-bottom">
        <AssetComponent
          :add="false"
          :edit="true"
          :view="true"
          v-for="ass in nodes"
          v-bind:key="ass._id"
          @viewPartAction="viewAsset(ass)"
          @editPartAction="toggleEdit(ass)"
          :asset="ass"
        />
      </div>
    </div>
  </div>
</template>
