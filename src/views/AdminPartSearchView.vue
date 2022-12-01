<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import PartManagerComponent from '../components/PartManagerComponent.vue';
import SearchComponent from '../components/PartSearchComponent.vue';
import { ref, Ref, onBeforeMount } from 'vue'
import type { UserState, PartSchema, CartItem } from '../plugins/interfaces';
import { updatePart, createNewPartRecords, getUniqueOnPartRecord } from '../plugins/dbCommands/partManager';
import AddInventoryComponent from '../components/AddInventoryComponent.vue';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
let editPart = ref(false)
let addPart = ref(false)
let partID = ref("")
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

function toggleAdd(part: PartSchema) {
    displayMessage("ADD ACTION")
    if(addPart.value){
        addPart.value = false
    } else {
        addPart.value = true
        partID.value = part._id!;
    }
}

function viewPart(part: PartSchema) {
    displayMessage("VIEW ACTION")
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


onBeforeMount(()=>{
    getBuildingsAndLocations()
})

function submitAddToInventory(request: CartItem) {
    createNewPartRecords(http, request, (records, err) => {
        if (err) {
            errorHandler(err)
        }
        displayMessage("Succesfully added to inventory")
    })
}

let buildings:Ref<Array<number>> = ref([]);
let locations:Ref<Array<string>> = ref([]);

function getBuildingsAndLocations() {
    getUniqueOnPartRecord(http, "building", (unique_buildings, err) => {
        if (err) {
            errorHandler(err)
        }
        console.log(unique_buildings)
        buildings.value = unique_buildings as Array<number>
    })
    getUniqueOnPartRecord(http, "location", (unique_locations, err) => {
        if (err) {
            errorHandler(err)
        }
        console.log(unique_locations)
        locations.value = unique_locations as Array<string>
    })
}



</script>
<template>
    <div>
        <SearchComponent :building="store.state.user.building!" :edit="true" :add="true" :view="true" :http="http" 
        :errorHandler="errorHandler" location="'Parts Room'" :displayMessage="displayMessage" 
        @editPartAction="toggleEdit" @addPartAction="toggleAdd" @viewPartAction="viewPart"/>
        <div v-if="editPart" class="w-full h-full absolute top-0 left-0 z-40 bg-zinc-700 opacity-50" @click="toggleEdit"></div>
        <div v-if="editPart" class="w-full h-full absolute top-0 left-0 z-50 pointer-events-none">
            <div class="p-4 rounded-xl block bg-zinc-300 top-40 mx-auto mt-32 max-w-xl shadow-lg z-50 pointer-events-auto">
                <PartManagerComponent class="pointer-events-auto" :title="'Edit Part: '" :submitText="'Update'" :strict="true" :oldPart="currentPart" @partSubmit="update"/>
            </div>
        </div>
        <div v-if="addPart" class="w-full h-full absolute top-0 left-0 z-40 bg-zinc-700 opacity-50 pointer-events-auto" @click="toggleAdd"></div>
        
            
                <AddInventoryComponent v-if="addPart" class="z-50 pointer-events-auto" :toggleAdd="toggleAdd" :locations="locations" :buildings="buildings" :id="partID" @submitRequest="submitAddToInventory"/>
        
        
    </div>
</template>