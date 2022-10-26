<template>
    <div class="body">
        <form @submit.prevent="search">
            <input type="text" v-model="searchText">
            <input type="submit">
        </form>
        <div class="parts">
            <PartComponent v-for="part in parts" v-bind:key="part._id" v-on:click="addToCart(part._id)" :part="part" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch, Ref } from 'vue';
import { getPartsByTextSearch } from '../plugins/dbCommands';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/store';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

var searchText = ref("")
var pageNum = 1
var count = 0
var parts: Ref<object[]> = ref([])

onBeforeMount(() => {
    // Get anything to display
    search()
});

async function addToCart(id: string) {
    store.commit("addToCart", id);
    console.log(store.state)
}

// Search function
async function search() {
    getPartsByTextSearch(http, searchText.value, pageNum, (data: any, err) => {
        if (err) {
            // Send error to error handler
            console.log(err)
            return errorHandler(err)
        }
        parts.value = data;
    })
}

// Watch for 
watch(() => searchText.value, () => {

    if (/WNX([0-9]{7})+/.test(searchText.value)) {
        // Search and add to cart
        count++
        searchText.value = ""
        console.log("BOOBS " + count)
    }
})

</script>