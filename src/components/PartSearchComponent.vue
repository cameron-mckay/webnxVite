<template>
    <div>
        <form class="flex justify-between" @submit.prevent="search">
            <input class="textbox w-[ calc(80%-0.5rem)]" type="text" v-model="searchText" placeholder="🔍 keywords...">
            <img class="w-5" @click="toggleAdvanced" src="../assets/sliders-solid.svg">
            <input class="submit w-[calc(20%)] mt-0" type="submit" value="Search">
            <div v-if="showAdvanced" class="w-full h-full absolute top-0 left-0 z-40 bg-zinc-700 opacity-50" @click="toggleAdvanced"></div>           
            <select v-model="building">
                <option :value="3" selected>3 - Ogden</option>
                <option :value="1">1 - LA</option>
            </select>
            <AdvancedSearchComponent v-if="showAdvanced" @advancedSearch="advancedSearch"/>
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

interface Props {
    http: AxiosInstance,
    location: string,
    building: number,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void,
    edit?: boolean,
    add?: boolean,
    view?: boolean
}

const { http, location, building, errorHandler, displayMessage, edit, add, view } = defineProps<Props>()
// END OF PROPS

const emit = defineEmits(['addPartAction', 'editPartAction', 'viewPartAction'])

let searchText = ref("")
let pageNum = 1
let parts: Ref<PartSchema[]> = ref([])
let showAdvanced = ref(false);

onBeforeMount(() => {
    // Get anything to display
    search()
});

function toggleAdvanced() {
    showAdvanced.value = !showAdvanced.value
}

function advancedSearch(part: PartSchema) {
    // Query the API
    getPartsByData(http, part, building, location, (data, err) => {
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
        getPartByID(http, query, building, location, (data, err) => {
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
        // Text search
        getPartsByTextSearch(http, searchText.value, pageNum, building, location, (data: any, err) => {
            if (err) {
                // Send error to error handler
                return errorHandler(err)
            }
            // typecast 
            parts.value = data as PartSchema[];
        })
    }
}

</script>