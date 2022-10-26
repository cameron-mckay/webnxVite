<template>
    <div class="body">
        <form @submit.prevent="search">
            <input type="text" v-model="searchText">
            <input type="submit">
        </form>
        <div class="parts">
            <PartComponent v-for="part in parts" v-bind:key="part._id" :img_src="'../assets/plus-solid.svg'"
                @partAction="addToCart(part)" :part="part" />
        </div>
    </div>
</template>

<script setup lang="ts">
import PartComponent from '../components/PartComponent.vue';
import { onBeforeMount, ref, watch, Ref } from 'vue';
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
    displayMessage(`Added ${part.manufacturer} ${part.name} to cart`)
    store.commit("addToCart", part._id)
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