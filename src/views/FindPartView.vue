<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import SearchComponent from '../components/SearchComponent.vue';
import type { UserState, PartSchema } from '../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

function addToCart(part: PartSchema) {
    displayMessage(`Added ${part.manufacturer} ${part.name} to cart`)
    store.commit("addToCart", part._id)
}

</script>
<template>
    <SearchComponent :http="http" :imgUrl="'/src/assets/plus-solid.svg'" :errorHandler="errorHandler" :displayMessage="displayMessage" @partAction="addToCart"/>
</template>