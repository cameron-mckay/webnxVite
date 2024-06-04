<script setup lang="ts">
import PageHeaderComponent from '../components/GenericComponents/PageHeaderComponent.vue';
import LoaderComponent from '../components/GenericComponents/LoaderComponent.vue';
import { onMounted, ref } from 'vue';
import { getAllTechsHistoryNoDetails, getAssetUpdatesNoDetails, getBoxUpdatesNoDetails, getCheckinHistoryNoDetails, getCheckoutHistoryNoDetails, getNewAssetsNoDetails, getNewBoxesNoDetails, getNewPalletsNoDetails, getPalletUpdatesNoDetails, getRoleCounts } from '../plugins/dbCommands/userManager';
import { getLastMonth, getTodaysDate } from '../plugins/dateFunctions';
import { AxiosError, AxiosInstance } from 'axios';
import { Store } from 'vuex';
import { UserState } from '../plugins/interfaces';
import { Router } from 'vue-router';
import SVGPart from '../components/GenericComponents/SVG/SVGPart.vue';
import SVGServer from '../components/GenericComponents/SVG/SVGServer.vue';
import SVGPallet from '../components/GenericComponents/SVG/SVGPallet.vue';
import SVGBox from '../components/GenericComponents/SVG/SVGBox.vue';
import { getNumParts, getNumAssets, getNumPallets, getNumBoxes } from '../plugins/dbCommands/analytics';
import RefreshButton from '../components/GenericComponents/Buttons/RefreshButton.vue';

let loading = ref(false)

let startDate = getLastMonth();
let endDate = getTodaysDate();

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, store } = defineProps<Props>();

let user = [store.state.user._id!]

let totalParts = ref(-1)
let totalAssets = ref(-1)
let totalPallets = ref(-1)
let totalBoxes = ref(-1)

let userAllTechs = ref(-1)
let userCheckins = ref(-1)
let userCheckouts = ref(-1)
let userAssetUpdates = ref(-1)
let userNewAssets = ref(-1)
let userPalletUpdates = ref(-1)
let userNewPallets = ref(-1)
let userBoxUpdates = ref(-1)
let userNewBoxes = ref(-1)

let allTechs = ref(-1)
let checkins = ref(-1)
let checkouts = ref(-1)
let assetUpdates = ref(-1)
let newAssets = ref(-1)
let palletUpdates = ref(-1)
let newPallets = ref(-1)
let boxUpdates = ref(-1)
let newBoxes = ref(-1)

let averageAllTechs = ref(-1)
let averageCheckins = ref(-1)
let averageCheckouts = ref(-1)
let averageAssetUpdates = ref(-1)
let averageNewAssets = ref(-1)
let averagePalletUpdates = ref(-1)
let averageNewPallets = ref(-1)
let averageBoxUpdates = ref(-1)
let averageNewBoxes = ref(-1)

let roles = {} as any

onMounted(loadPage)

