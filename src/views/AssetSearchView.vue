<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { onActivated, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetSearchComponent from '../components/AssetSearchComponent.vue';
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

</script>
<template>
    <div>
        <h1 class="text-4xl mb-4">Asset Search</h1>
        <AssetSearchComponent :router="router" :edit="true" :view="true" :http="http" :errorHandler="errorHandler" 
        :location="'Parts Room'" :building="currentBuilding" :displayMessage="displayMessage" @editAssetAction=""/>
    </div>
</template>