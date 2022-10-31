<script setup lang="ts">
import PartComponent from '../components/PartComponent.vue';

import { onBeforeMount, ref, Ref } from 'vue';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState } from '../plugins/store';
import { PartSchema } from '../model/part';
import { getPartByMongoID } from '../plugins/dbCommands';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS
var parts: Ref<Array<PartSchema>> = ref([])

onBeforeMount(() => {
    loadCart()
})

async function loadCart() {
    parts.value = []
    for (const id of store.state.cart) {
        console.log(id)
        getPartByMongoID(http, id, (data, err) => {
            if (err) {
                return errorHandler(err)
            }
            parts.value.push(data as PartSchema)
        })
    }
    console.log(parts)
}

async function removeFromCart(id: string) {
    store.commit("removeFromCart", id);
    loadCart()
    displayMessage("Removed from cart")
}
</script>

<template>
    <div v-if="parts.length != 0">
        <h1 class="text-4xl">Cart</h1>
        <div class="grid md:grid-cols-6 grid-cols-5 relative leading-10 text-center p-2 rounded-xl transition font-bold">
            <p class="md:block hidden">NXID</p>
            <p >Manufacturer</p>
            <p>Name</p>
            <p>Location</p>
            <p>Quantity</p>
            <p></p>
        </div>
        <PartComponent v-for="part in parts" v-bind:key="part._id" :part="part" :img_src="'/src/assets/x-solid.svg'"
            @partAction='removeFromCart(part._id!)' />    
    </div>
    <div v-else>
        <h1 class="text-4xl">Cart</h1>
        <p>is empty...</p>
    </div>
</template>