async function loadPage() {
  loading.value = true
  await Promise.all([
    new Promise<void>((res)=>{
      getNumParts(http, (data,err)=>{
        if(err)
          return res()
        let response = data as any
        totalParts.value = response
        res()
      })
    }),
    new Promise<void>((res)=>{
      getNumAssets(http, (data,err)=>{
        if(err)
          return res()
        let response = data as any
        totalAssets.value = response
        res()
      })
    }),
    new Promise<void>((res)=>{
      getNumPallets(http, (data,err)=>{
        if(err)
          return res()
        let response = data as any
        totalPallets.value = response
        res()
      })
    }),
    new Promise<void>((res)=>{
      getNumBoxes(http, (data,err)=>{
        if(err)
          return res()
        let response = data as any
        totalBoxes.value = response
        res()
      })
    }),
    new Promise<void>((res)=>{
      getAllTechsHistoryNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        userAllTechs.value = response.total
        res()
      }, user)
    }),
    new Promise<void>((res)=>{
      getCheckinHistoryNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        userCheckins.value = response.total
        res()
      }, user)
    }),
    new Promise<void>((res)=>{
      getCheckoutHistoryNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res() 
        let response = data as any
        userCheckouts.value = response.total
        res()
      },user)
    }),
    new Promise<void>((res)=>{
      getAssetUpdatesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        userAssetUpdates.value = response.total
        res()
      },user)
    }),
    new Promise<void>((res)=>{
      getNewAssetsNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        userNewAssets.value = response.total
        res()
      },user)
    }),
    new Promise<void>((res)=>{
      getPalletUpdatesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        userPalletUpdates.value = response.total
        res()
      },user)
    }),
    new Promise<void>((res)=>{
      getNewPalletsNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        userNewPallets.value = response.total
        res()
      },user)
    }),
    new Promise<void>((res)=>{
      getBoxUpdatesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        userBoxUpdates.value = response.total
        res()
      },user)
    }),
    new Promise<void>((res)=>{
      getNewBoxesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        userNewBoxes.value = response.total
        res()
      },user)
    }),
    new Promise<void>((res)=>{
      getAllTechsHistoryNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        allTechs.value = response.total
        res()
      })
    }),
    new Promise<void>((res)=>{
      getCheckinHistoryNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        checkins.value = response.total
        res()
      })
    }),
    new Promise<void>((res)=>{
      getCheckoutHistoryNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res() 
        let response = data as any
        checkouts.value = response.total
        res()
      })
    }),
    new Promise<void>((res)=>{
      getAssetUpdatesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        assetUpdates.value = response.total
        res()
      })
    }),
    new Promise<void>((res)=>{
      getNewAssetsNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        newAssets.value = response.total
        res()
      })
    }),
    new Promise<void>((res)=>{
      getPalletUpdatesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        palletUpdates.value = response.total
        res()
      })
    }),
    new Promise<void>((res)=>{
      getNewPalletsNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        newPallets.value = response.total
        res()
      })
    }),
    new Promise<void>((res)=>{
      getBoxUpdatesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        boxUpdates.value = response.total
        res()
      })
    }),
    new Promise<void>((res)=>{
      getNewBoxesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
        if(err)
          return res()
        let response = data as any
        newBoxes.value = response.total
        res()
      })
    }),
    new Promise<void>((res)=>{
      getRoleCounts(http, (data, err)=>{
        if(err)
          return res()
        roles = data as any
        res()
      })
    }),
  ])
  // Calculate averages
  averageAllTechs.value = Math.round(allTechs.value / getRoleTotal(['own_parts']))
  averageCheckins.value = Math.round(checkins.value / getRoleTotal(['own_parts']))
  averageCheckouts.value = Math.round(checkouts.value / getRoleTotal(['own_parts']))
  averageAssetUpdates.value = Math.round(assetUpdates.value / getRoleTotal(['edit_assets']))
  averageNewAssets.value = Math.round(newAssets.value / getRoleTotal(['edit_assets']))
  averagePalletUpdates.value = Math.round(palletUpdates.value / getRoleTotal(['edit_pallets']))
  averageNewPallets.value = Math.round(newPallets.value / getRoleTotal(['edit_pallets']))
  averageBoxUpdates.value = Math.round(boxUpdates.value / getRoleTotal(['edit_boxes']))
  averageNewBoxes.value = Math.round(newBoxes.value / getRoleTotal(['edit_boxes']))
  // Loading done
  loading.value = false
}

function getRoleTotal(roleArr: string[]) {
  let total = 0
  for(let r of roleArr) {
    total += roles[r] ? roles[r] : 0
  }
  // This will prevent divide by 0 bullshit
  return total == 0 ? -1 : total
}

