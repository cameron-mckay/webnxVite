<script setup lang="ts">
import { AssetSchema } from '../plugins/interfaces';

interface Props {
    asset: AssetSchema
    edit?: boolean,
    add?: boolean,
    view?: boolean
}

const { asset, edit, add, view } = defineProps<Props>()
</script>

<template>
    <div class="group my-1">
        <div class="grid md:grid-cols-6 grid-cols-4 relative leading-10 text-center group-hover:bg-zinc-400 
            p-2 rounded-lg group-hover:rounded-bl-none">
            <p>{{ asset.asset_tag }}</p>
            <p class="break-words">{{ asset.building }}</p>
            <p class="break-words md:block hidden">{{ asset.asset_type }}</p>
            <p class="break-words md:block hidden">{{ asset.chassis_type }}</p>
            <p v-if="asset.live">Live</p>
            <p v-else>Inactive</p>
            <div class="flex justify-center">
                <img v-if="(edit === true)"
                    class="md:h-10 md:w-10 w-8 h-8 p-2 m-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                    src="../assets/pencil-solid.svg" v-on:click="$emit('editPartAction')">
                <img v-if="(add === true)"
                    class="md:h-10 md:w-10 w-8 h-8 p-2 m-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                    src="../assets/plus-solid.svg" v-on:click="$emit('addPartAction')">
                <img v-if="(view === true)"
                    class="md:h-10 md:w-10 w-8 h-8 p-2 m-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                    src="../assets/eye-solid.svg" v-on:click="$emit('viewPartAction')">
            </div>
        </div>
        <div class="hidden h-0 absolute group-hover:h-auto group-hover:block rounded-b-lg 
            group-hover:bg-zinc-400 p-2 z-30 group-hover:shadow-lg">
            <p>{{ "Type: " + asset.asset_type }}</p>
            <p>{{ "Chassis: " + asset.chassis_type }}</p>
            <p>{{ "Manufacturer: " + asset.manufacturer }}</p>
            <p>{{ "Model: " + asset.model }}</p>
            <p>{{ "Date Updated: " + new Date(Date.parse(asset.date_updated!)).toDateString() }}</p>
            <p>{{ "Date Created: " + new Date(Date.parse(asset.date_created!)).toDateString() }}</p>
        </div>
    </div>
</template>
