<template>
    <div>
        <form class="flex justify-between" @submit.prevent="search">
            <input class="textbox w-[ calc(80%-0.5rem)]" type="text" v-model="searchText" placeholder="🔍 keywords...">
            <img class="w-5" @click="toggleAdvanced" src="../assets/sliders-solid.svg">
            <input class="submit w-[calc(20%)] mt-0" type="submit" value="Search">
            <div v-if="showAdvanced" class="w-full h-full absolute top-0 left-0 z-40 bg-gray-400 opacity-50" @click="toggleAdvanced"></div>
            <AdvancedSearchComponent v-if="showAdvanced" @advancedSearch="advancedSearch" @close="toggleAdvanced"/>
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
            <PartComponent v-for="part in parts" v-bind:key="part._id" :img_src="'/src/assets/plus-solid.svg'"
            @partAction="addToCart(part)" :part="part" />
        </div>
        <div v-else>
            <p>No results...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import PartComponent from '../components/PartComponent.vue';
import AdvancedSearchComponentVue  from '../components/AdvancedSearchComponent.vue';
import { onBeforeMount, ref, Ref } from 'vue';
import { getPartsByTextSearch, getPartByID, getPartsByData,  } from '../plugins/dbCommands';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/store';
import { PartSchema } from '../model/part';
import AdvancedSearchComponent from '../components/AdvancedSearchComponent.vue';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

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
    console.log("test")
}

function closeMenu() {
    if(showAdvanced.value) {
        showAdvanced.value = false
    }
}

async function addToCart(part: PartSchema) {
    if(store.getters.getQuantity(part._id) < part.quantity!)
    {
        displayMessage(`Added ${part.manufacturer} ${part.name} to cart`)
        store.commit("addToCart", part._id)
    }
    else
    {
        errorHandler("Maximum quantity reached.")
    }
}
async function advancedSearch(part: PartSchema) {
    getPartsByData(http, part, (data, err) => {
        showAdvanced.value = false
        if (err) {
            return errorHandler(err)
        } else if(data) {
            parts.value = data as PartSchema[];
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
        getPartByID(http, query, (data, err) => {
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
            // Add to cart
            addToCart(part)
        })
    }
    else {
        // Text search
        getPartsByTextSearch(http, searchText.value, pageNum, (data: any, err) => {
            if (err) {
                // Send error to error handler
                console.log(err)
                return errorHandler(err)
            }
            // typecast 
            parts.value = data as PartSchema[];
        })
    }
}

</script>