</script>
<template>
  <div>
    <div class="m-1 mb-4 flex">
      <PageHeaderComponent>Home</PageHeaderComponent>
      <RefreshButton class="ml-2" @click="loadPage"/>
    </div>
    <LoaderComponent v-if="loading"/>

    <div v-else>
      <div class="md:flex">
        <div class="flex w-full">
          <div
            class="background-and-border mx-1 my-1 px-1 leading-8 hover:rounded-md md:px-2 py-8 md:leading-10 w-full"
          >
            <SVGPart class="mx-auto w-24 h-24 dark:text-gray-200"/>
            <p class="text-center mt-4">{{ totalParts }} total {{ totalParts == 1 ? "part" : "parts" }}</p>
          </div>

          <div
            class="background-and-border mx-1 my-1 px-1 leading-8 hover:rounded-md md:px-2 py-8 md:leading-10 w-full"
          >
            <SVGServer class="mx-auto w-24 h-24 dark:text-gray-200"/>
            <p class="text-center">{{ totalAssets }} total {{ totalAssets == 1 ? "asset" : "assets" }}</p>
          </div>
        </div>

        <div class="flex w-full">
          <div
            class="background-and-border mx-1 my-1 px-1 leading-8 hover:rounded-md md:px-2 py-8 md:leading-10 w-full"
          >
            <SVGPallet class="mx-auto w-24 h-24 dark:text-gray-200"/>
            <p class="text-center">{{ totalPallets }} total {{ totalPallets == 1 ? "pallet" : "pallets" }}</p>
          </div>

          <div
            class="background-and-border mx-1 my-1 px-1 leading-8 hover:rounded-md md:px-2 py-8 md:leading-10 w-full"
          >
            <SVGBox class="mx-auto w-24 h-24 dark:text-gray-200"/>
            <p class="text-center">{{ totalBoxes }} total {{ totalBoxes == 1 ? "box" : "boxes" }}</p>
          </div>
        </div>
      </div>
      <div class="md:flex">
        <div
          class="background-and-border relative md:mx-1 my-1 p-1 leading-8 hover:rounded-md md:p-2 md:leading-10 w-full"
        >
          <h1 class="text-3xl p-1">Your stats:</h1>
          <div class="p-1">
            <p>{{ userCheckouts }} {{ userCheckouts == 1 ? "check out" : "check outs" }}</p>
          </div>
          <div class="p-1">
            <p>{{ userCheckins }} {{ userCheckins == 1 ? "check in" : "check ins" }}</p>
          </div>
          <div class="p-1">
            <p>{{ userAssetUpdates }} {{ userAssetUpdates == 1 ? "asset" : "assets" }} updated</p>
          </div>
          <div class="p-1">
            <p>{{ userNewAssets }} new {{ userNewAssets == 1 ? "asset" : "assets" }} tracked</p>
          </div>
          <div class="p-1">
            <p>{{ userPalletUpdates }} {{ userPalletUpdates == 1 ? "pallet" : "pallets" }} updated</p>
          </div>
          <div class="p-1">
            <p>{{ userNewPallets }} new {{ userNewPallets == 1 ? "pallet" : "pallets" }} tracked</p>
          </div>
          <div class="p-1">
            <p>{{ userBoxUpdates }} {{ userBoxUpdates == 1 ? "box" : "boxes" }} updated</p>
          </div>
          <div class="p-1">
            <p>{{ userNewBoxes }} new {{ userNewBoxes == 1 ? "box" : "boxes" }} tracked</p>
          </div>
          <div class="p-1">
            <p>{{ userAllTechs }} all techs {{ userAllTechs == 1 ? "transfer" : "transfers" }}</p>
          </div>
        </div>
        <div
          class="background-and-border relative md:mx-1 my-1 p-1 leading-8 hover:rounded-md md:p-2 md:leading-10 w-full"
        >
          <h1 class="text-3xl p-1">Global stats:</h1>

          <div class="p-1">
            <p>{{ checkouts }} {{ checkouts == 1 ? "check out" : "check outs" }}</p>
          </div>
          <div class="p-1">
            <p>{{ checkins }} {{ checkins == 1 ? "check in" : "check ins" }}</p>
          </div>
          <div class="p-1">
            <p>{{ assetUpdates }} {{ assetUpdates == 1 ? "asset" : "assets" }} updated</p>
          </div>
          <div class="p-1">
            <p>{{ newAssets }} new {{ newAssets == 1 ? "asset" : "assets" }} tracked</p>
          </div>
          <div class="p-1">
            <p>{{ palletUpdates }} {{ palletUpdates == 1 ? "pallet" : "pallets" }} updated</p>
          </div>
          <div class="p-1">
            <p>{{ newPallets }} new {{ newPallets == 1 ? "pallet" : "pallets" }} tracked</p>
          </div>
          <div class="p-1">
            <p>{{ boxUpdates }} {{ boxUpdates == 1 ? "box" : "boxes" }} updated</p>
          </div>
          <div class="p-1">
            <p>{{ newBoxes }} new {{ newBoxes == 1 ? "box" : "boxes" }} tracked</p>
          </div>
          <div class="p-1">
            <p>{{ allTechs }} all techs {{ allTechs == 1 ? "transfer" : "transfers" }}</p>
          </div>
        </div>
        <div
          class="background-and-border relative md:mx-1 my-1 p-1 leading-8 hover:rounded-md md:p-2 md:leading-10 w-full"
        >
          <h1 class="text-3xl p-1">Average stats:</h1>
          <div class="p-1">
            <p>{{ averageCheckouts }} {{ averageCheckouts == 1 ? "check out" : "check outs" }}</p>
          </div>
          <div class="p-1">
            <p>{{ averageCheckins }} {{ averageCheckins == 1 ? "check in" : "check ins" }}</p>
          </div>
          <div class="p-1">
            <p>{{ averageAssetUpdates }} {{ averageAssetUpdates == 1 ? "asset" : "assets" }} updated</p>
          </div>
          <div class="p-1">
            <p>{{ averageNewAssets }} new {{ averageNewAssets == 1 ? "asset" : "assets" }} tracked</p>
          </div>
          <div class="p-1">
            <p>{{ averagePalletUpdates }} {{ averagePalletUpdates == 1 ? "pallet" : "pallets" }} updated</p>
          </div>
          <div class="p-1">
            <p>{{ averageNewPallets }} new {{ averageNewPallets == 1 ? "pallet" : "pallets" }} tracked</p>
          </div>
          <div class="p-1">
            <p>{{ averageBoxUpdates }} {{ averageBoxUpdates == 1 ? "box" : "boxes" }} updated</p>
          </div>
          <div class="p-1">
            <p>{{ averageNewBoxes }} new {{ averageNewBoxes == 1 ? "box" : "boxes" }} tracked</p>
          </div>
          <div class="p-1">
            <p>{{ averageAllTechs }} all techs {{ averageAllTechs == 1 ? "transfer" : "transfers" }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
