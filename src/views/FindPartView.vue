<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { onActivated, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import SearchComponent from '../components/PartSearchComponent.vue';
import type { UserState, PartSchema } from '../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
let currentBuilding = ref(3);

onActivated(()=>{
    currentBuilding.value = store.state.user.building!;
})

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

function addToCart(part: PartSchema) {
    displayMessage(`Added ${part.manufacturer} ${part.name} to cart`)
    store.commit("addToCart", part.nxid)
}

</script>
<template>
    <div>
        <h1 class="text-4xl mb-4">Part Search</h1>
        <SearchComponent :router="router" :add="true" :http="http" :errorHandler="errorHandler" 
        :location="'Parts Room'" :building="currentBuilding" :displayMessage="displayMessage" @addPartAction="addToCart"/>
    </div>
</template>