<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import { onBeforeMount, ref } from 'vue';
import type {
UserState,
} from '../../plugins/interfaces';
import { getAvail } from '../../plugins/dbCommands/tenantAPI';
import PartButton from '../../components/GenericComponents/Buttons/PartButton.vue';
import FullScreenPopupComponent from '../../components/GenericComponents/FullScreenPopupComponent.vue';
import PlusButton from '../../components/GenericComponents/Buttons/PlusButton.vue';
import FilterTag from '../../components/GenericComponents/FilterTag.vue';
import PageHeaderComponent from '../../components/GenericComponents/PageHeaderComponent.vue';
import ArrowOutButton from '../../components/GenericComponents/Buttons/ArrowOutButton.vue';
import ServerButton from '../../components/GenericComponents/Buttons/ServerButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import SVGCaretDown from '../../components/GenericComponents/SVG/SVGCaretDown.vue';
import SVGLeftCaret from '../../components/GenericComponents/SVG/SVGLeftCaret.vue';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let loading = ref(false)
let cpus = ref([] as any[])
let filterVisible = ref(false)
let toggles = ref([] as boolean[])
let tagsAvailable = ["UT", "LA", "For rent", "DC1", "10gbps", "Internal", "GPU", "PCIE5"]

let power_status = ref("offline")
let brand = ref("")

let filterMap = ref(new Map<string, any>())
function togglePopup() {
  filterVisible.value = !filterVisible.value
}

onBeforeMount(()=>{
  loadServers()
})

function loadServers(){
  loading.value = true;
  getAvail(http, power_status.value, Array.from(filterMap.value.keys()), brand.value, (data, err)=>{
    if(err)
      return errorHandler(err)
    cpus.value = data as any[]
    toggles.value = cpus.value.map(()=>false)
    loading.value = false;
  })
}

</script>
<template>
  <div>
    <PageHeaderComponent>Available Servers</PageHeaderComponent>
    <form @submit.prevent="" class="flex flex-wrap mb-2">
      <div class="w-full md:w-auto flex">
        <div class="mr-2">
          <label>Power Status: </label>
          <br class="md:hidden">
          <select v-model="power_status">
            <option value="">Any</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div class="mr-2">
          <label>Brand: </label>
          <br class="md:hidden">
          <select v-model="brand">
            <option value="">Any</option>
            <option value="WebNX">WebNX</option>
            <option value="GSI">GSI</option>
          </select>
        </div>
      </div>

      <input class="search-button mr-2 mb-2 md:mb-0 mt-auto bg-blue-400 hover:bg-blue-500 active:bg-blue-600 px-4" type="button" value="Tags" @click="togglePopup"/>
      <FullScreenPopupComponent
        v-show="filterVisible"
        @toggle="togglePopup"
      >
        <h1 class="my-auto text-4xl mb-2">Filter Tags</h1>
        <FilterTag class="mb-2" v-for="tag of Array.from(filterMap.keys())" :name="tag" @remove="filterMap.delete(tag)"/>
        <div v-for="tag of tagsAvailable"
          class="background-and-border hover:bab-hover grid p-1 text-center leading-8 grid-cols-2 md:p-2 md:leading-10 my-1"
        >
          <p>{{ tag }}</p>
          <div class="flex justify-end">
            <PlusButton @click="filterMap.set(tag, tag)"/>
          </div>
        </div>
      </FullScreenPopupComponent>
      <input class="search-button mr-0 mb-2 md:mb-0 mt-auto" type="submit" value="Go" @click="loadServers"/>
    </form>
    <FilterTag class="mb-2" v-for="tag of Array.from(filterMap.keys())" :name="tag" @remove="filterMap.delete(tag)"/>
    <LoaderComponent v-if="loading"/>
    <div v-else>
      <div v-for="(cpu, index) of cpus">
        <div class="hover:hover-color rounded-md flex justify-between cursor-pointer transition" @click="toggles[index]=!toggles[index]">
          <p class="font-extrabold text-2xl my-4 p-2">{{cpu.cpu}} - {{cpu.servers.length}}</p>
          <SVGCaretDown v-if="toggles[index]" class="text-black dark:text-gray-200 w-8 h-8 my-auto p-1 mr-2"/>
          <SVGLeftCaret v-else class="text-black dark:text-gray-200 w-8 h-8 my-auto p-1 mr-2"/>
          
        </div>
        <div v-if="toggles[index]">
          <div class="grid grid-cols-5 text-center font-bold mb-1">
            <p>Name</p>
            <p>Mobo</p>
            <p>RAM</p>
            <p>Brand</p>
            <p></p>
          </div>
          <div v-for="server of cpu.servers"
            class="background-and-border hover:bab-hover grid p-1 text-center leading-8 grid-cols-5 md:p-2 md:leading-10 my-1"
          >
            <p>{{server.name}}</p>
            <p>{{server.mobo}}</p>
            <p>{{server.ram}}GB</p>
            <p>{{server.brand}}</p>
            <div class="flex justify-end">
              <a class="mr-2" :href="`/assets/view?asset_tag=${server.name}`" target="_blank">
                <ServerButton v-if="server.inventory"/>
              </a>
              <a :href="server.tenant_link" target="_blank">
                <ArrowOutButton/>
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
