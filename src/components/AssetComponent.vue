<script setup lang="ts">
import { AssetSchema } from '../plugins/interfaces';

interface Props {
    asset: AssetSchema
}

const { asset } = defineProps<Props>()
</script>

<template>
    <div class="group my-1">
        <div
        class="grid grid-cols-5 relative leading-10 text-center group-hover:bg-zinc-400 
            p-2 rounded-lg group-hover:rounded-bl-none">
            <p>{{ asset.asset_tag }}</p>
            <p>{{ asset.building }}</p>
            <p>{{ asset.asset_type }}</p>
            <p>{{ asset.chassis_type }}</p>
            <p v-if="asset.live">Live</p>
            <p v-else>Inactive</p>
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