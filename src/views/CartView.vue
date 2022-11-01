<script setup lang="ts">
import CartItemComponent from '../components/CartItemComponent.vue';

import { onBeforeMount, ref, Ref } from 'vue';

// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import type { UserState, PartSchema, LoadedCartItem } from '../plugins/interfaces';
import { checkout, getPartByID } from '../plugins/dbCommands';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS



let parts: Ref<Array<LoadedCartItem>> = ref([])

onBeforeMount(() => {
    loadCart()
})

async function loadCart() {
    parts.value = []
    for (const item of store.state.cart) {
        getPartByID(http, item.id, (data, err) => {
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
    getPartByID(http, id, (data, err) => {
        let part = data as PartSchema
        if(part.quantity! > store.getters.getQuantity(id)){
            store.commit("addOne", id)
        } else {
            errorHandler("Not enough stock.")
        }
    })
}

async function subOne(id: string) {
    store.commit("removeOne", id)
    if (store.getters.getQuantity(id) == 0){
        loadCart()
    }
}

function localCheckout() {
    checkout(http, store.state.cart, (data, err) => {
        if(err) {
            return errorHandler(err)
        }
        displayMessage("Successfully checked out.")
        store.commit("emptyCart")
        loadCart()
    })
}

</script>

<template>
    <div v-if="parts.length != 0">
        <h1 class="text-4xl mb-4">Cart</h1>
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
        <form class="flex justify-center" @submit.prevent="localCheckout">
            <input type="submit" class="submit" value="Checkout">
        </form>
    </div>
    <div v-else>
        <h1 class="text-4xl mb-4">Cart</h1>
        <p>is empty...</p>
    </div>
</template>