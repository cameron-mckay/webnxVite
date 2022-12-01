<script setup lang="ts">
import { CartItem } from '../plugins/interfaces';
import { Ref, ref } from 'vue';

interface Props {
    locations: Array<string>,
    buildings: Array<number>,
    id: string
}

const { locations, buildings, id } = defineProps<Props>()
let request:Ref<CartItem> = ref({
    id: id,
    quantity: 0,
    building: 3,
    location: "Parts Room"
})

function resetForm() {
    request.value.quantity = 0
    request.value.building = 3
    request.value.location = "Parts Room"
}


</script>
<template>
    <div class="w-full h-full top-0 left-0 absolute z-50 pointer-events-none">
        <div class="p-4 rounded-xl block bg-zinc-300 top-40 mx-auto mt-32 max-w-xl shadow-lg z-50 pointer-events-auto" @click="$emit('toggleAdd')">
            <div class="body">
                <h1 class="text-4xl mb-4">Add Parts to Inventory</h1>
                <form id="form" @submit.prevent="$emit('submitRequest', {id: request.id, quantity: request.quantity, location: request.location, building: request.building} as CartItem)" @reset.prevent="resetForm" class="grid grid-cols-2">
                    <label>Quantity: </label>
                    <input required v-model="request.quantity" type="text" placeholder="NXID">
                    <label>Building: </label>
                    <select v-model="request.building">
                        <option v-for="building in buildings" :value="building">{{ building }}</option>
                    </select>
                    <label>Location: </label>
                    <select v-model="request.location">
                        <option v-for="location in locations" :value="location">{{ location }}</option>
                    </select>
                    
                    <input class="col-span-2 submit bg-red-500 hover:bg-red-600 active:bg-red-700" type="reset" value="Reset">
                    <input class="col-span-2 submit" type="submit" value="Add">
                </form>
            </div>
        </div>
    </div>
</template>
<style scoped>
input, select {
    @apply textbox;
}
</style>