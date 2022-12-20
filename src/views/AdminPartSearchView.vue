<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onActivated, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AddInventoryComponent from '../components/AddInventoryComponent.vue';
import EditPartComponent from '../components/EditPartComponent.vue';
import SearchComponent from '../components/PartSearchComponent.vue';
import { createNewPartRecords, getUniqueOnPartRecord, updatePart } from '../plugins/dbCommands/partManager';
import type { CartItem, PartSchema, UserState } from '../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

let buildings: Ref<Array<number>> = ref([]);
let locations: Ref<Array<string>> = ref([]);
let editPart = ref(false)
let addPart = ref(false)
let currentPart: Ref<PartSchema> = ref({})
let currentBuilding = ref(3);
getBuildingsAndLocations()

// Wait for store to init
onActivated(() => {
    currentBuilding.value = store.state.user.building!;
})

// Get unique buildings and locations
function getBuildingsAndLocations() {
    // Get all unique buildings
    getUniqueOnPartRecord(http, "building", {}, (unique_buildings, err) => {
        if (err) {
            errorHandler(err)
        }
        buildings.value = unique_buildings as Array<number>
    })
    // Get all unique locations
    getUniqueOnPartRecord(http, "location", {}, (unique_locations, err) => {
        if (err) {
            errorHandler(err)
        }
        locations.value = unique_locations as Array<string>
    })
}

// Get search method from child component
const searchRef = ref();
const search = () => {
    searchRef.value.search();
}

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

function updatePartInfo(part: PartSchema) {
    // Update part info
    updatePart(http, part, (data, err) => {
        if (err) {
            return errorHandler(err)
        }
        // Display confirmation
        displayMessage(data as string)
        // Reset vars
        toggleEdit({})
        // Call search to refresh data
        search();
    })
}

function submitAddToInventory(request: CartItem) {
    // Send creation details to API
    createNewPartRecords(http, request, (records, err) => {
        if (err) {
            return errorHandler(err)
        }
        // Display confimation
        displayMessage("Succesfully added to inventory")
        // Reset
        toggleAdd({});
        // Refresh parts list
        search()
    })
}
</script>
<template>
    <div>
        <h1 class="text-4xl mb-4">Part Manager</h1>
        <SearchComponent ref="searchRef" :building="currentBuilding" :edit="true" :add="true" :view="true" :http="http"
            :errorHandler="errorHandler" :location="'Parts Room'" :displayMessage="displayMessage"
            :changeBuilding="true" @editPartAction="toggleEdit" @addPartAction="toggleAdd" @viewPartAction="viewPart"
            :router="router" />

        <EditPartComponent v-if="editPart" @toggle="toggleEdit" @updatePart="updatePartInfo" :show="editPart"
            :oldPart="currentPart" />

        <AddInventoryComponent v-if="addPart" @toggle="toggleAdd" @submitRequest="submitAddToInventory"
            :locations="locations" :buildings="buildings" :part="currentPart" />
    </div>
</template>
