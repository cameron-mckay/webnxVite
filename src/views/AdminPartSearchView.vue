<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import PartManagerComponent from '../components/PartManagerComponent.vue';
import SearchComponent from '../components/PartSearchComponent.vue';
import { ref, Ref } from 'vue'
import type { UserState, PartSchema } from '../plugins/interfaces';
import { updatePart } from '../plugins/dbCommands/partManager';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
let editPart = ref(false)

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS
let currentPart:Ref<PartSchema> = ref({})

function toggleEdit(part: PartSchema) {
    currentPart.value = part
    if(editPart.value){
        editPart.value = false
    } else {
        currentPart.value = part
        editPart.value = true
    }
}

function update(part: PartSchema) {
    updatePart(http, part, (data, err) => {
        if(err) {
            return errorHandler(err)
        }
        displayMessage(data as string)
        currentPart.value = {}
        editPart.value = false
    })
}

</script>
<template>
    <div>
        <SearchComponent :http="http" :imgUrl="'/assets/pencil-solid.svg'" :errorHandler="errorHandler" location="'Parts Room'" :displayMessage="displayMessage" @partAction="toggleEdit"/>
        <div v-if="editPart" class="w-full h-full absolute top-0 left-0 z-40 bg-zinc-700 opacity-50" @click="toggleEdit"></div>
        <div v-if="editPart" class="w-full h-full absolute top-0 left-0 z-50 pointer-events-none">
            <div class="p-4 rounded-xl block bg-zinc-300 top-40 mx-auto mt-32 max-w-xl shadow-lg z-50 pointer-events-auto">
                <PartManagerComponent class="pointer-events-auto" :title="'Edit Part: '" :submitText="'Update'" :strict="true" :oldPart="currentPart" @partSubmit="update"/>
            </div>
        </div>
    </div>
</template>