<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import { getAllUsers, getCheckinHistory, getCheckoutHistory, getAssetUpdatesNoDetails, getNewAssetsNoDetails, getNewPalletsNoDetails, getPalletUpdatesNoDetails } from '../../plugins/dbCommands/userManager';
import { User } from '../../plugins/interfaces';
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../../plugins/interfaces';
import UserAnalyticsComponent from '../../components/AdminComponents/UserAnalyticsComponent.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import { dateToHTML, getTodaysDate, HTMLtoEpoch, getLastMonth } from '../../plugins/dateFunctions';
interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, errorHandler, router } = defineProps<Props>();

let users: Ref<Array<User>> = ref([]);
let checkins = new Map<string, number>()
let checkouts = new Map<string, number>()
let newAssets = new Map<string, number>()
let assetsUpdated = new Map<string, number>()
let newPallets = new Map<string, number>()
let palletsUpdated = new Map<string, number>()
let loading = ref(false);
let pageNum = ref(1)
let pageSize = 20

// Convert into html string
let startDate = ref(dateToHTML(getLastMonth()))
let endDate = ref(dateToHTML(getTodaysDate()))
function getUsers() {
  loading.value = true;
  getAllUsers(http, async (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    let temp = (data as User[]).filter((u)=>!(u.roles?.includes("kiosk")||u.roles?.includes("sales")))
    await Promise.all(
      [
        Promise.all(temp.map((u)=>{
          return new Promise<string>((res, rej)=>{
            getCheckinHistory(http, HTMLtoEpoch(startDate.value), HTMLtoEpoch(endDate.value), pageNum.value, pageSize, (data, err) => {
              if(err)
                return rej("")
              let response = data as any
              checkins.set(u._id!, response.total)
              res("")
            },[u._id!])
          })
        })),
        Promise.all(temp.map((u)=>{
          return new Promise<string>((res, rej)=>{
            getCheckoutHistory(http, HTMLtoEpoch(startDate.value), HTMLtoEpoch(endDate.value), pageNum.value, pageSize, (data, err) => {
              if(err)
                return rej("") 
              let response = data as any
              checkouts.set(u._id!, response.total)
              res("")
            },[u._id!])
          })
        })),
        Promise.all(temp.map((u)=>{
          return new Promise<string>((res, rej)=>{
            getAssetUpdatesNoDetails(http, HTMLtoEpoch(startDate.value), HTMLtoEpoch(endDate.value), pageNum.value, pageSize, (data, err) => {
              if(err)
                return rej("")
              let response = data as any
              assetsUpdated.set(u._id!, response.total)
              res("")
            },[u._id!])
          })
        })),
        Promise.all(temp.map((u)=>{
          return new Promise<string>((res, rej)=>{
            getNewAssetsNoDetails(http, HTMLtoEpoch(startDate.value), HTMLtoEpoch(endDate.value), pageNum.value, pageSize, (data, err) => {
              if(err)
                return rej("")
              let response = data as any
              newAssets.set(u._id!, response.total)
              res("")
            },[u._id!])
          })
        })),
        Promise.all(temp.map((u)=>{
          return new Promise<string>((res, rej)=>{
            getPalletUpdatesNoDetails(http, HTMLtoEpoch(startDate.value), HTMLtoEpoch(endDate.value), pageNum.value, pageSize, (data, err) => {
              if(err)
                return rej("")
              let response = data as any
              palletsUpdated.set(u._id!, response.total)
              res("")
            },[u._id!])
          })
        })),
        Promise.all(temp.map((u)=>{
          return new Promise<string>((res, rej)=>{
            getNewPalletsNoDetails(http, HTMLtoEpoch(startDate.value), HTMLtoEpoch(endDate.value), pageNum.value, pageSize, (data, err) => {
              if(err)
                return rej("")
              let response = data as any
              newPallets.set(u._id!, response.total)
              res("")
            },[u._id!])
          })
        }))
      ]
    )
    users.value = temp;
    loading.value = false;
  });
}

onMounted(() => {
  getUsers();
});

function openCheckouts(user_id: string) {
  router.push({
    name: 'Checkout History',
    query: {
      startDate: HTMLtoEpoch(startDate.value),
      endDate: HTMLtoEpoch(endDate.value),
      users: [user_id] as string[]
    }
  })
}

function openCheckins(user_id: string) {
  router.push({
    name: 'Checkin History',
    query: {
      startDate: HTMLtoEpoch(startDate.value),
      endDate: HTMLtoEpoch(endDate.value),
      users: [user_id] as string[]
    }
  })
}

function openNewAssets(user_id: string) {
  router.push({
    name: 'New Asset History',
    query: {
      startDate: HTMLtoEpoch(startDate.value),
      endDate: HTMLtoEpoch(endDate.value),
      users: [user_id] as string[]
    }
  })
}

function openAssetsUpdated(user_id: string) {
  router.push({
    name: 'Asset Update History',
    query: {
      startDate: HTMLtoEpoch(startDate.value),
      endDate: HTMLtoEpoch(endDate.value),
      users: [user_id] as string[]
    }
  })
}

function openNewPallets(user_id: string) {
  router.push({
    name: 'New Pallet History',
    query: {
      startDate: HTMLtoEpoch(startDate.value),
      endDate: HTMLtoEpoch(endDate.value),
      users: [user_id] as string[]
    }
  })
}

function openPalletsUpdated(user_id: string) {
  router.push({
    name: 'Pallet Update History',
    query: {
      startDate: HTMLtoEpoch(startDate.value),
      endDate: HTMLtoEpoch(endDate.value),
      users: [user_id] as string[]
    }
  })
}
</script>
<template>
  <div>
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/manage')" class="mr-2 mb-2"/>
    <h1 class="mb-4 text-4xl">User Analytics</h1>
    <form @submit.prevent="getUsers()" class="flex flex-wrap mb-4">
      <div>
        <label>Start Date: </label>
        <input class="textbox w-auto mr-4" type="date" v-model="startDate" :max="endDate"/>
      </div>
      <div>
        <label>End Date: </label>
        <input class="textbox w-auto mr-4" type="date" v-model="endDate" :min="startDate" :max="dateToHTML(getTodaysDate())"/>
      </div>
      <input class="search-button mr-0" type="submit" value="Go" />
    </form>
    <div v-if="loading" class="my-4 flex justify-center">
      <div class="loader text-center"></div>
    </div>
    <div v-else class="md:animate-bottom grid grid-cols-2 md:grid-cols-3">
      <UserAnalyticsComponent
        v-for="user in users"
        :user="user"
        :checkins="checkins.get(user._id!)!"
        :checkouts="checkouts.get(user._id!)!"
        :assetsUpdated="assetsUpdated.get(user._id!)!"
        :newAssets="newAssets.get(user._id!)!"
        :palletsUpdated="palletsUpdated.get(user._id!)!"
        :newPallets="newPallets.get(user._id!)!"
        @checkouts="openCheckouts(user._id!)"
        @checkins="openCheckins(user._id!)"
        @assetsUpdated="openAssetsUpdated(user._id!)"
        @newAssets="openNewAssets(user._id!)"
        @palletsUpdated="openPalletsUpdated(user._id!)"
        @newPallets="openNewPallets(user._id!)"
      />
    </div>
  </div>
</template>
