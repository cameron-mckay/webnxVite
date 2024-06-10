<script setup lang="ts">
import { Ref, onMounted, ref } from 'vue';
import { getAllUsers, getCheckinHistory, getCheckoutHistory, getAssetUpdatesNoDetails, getNewAssetsNoDetails, getNewPalletsNoDetails, getPalletUpdatesNoDetails, getNewBoxesNoDetails, getBoxUpdatesNoDetails, getCheckoutHistoryNoDetails, getCheckinHistoryNoDetails } from '../../plugins/dbCommands/userManager';
import { User } from '../../plugins/interfaces';
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../../plugins/interfaces';
import UserAnalyticsComponent from '../../components/AdminComponents/UserAnalyticsComponent.vue';
import DateRangeComponent from '../../components/GenericComponents/DateRangeComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import { getTodaysDate, getLastMonth } from '../../plugins/dateFunctions';
import { arrayToCSV, downloadCSV } from '../../plugins/CommonMethods';
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
let newBoxes = new Map<string, number>()
let boxesUpdated = new Map<string, number>()
let startDateCache = getLastMonth();
let endDateCache = getTodaysDate();
let loading = ref(false);

function getUsers(startDate: Date, endDate: Date) {
  loading.value = true;
  startDateCache = startDate
  endDateCache = endDate
  getAllUsers(http, async (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    let temp = (data as User[]).filter((u)=>u.roles?.includes("own_parts"))
    await Promise.all(
      [
        Promise.all(temp.map((u)=>{
          return new Promise<string>((res, rej)=>{
            getCheckinHistoryNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
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
            getCheckoutHistoryNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
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
            getAssetUpdatesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
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
            getNewAssetsNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
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
            getPalletUpdatesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
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
            getNewPalletsNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
              if(err)
                return rej("")
              let response = data as any
              newPallets.set(u._id!, response.total)
              res("")
            },[u._id!])
          })
        })),
        Promise.all(temp.map((u)=>{
          return new Promise<string>((res, rej)=>{
            getBoxUpdatesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
              if(err)
                return rej("")
              let response = data as any
              boxesUpdated.set(u._id!, response.total)
              res("")
            },[u._id!])
          })
        })),
        Promise.all(temp.map((u)=>{
          return new Promise<string>((res, rej)=>{
            getNewBoxesNoDetails(http, startDate.getTime(), endDate.getTime(), (data, err) => {
              if(err)
                return rej("")
              let response = data as any
              newBoxes.set(u._id!, response.total)
              res("")
            },[u._id!])
          })
        })),
      ]
    )
    users.value = temp;
    loading.value = false;
  });
}

onMounted(() => {
  getUsers(startDateCache, endDateCache);
});

function openCheckouts(user_id: string) {
  router.push({
    name: 'Checkout History',
    query: {
      startDate: startDateCache.getTime(),
      endDate: endDateCache.getTime(),
      users: [user_id] as string[]
    }
  })
}

function openCheckins(user_id: string) {
  router.push({
    name: 'Checkin History',
    query: {
      startDate: startDateCache.getTime(),
      endDate: endDateCache.getTime(),
      users: [user_id] as string[]
    }
  })
}

function openNewAssets(user_id: string) {
  router.push({
    name: 'New Asset History',
    query: {
      startDate: startDateCache.getTime(),
      endDate: endDateCache.getTime(),
      users: [user_id] as string[]
    }
  })
}

function openAssetsUpdated(user_id: string) {
  router.push({
    name: 'Asset Update History',
    query: {
      startDate: startDateCache.getTime(),
      endDate: endDateCache.getTime(),
      users: [user_id] as string[]
    }
  })
}

function openNewPallets(user_id: string) {
  router.push({
    name: 'New Pallet History',
    query: {
      startDate: startDateCache.getTime(),
      endDate: endDateCache.getTime(),
      users: [user_id] as string[]
    }
  })
}

function openPalletsUpdated(user_id: string) {
  router.push({
    name: 'Pallet Update History',
    query: {
      startDate: startDateCache.getTime(),
      endDate: endDateCache.getTime(),
      users: [user_id] as string[]
    }
  })
}

function openNewBoxes(user_id: string) {
  router.push({
    name: 'New Box History',
    query: {
      startDate: startDateCache.getTime(),
      endDate: endDateCache.getTime(),
      users: [user_id] as string[]
    }
  })
}

function openBoxesUpdated(user_id: string) {
  router.push({
    name: 'Box Update History',
    query: {
      startDate: startDateCache.getTime(),
      endDate: endDateCache.getTime(),
      users: [user_id] as string[]
    }
  })
}

function exportCSV() {
  let analytics = users.value.map((user)=>{
    return {
      user: `${user.first_name} ${user.last_name}`,
      checkins: checkins.get(user._id!)!,
      checkouts: checkouts.get(user._id!)!,
      assetsUpdated: assetsUpdated.get(user._id!)!,
      newAssets: newAssets.get(user._id!)!,
      palletsUpdated: palletsUpdated.get(user._id!)!,
      newPallets: newPallets.get(user._id!)!,
      boxesUpdated: boxesUpdated.get(user._id!)!,
      newBoxes: newBoxes.get(user._id!)!,
    }
  })
  downloadCSV(router.currentRoute.value.name?.toString().replaceAll(' ','')+"Summary_"+startDateCache.toLocaleDateString().replaceAll('/','-')+"_to_"+endDateCache.toLocaleDateString().replaceAll('/','-'), arrayToCSV(analytics))
}
</script>
<template>
  <div>
    <PageHeaderWithBackButton :router="router" :prevPath="'/manage'">
      User Analytics
    </PageHeaderWithBackButton>
    <DateRangeComponent :show-export="true" :startDate="startDateCache" :endDate="endDateCache" @search="getUsers" @export="exportCSV" class="md:mb-2"/>
    <LoaderComponent v-if="loading"/>
    <div v-else class="md:animate-bottom grid grid-cols-1 md:grid-cols-3">
      <UserAnalyticsComponent
        v-for="user in users"
        :user="user"
        :checkins="checkins.get(user._id!)!"
        :checkouts="checkouts.get(user._id!)!"
        :assetsUpdated="assetsUpdated.get(user._id!)!"
        :newAssets="newAssets.get(user._id!)!"
        :palletsUpdated="palletsUpdated.get(user._id!)!"
        :newPallets="newPallets.get(user._id!)!"
        :boxes-updated="boxesUpdated.get(user._id!)!"
        :new-boxes="newBoxes.get(user._id!)!"
        @checkouts="openCheckouts(user._id!)"
        @checkins="openCheckins(user._id!)"
        @assetsUpdated="openAssetsUpdated(user._id!)"
        @newAssets="openNewAssets(user._id!)"
        @palletsUpdated="openPalletsUpdated(user._id!)"
        @newPallets="openNewPallets(user._id!)"
        @boxesUpdated="openBoxesUpdated(user._id!)"
        @newBoxes="openNewBoxes(user._id!)"
      />
    </div>
  </div>
</template>
