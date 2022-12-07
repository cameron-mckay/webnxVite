<template>
    <div v-smooth-resize="{delay: 50, transition: 800, fineTune: 27}">
        <form class="flex justify-between" @submit.prevent="search">
            <input class="textbox" type="text" v-model="searchText" placeholder="🔍 keywords...">
            <select v-if="changeBuilding===true" v-model="building" class="w-32">
                <option :value="3" selected>3 - Ogden</option>
                <option :value="1">1 - LA</option>
            </select>
            <img class="w-10 h-10 p-2 mx-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg inline-block transition" @click="toggleAdvanced" src="../assets/sliders-solid.svg">
            <img class="w-10 h-10 p-2 mx-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg inline-block transition" @click="addUntrackedAsset" src="../assets/plus-solid.svg">
            <input class="submit w-[calc(20%)] mt-0" type="submit" value="Search">
            <AdvancedSearchComponent v-if="showAdvanced" @partSearch="advancedSearch" @toggle="toggleAdvanced"/>
        </form>
        <div v-if="assets.length != 0">
            <div
            class="grid md:grid-cols-6 grid-cols-5 relative leading-10 text-center p-2 transition font-bold">
                <p class="md:block hidden">NXID</p>
                <p>Building</p>
                <p>Type</p>
                <p>Chassis</p>
                <p>Status</p>
                <p></p>
            </div>
            <AssetComponent :add="add" :edit="edit" :view="view" v-for="asset in assets" v-bind:key="asset._id"
            @editPartAction="$emit('editAssetAction', asset)" @addPartAction='$emit("addAssetAction", asset)' @viewPartAction="$emit('viewAssetAction', asset)"
            :asset="asset" />
        </div>
        <div v-else>
            <p>No results...</p>
        </div>
        <div class="text-right">
            <p class="inline-block mr-3">{{`Page: ${pageNum}`}}</p>
            <img v-if="multiplePages||pageNum>1"  class="h-10 w-10 p-2 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg inline-block transition"
                src="../assets/caret-left-solid.svg" v-on:click="prevPage">
            <img v-if="multiplePages||pageNum>1"  class="h-10 w-10 p-2 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg inline-block transition"
                src="../assets/caret-right-solid.svg" v-on:click="nextPage">
        </div>
    </div>
</template>
<script setup lang="ts">
import AssetComponent from './AssetComponent.vue';
import AdvancedSearchComponent  from './AssetAdvancedSearchComponent.vue';
import { onBeforeMount, ref, Ref } from 'vue';
import type { AxiosError, AxiosInstance } from 'axios';
import type { AssetSchema } from '../plugins/interfaces';
import { Router } from 'vue-router';
import { getAssetByID, getAssetsByData, getAssetsByTextSearch } from '../plugins/dbCommands/assetManager';

// Props interface
interface Props {
    http: AxiosInstance,
    location: string,
    building: number,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void,
    edit?: boolean,
    add?: boolean,
    view?: boolean,
    changeBuilding?: boolean
}

// Define shit
let props = defineProps<Props>()
const emit = defineEmits(['addAssetAction', 'editAssetAction', 'viewAssetAction'])
defineExpose({
    search
})

// component variables
let { http, router, errorHandler, displayMessage, edit, add, view, changeBuilding } = props
let building = ref(props.building)
let searchText = ref("")
let pageNum = ref(1)
let assets: Ref<AssetSchema[]> = ref([])
let showAdvanced = ref(false);
let multiplePages = ref(false);

// Before component is mounted
onBeforeMount(async () => {
    // Fuck this
    let { query } = router.currentRoute.value
    if(query.building) {
        building.value = parseInt(query.building as string)
    }
    // Check for advanced search
    if(query.advanced === "true"){
        let searchAsset = {} as AssetSchema
        // Loop through query to create part object
        for (const key in query) {
            // Copy
            searchAsset[key] = query[key]
        }
        // Search
        advancedSearch(searchAsset)
    }
    else {
        // Check for search text
        if(query.text) {
            searchText.value = query.text as string
        }
        if(query.pageNum) {
            console.log("test")
            pageNum.value = parseInt(query.pageNum as string)
            console.log(pageNum)
        }
        search()
    }
});

// Previous search page
function prevPage() {
    if (pageNum.value > 1) {
        pageNum.value -= 1
        search()
    }
}

// Next search page
function nextPage() {
    if (multiplePages) {
        pageNum.value+=1
        search()
    }
}

// Toggle advanced search
function toggleAdvanced() {
    showAdvanced.value = !showAdvanced.value
}

// Advanced search
async function advancedSearch(asset: AssetSchema) {
    asset['advanced'] = 'true'
    
    router.push({query:asset})
    // Query the API
    getAssetsByData(http, asset, (data, err) => {
        // Hide advanced search
        showAdvanced.value = false
        // Error
        if (err) {
            // Handle the error
            return errorHandler(err)
        } else if(data) {
            // Set parts list to API response
            assets.value = data as AssetSchema[];
        }
    })
}

// Search function
async function search() {
    // Check for webnx regex
    if (/WNX([0-9]{7})+/.test(searchText.value)) {
        // temp value
        let query = searchText.value
        searchText.value = ""
        // Search and add to cart
        getAssetByID(http, query, (data, err) => {
            if (err) {
                // Part not found
                return errorHandler(err)
            }
            // Typecast data
            let asset = data as AssetSchema
            if (asset == null) {
                // If no part was found
                return errorHandler("Asset not found.")
            }
            // Emit actions
            if (add===true) {
                emit("addAssetAction", asset)
            } else if(view===true) {
                emit("viewAssetAction", asset)
            } else if(edit==true) {
                emit("viewAssetAction", asset)
            }
        })
    }
    else {
        multiplePages.value = false;
        // Text search
        router.push({query:{text: searchText.value, pageNum: pageNum.value }})
        getAssetsByTextSearch(http, searchText.value, pageNum.value, (data: any, err) => {
            if (err) {
                // Send error to error handler
                return errorHandler(err)
            }
            // typecast 
            assets.value = data as AssetSchema[];
            if(assets.value.length > 50) {
                assets.value.pop;
                multiplePages.value = true;
            } else if(assets.value.length === 0 && pageNum.value != 1) {
                pageNum.value = 1
                search()
            }
        })
    }
}

function addUntrackedAsset () {
    router.push({name: 'Add Untracked Asset'})
}
</script>