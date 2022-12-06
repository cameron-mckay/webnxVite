<script setup lang="ts">
import { CartItem, PartSchema } from '../plugins/interfaces';
import { Ref, ref, onMounted } from 'vue';
import FullScreenPopupComponent from './FullScreenPopupComponent.vue';

interface Props {
    locations: Array<string>,
    buildings: Array<number>,
    part: PartSchema,
}

const { locations, buildings, part } = defineProps<Props>()
let request:Ref<CartItem> = ref({
    nxid: part.nxid!,
    quantity: 0,
    building: 3,
    location: "Parts Room"
})

function resetForm() {
    request.value.quantity = 0
    request.value.building = 3
    request.value.location = "Parts Room"
}

onMounted(()=>{
    request.value.nxid = part.nxid!
})

</script>
<template>
    <FullScreenPopupComponent>
        <h1 class="text-4xl mb-4">Add Parts to Inventory</h1>
        <form id="form" @submit.prevent="$emit('submitRequest', request)" @reset.prevent="resetForm" class="grid grid-cols-2">
            <label>Quantity: </label>
            <input required v-model="request.quantity" type="number" placeholder="Quantity">
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
    </FullScreenPopupComponent>
</template>