<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref, Ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import { BuildKitSchema, PartSchema, TextSearchPage, User, UserState } from '../../plugins/interfaces';
import { claimBuildKit, getBuildKitsByTextSearch, requestBuildKit } from '../../plugins/dbCommands/partManager';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import TextSearch from '../../plugins/TextSearchClass';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';
import BuildKitComponent from '../../components/PartComponents/BuildKitComponent.vue';
import Cacher from '../../plugins/Cacher';
import PlusButton from '../../components/GenericComponents/Buttons/PlusButton.vue';
import SelectUserComponent from '../../components/KioskComponents/SelectUserComponent.vue';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>();

// Default building is Ogden - 3
let kits: Ref<BuildKitSchema[]> = ref([]);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)
let showUserSelect = ref(false)
let users = ref([] as User[])
let kioskMode = ref(false)
let selectedKit = ref({} as BuildKitSchema)

onBeforeMount(async ()=>{
  users.value = (await Cacher.loadAllUsersFromAPISync()).filter((u)=>u.roles?.includes('check_out_parts'))
  kioskMode.value = Cacher.getCurrentUser().roles?.includes("is_kiosk") ? true : false
})

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string) {
  return new Promise<TextSearchPage>((res)=>{
    getBuildKitsByTextSearch(http, searchString, pageNum, buildingNum, async (data: any, err) => {
      if (err) {
        // Send error to error handler
        return res({pages: 0, total: 0, items: []})
      }
      // Typecast response
      let response = data as TextSearchPage
      await Promise.all(response.items.map((bk)=>{
        return Cacher.loadCartItems(bk.parts)
      }))
      // Resolve promise
      res(response);
    });
  })
}

// Unused
function advancedSearchCallback(buildingNum: number, pageNum: number, searchObject: PartSchema) {
  return new Promise<TextSearchPage>((res)=>{
    res({pages: 0, total: 0, items: []})
  })
}

function displayResults(page: BuildKitSchema[]) {
  kits.value = page
}

function claimKit(kit: BuildKitSchema) {
  if(kioskMode.value) {
    selectedKit.value = kit
    showUserSelect.value = true
    return
  }
  // Claim and add to inventory
  claimBuildKit(http, kit._id, (data, err) => {
    if(err)
      return errorHandler(err)
    searchObject.forceReloadPage()
    displayMessage(data as string)
  })
}

function requestKit(kit: BuildKitSchema) {
  // Send build kit request
  requestBuildKit(http, kit._id, (data, err) => {
    if(err)
      return errorHandler(err)
    displayMessage(data as string)
  })
}

function deleteKit(kit: BuildKitSchema) {
  // Go to delete page
  router.push({name: 'Delete Build Kit', query: {id: kit._id}})
}

function userSelect(u: User) {
  // Claim and add to inventory
  claimBuildKit(http, selectedKit.value._id, (data, err) => {
    if(err)
      return errorHandler(err)
    toggleUserPopup()
    searchObject.forceReloadPage()
    displayMessage(data as string)
  }, u._id)
}

function toggleUserPopup() {
  showUserSelect.value = !showUserSelect.value
}

</script>
<template>
  <div>
    <PageHeaderComponent class="mb-4">Build Kit Search</PageHeaderComponent>
    <SelectUserComponent
      v-if="showUserSelect"
      :users="users"
      @select="userSelect"
      @toggle="toggleUserPopup"
    />
    <TextSearchComponent
      :hide-q-r="true"
      :search-object="searchObject"
      @display-results="displayResults"
    >
      <template v-slot:searchIcons>
        <PlusButton @click="router.push({name: 'Create Build Kit'})" v-if="store.state.user.roles?.includes('create_build_kit')"/>
      </template>
      <template v-slot:searchHeader>
      </template>
      <template v-slot:searchResults>
        <BuildKitComponent
          v-for="kit in kits"
          :buildKit="kit"
          :create="store.state.user.roles?.includes('create_build_kit')?true:false"
          :request="store.state.user.roles?.includes('request_build_kit')?true:false"
          :claim="store.state.user.roles?.includes('claim_build_kit')||store.state.user.roles?.includes('is_kiosk')?true:false"
          @claim="claimKit(kit)"
          @request="requestKit(kit)"
          @delete="deleteKit(kit)"
        />
      </template>
    </TextSearchComponent>
  </div>
</template>
