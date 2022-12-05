<template>
    <div>
        <form class="flex justify-between" @submit.prevent="search">
            <input class="textbox" type="text" v-model="searchText" placeholder="🔍 keywords...">
            <select v-if="changeBuilding===true" v-model="building" class="w-32">
                <option :value="3" selected>3 - Ogden</option>
                <option :value="1">1 - LA</option>
            </select>
            <img class="w-10 h-10 p-2 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg inline-block transition" @click="toggleAdvanced" src="../assets/sliders-solid.svg">
            <div v-if="showAdvanced" class="w-full h-full absolute top-0 left-0 z-40 bg-zinc-700 opacity-50" @click="toggleAdvanced"></div>           
            <input class="submit w-[calc(20%)] mt-0" type="submit" value="Search">
            <AdvancedSearchComponent v-if="showAdvanced" @partSearch="advancedSearch" @toggle="toggleAdvanced"/>
        </form>
        <div v-if="parts.length != 0">
            <div
            class="grid md:grid-cols-6 grid-cols-5 relative leading-10 text-center p-2 transition font-bold">
                <p class="md:block hidden">NXID</p>
                <p >Manufacturer</p>
                <p>Name</p>
                <p>Location</p>
                <p>Quantity</p>
                <p></p>
            </div>
            <PartComponent :add="add" :edit="edit" :view="view" v-for="part in parts" v-bind:key="part._id"
            @editPartAction="$emit('editPartAction', part)" @addPartAction='$emit("addPartAction", part)' @viewPartAction="$emit('viewPartAction', part)"
            :part="part" />
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
import PartComponent from './PartComponent.vue';
import AdvancedSearchComponent  from './AdvancedSearchComponent.vue';
import { onBeforeMount, ref, Ref } from 'vue';
import { getPartsByTextSearch, getPartByID, getPartsByData } from '../plugins/dbCommands/partManager';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import type { PartSchema } from '../plugins/interfaces';
import { Router } from 'vue-router';

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

let props = defineProps<Props>()
let { http, router, errorHandler, displayMessage, edit, add, view, changeBuilding } = props
// END OF PROPS

const emit = defineEmits(['addPartAction', 'editPartAction', 'viewPartAction'])

let location = props.location
let building = ref(props.building)
let searchText = ref("")
let pageNum = ref(1)
let parts: Ref<PartSchema[]> = ref([])
let showAdvanced = ref(false);
let multiplePages = ref(false);

onBeforeMount(() => {
    // Fuck this
    if(router.currentRoute.value.query.text) {
        searchText.value = router.currentRoute.value.query.text as string
    }
    if(router.currentRoute.value.query.location) {
        location = router.currentRoute.value.query.location as string
    }
    if(router.currentRoute.value.query.pageNum) {
        console.log("test")
        pageNum.value = parseInt(router.currentRoute.value.query.pageNum as string)
        console.log(pageNum)
    }
    if(router.currentRoute.value.query.building) {
        building.value = parseInt(router.currentRoute.value.query.building as string)
    }
    search()
});

function toggleAdvanced() {
    showAdvanced.value = !showAdvanced.value
}

function nextPage() {
    if (multiplePages) {
        pageNum.value+=1
        search()
    }
}

function prevPage() {
    if (pageNum.value > 1) {
        pageNum.value -= 1
        search()
    }
}

function advancedSearch(part: PartSchema) {
    router.push(part)
    // Query the API
    getPartsByData(http, part, building.value, location, (data, err) => {
        // Hide advanced search
        showAdvanced.value = false
        // Error
        if (err) {
            // Handle the error
            return errorHandler(err)
        } else if(data) {
            // Set parts list to API response
            parts.value = data as PartSchema[];
        }
    })
}

// Search function
function search() {
    // Check for webnx regex
    if (/WNX([0-9]{7})+/.test(searchText.value)) {
        // temp value
        let query = searchText.value
        searchText.value = ""
        // Search and add to cart
        getPartByID(http, query, building.value, location, (data, err) => {
            if (err) {
                // Part not found
                return errorHandler(err)
            }
            // Typecast data
            let part = data as PartSchema
            if (part == null) {
                // If no part was found
                return errorHandler("Part not found.")
            }
            // Emit actions
            if (add===true) {
                emit("addPartAction", part)
            } else if(view===true) {
                emit("viewPartAction", part)
            } else if(edit==true) {
                emit("viewPartAction", part)
            }
        })
    }
    else {
        multiplePages.value = false;
        // Text search
        router.push({query:{text: searchText.value, pageNum: pageNum.value, building: building.value, location }})
        getPartsByTextSearch(http, searchText.value, pageNum.value, building.value, location, (data: any, err) => {
            if (err) {
                // Send error to error handler
                return errorHandler(err)
            }
            // typecast 
            parts.value = data as PartSchema[];
            if(parts.value.length > 50) {
                parts.value.pop;
                multiplePages.value = true;
            } else if(parts.value.length === 0 && pageNum.value != 1) {
                pageNum.value -= 1
                search()
            }
        })
    }
}

</script>