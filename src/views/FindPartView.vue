<template>
    <div>
        <form class="flex justify-between" @submit.prevent="search">
            <input class="textbox w-[calc(80%-0.5rem)]" type="text" v-model="searchText" placeholder="🔍 keywords...">
            <input class="submit w-[calc(20%)] mt-0" type="submit" value="Search">
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
import { onBeforeMount, ref, Ref } from 'vue';
import { getPartsByTextSearch, getPartsByData } from '../plugins/dbCommands';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/store';
import { PartSchema } from '../model/part';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

var searchText = ref("")
var pageNum = 1
var parts: Ref<PartSchema[]> = ref([])

onBeforeMount(() => {
    // Get anything to display
    search()
});

async function addToCart(part: PartSchema) {
    if(store.getters.getQuantity(part._id) < part.quantity)
    {
        displayMessage(`Added ${part.manufacturer} ${part.name} to cart`)
        store.commit("addToCart", part._id)
    }
    else
    {
        errorHandler("Maximum quantity reached.")
    }
}

// Search function
async function search() {
    // Check for webnx regex
    if (/WNX([0-9]{7})+/.test(searchText.value)) {
        let query = searchText.value
        searchText.value = ""
        // Search and add to cart
        getPartsByData(http, { nxid: query }, (data, err) => {
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