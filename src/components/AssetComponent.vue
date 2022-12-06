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
        <div
        class="grid md:grid-cols-6 grid-cols-5 relative leading-10 text-center group-hover:bg-zinc-400 
            p-2 rounded-lg group-hover:rounded-bl-none">
            <p>{{ asset.asset_tag }}</p>
            <p>{{ asset.building }}</p>
            <p>{{ asset.asset_type }}</p>
            <p>{{ asset.chassis_type }}</p>
            <p v-if="asset.live">Live</p>
            <p v-else>Inactive</p>
            <div class="flex justify-center">
                <img v-if="(edit===true)" class="h-10 w-10 p-2 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                    src="../assets/pencil-solid.svg" v-on:click="$emit('editPartAction')">
                <img v-if="(add===true)" class="h-10 w-10 p-2 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                    src="../assets/plus-solid.svg" v-on:click="$emit('addPartAction')">
                <img v-if="(view===true)" class="h-10 w-10 p-2 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                    src="../assets/eye-solid.svg" v-on:click="$emit('viewPartAction')">
            </div>
        </div>
        <div class="hidden h-0 absolute group-hover:h-auto group-hover:block rounded-b-lg 
            group-hover:bg-zinc-400 p-2 z-30 group-hover:shadow-lg">
            <p>{{ asset.manufacturer }}</p>
            <p>{{ asset.model }}</p>
            <p>{{ asset.date_updated }}</p>
            <p>{{ asset.date_created }}</p>
        </div>
    </div>
</template>