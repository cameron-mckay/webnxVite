<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onActivated, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AssetSearchComponent from '../components/AssetSearchComponent.vue';
import type { UserState, AssetSchema } from '../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

// Default building is Ogden - 3
let currentBuilding = ref(3);

onActivated(()=>{
    // Change current building when store is loaded
    currentBuilding.value = store.state.user.building!;
})

// Toggle editing menu
function toggleEdit(asset: AssetSchema) {
    router.push({name: 'Edit Asset', query: {asset_tag: asset.asset_tag}})
}
</script>
<template>
    <div>
        <!-- Title area -->
        <h1 class="text-4xl mb-4">Asset Search</h1>
        <!-- Search menu -->
        <AssetSearchComponent :http="http" :router="router" :edit="true" :view="true" :errorHandler="errorHandler" 
        :location="'Parts Room'" :building="currentBuilding" :displayMessage="displayMessage" @editAssetAction="toggleEdit"/>
        <!-- Asset editing popup menu -->
    </div>
</template>