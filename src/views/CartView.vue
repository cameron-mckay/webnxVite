<script setup lang="ts">
import CartItemComponent from '../components/CartItemComponent.vue';

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

interface CartItem {
    part: PartSchema,
    quantity: number
}

var parts: Ref<Array<CartItem>> = ref([])

onBeforeMount(() => {
    loadCart()
})

async function loadCart() {
    parts.value = []
    for (const item of store.state.cart) {
        getPartByMongoID(http, item.id, (data, err) => {
            if (err) {
                return errorHandler(err)
            }
            let part = data as PartSchema
            parts.value.push({ part, quantity: store.getters.getQuantity(part._id)})
        })
    }
    console.log(parts)
}

async function deletePart(id: string) {
    store.commit("removeAll", id);
    loadCart()
}

async function addOne(id: string) {
    getPartByMongoID(http, id, (data, err) => {
        let part = data as PartSchema
        if(part.quantity > store.getters.getQuantity(id)){
            store.commit("addOne", id)
        } else {
            errorHandler("Maximum quantity reached.")
        }
    })
}

async function subOne(id: string) {
    store.commit("removeOne", id)
    if (store.getters.getQuantity(id) == 0){
        loadCart()
    }
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
        <CartItemComponent v-for="item in parts" v-bind:key="item.part._id" :part="item.part" :quantity="item.quantity"
            @plus='addOne(item.part._id!)' @minus='subOne(item.part._id!)' @delete='deletePart(item.part._id!)'/>    
    </div>
    <div v-else>
        <h1 class="text-4xl">Cart</h1>
        <p>is empty...</p>
    </div>
</template>