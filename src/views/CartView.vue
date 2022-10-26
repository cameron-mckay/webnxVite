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
    <div class="body">
        <PartComponent v-for="part in parts" v-bind:key="part._id" :part="part" :img_src="'../assets/x-solid.svg'"
            @partAction='removeFromCart(part._id!)' />
    </div>
</template>