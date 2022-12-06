<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import PartManagerComponent from '../components/PartManagerComponent.vue';
import type { UserState, PartSchema } from '../plugins/interfaces';
import { createPart } from '../plugins/dbCommands/partManager'

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}

const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
// END OF PROPS

async function submitPart(part: PartSchema) {
    // Use create part method from API commands 
    createPart(http, part, 3, "Parts Room", (data, err) => {
        if (err) {
            // Fail
            errorHandler(err)
            return
        }
        // Success
        displayMessage(String(data))
        // Call our reset form function
    })
}

</script>
<template>
    <PartManagerComponent :oldPart="{}" :strict="true" :submitText="`Create Part`" :title="'Create a new part: '" @partSubmit="submitPart" />
</template>