<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router, RouterLink } from 'vue-router';
import type { Store } from 'vuex';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import AssetCartItemComponent from '../../components/AssetComponents/AssetCartItemComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import PencilButton from '../../components/GenericComponents/Buttons/PencilButton.vue';
import type {
  LoadedCartItem,
  UserState,
  CartItem,
  BoxSchema
} from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';
import { getBoxByID, getPartsOnBox } from '../../plugins/dbCommands/boxManager';
import { arrayToCSV, downloadCSV, isValidPalletTag, replaceLinksWithAnchors } from '../../plugins/CommonMethods';
import { DEFAULT_BUILDING } from '../../plugins/Constants';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let box = ref({
  box_tag: '',
  building: DEFAULT_BUILDING,
  location: '',
  notes: ''
} as BoxSchema);
let parts = ref([] as LoadedCartItem[]);
let boxLoading = ref(false)
let partsLoading = ref(false)

onBeforeMount(() => {
  if (router.currentRoute.value.query.box_tag) {
    boxLoading.value = true
    partsLoading.value = true
    let nxid = router.currentRoute.value.query.box_tag as string;
    getBoxByID(http, nxid, (res, err) => {
      if (err) {
        errorHandler(err);
      }
      box.value = res as BoxSchema;
      boxLoading.value = false
      // defer
      setTimeout(()=>replaceLinksWithAnchors(document, "notes-with-links"),0)
      getPartsOnBox(http, box.value.box_tag!, async (res, err) => {
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
    });
  }
});

function edit() {
  router.push({
    name: 'Edit Box',
    query: { box_tag: box.value.box_tag },
  });
}

function getCSV() {
  let mapped = parts.value.map((v)=>{
    return {
      nxid: v.part.nxid,
      manufacturer: v.part.manufacturer,
      name: v.part.name,
      quantity: v.quantity ? v.quantity : 1,
      serial: v.serial ? v.serial : ""
    }
  })
  downloadCSV(`${box.value.box_tag}_parts`, arrayToCSV(mapped))
}
</script>

<template>
  <LoaderComponent v-if="boxLoading" class="mt-16"/>
  <div v-else class="body">
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/boxes')" class="mr-2 mb-2"/>
    <div
      class="relative grid grid-cols-2 rounded-md group-hover:rounded-bl-none group-hover:bg-zinc-400 md:grid-cols-4"
    >
      <div class="col-span-2 mb-4 flex md:col-span-4">
        <h1 class="my-auto text-4xl leading-8 md:leading-10">
          {{ box.box_tag + ':' }}
        </h1>
        <!-- Pencil -->
        <PencilButton
          v-on:click="edit"
          v-if="store.state.user.roles?.includes('edit_boxes')"
        />
        <RouterLink
          class="my-auto ml-2 rounded-md p-2 font-bold transition-colors hover:bg-gray-400 hover:dark:bg-zinc-700"
          :to="`/boxes/history?box_tag=${box.box_tag}`"
        >
          View History
        </RouterLink>
      </div>
      <div class="detail-row">
        <p>Building:</p>
        <p>{{ box.building }}</p>
        <p>Location:</p>
        <RouterLink
          class="link"
          :to="`/pallets/view?pallet_tag=${box.location}`"
          v-if="isValidPalletTag(box.location)"
        >
          {{ box.location }}
        </RouterLink>
        <p v-else>{{ box.location }}</p>
        <p>Last Updated:</p>
        <p>
          {{ new Date(box.date_created).toLocaleString() }}
        </p>
        <div class="col-span-2 my-4" v-if="box.notes">
          <h1 class="col-span-2 mb-4 text-4xl">Notes:</h1>
          <pre class="whitespace-pre-wrap notes-with-links">{{ box.notes }}</pre>
        </div>
      </div>
    </div>
    <LoaderComponent v-if="partsLoading"/>
    <div v-else>
      <div v-if="parts.length > 0">
        <h1 class="col-span-2 my-4 text-4xl">Parts:</h1>
        <div
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
      <input class="search-button bg-blue-400 hover:bg-blue-500 active:bg-blue-600 ml-auto block px-4" type="button" value="Download CSV" @click="getCSV"/>
    </div>
  </div>
</template>
