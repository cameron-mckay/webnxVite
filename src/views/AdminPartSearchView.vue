<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import type { Store } from 'vuex';
import SearchComponent from '../components/PartSearchComponent.vue';
import { ref, Ref, onActivated } from 'vue'
import { Router } from 'vue-router';
import type { UserState, PartSchema, CartItem } from '../plugins/interfaces';
import { updatePart, createNewPartRecords, getUniqueOnPartRecord } from '../plugins/dbCommands/partManager';
import AddInventoryComponent from '../components/AddInventoryComponent.vue';
import EditPartComponent from '../components/EditPartComponent.vue';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
let buildings:Ref<Array<number>> = ref([]);
let locations:Ref<Array<string>> = ref([]);
let editPart = ref(false)
let addPart = ref(false)
let currentBuilding = ref(3);
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()
getBuildingsAndLocations()
// END OF PROPS
let currentPart:Ref<PartSchema> = ref({})

// Wait for store to init
onActivated(()=>{
    currentBuilding.value = store.state.user.building!;
})

// Toggle editing parts menu
function toggleEdit(part: PartSchema) {
    currentPart.value = part
    editPart.value = !editPart.value
}

// Toggle add parts menu
function toggleAdd(part: PartSchema) {
    currentPart.value = part;
    addPart.value = !addPart.value;
}

function viewPart(part: PartSchema) {
    displayMessage("VIEW ACTION")
}

function update(part: PartSchema) {
    // Update part info
    updatePart(http, part, (data, err) => {
        if(err) {
            return errorHandler(err)
        }
        displayMessage(data as string)
        currentPart.value = {}
        editPart.value = false
    })
}

function submitAddToInventory(request: CartItem) {
    console.log(request)
    createNewPartRecords(http, request, (records, err) => {
        if (err) {
            return errorHandler(err)
        }
        displayMessage("Succesfully added to inventory")
        toggleAdd({});
    })
}

function getBuildingsAndLocations() {
    // Get all unique buildings
    getUniqueOnPartRecord(http, "building", (unique_buildings, err) => {
        if (err) {
            errorHandler(err)
        }
        buildings.value = unique_buildings as Array<number>
    })
    // Get all unique locations
    getUniqueOnPartRecord(http, "location", (unique_locations, err) => {
        if (err) {
            errorHandler(err)
        }
        locations.value = unique_locations as Array<string>
    })
}

</script>
<template>
    <div>
        <h1 class="text-4xl mb-4">Part Manager</h1>
        <SearchComponent :building="currentBuilding" :edit="true" :add="true" :view="true" :http="http" 
        :errorHandler="errorHandler" :location="'Parts Room'" :displayMessage="displayMessage" :changeBuilding="true"
        @editPartAction="toggleEdit" @addPartAction="toggleAdd" @viewPartAction="viewPart" :router="router"/>

        <EditPartComponent v-if="editPart" @toggle="toggleEdit" @updatePart="update" :show="editPart" :oldPart="currentPart"/>

        <AddInventoryComponent v-if="addPart" @toggle="toggleAdd" @submitRequest="submitAddToInventory" 
        :locations="locations" :buildings="buildings" :part="currentPart"/>
    </div>
</template>