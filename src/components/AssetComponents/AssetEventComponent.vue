<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AssetEvent, AssetSchema, CartItem, LoadedCartItem, PartSchema, User } from '../../plugins/interfaces';

interface Props {
    assets: Map<string, AssetSchema>,
    users: Map<string, User>,
    parts: Map<string, PartSchema>,
    event: AssetEvent
}

let { assets, users, parts, event } = defineProps<Props>()

let asset = ref({
    _id: "",
    asset_tag: "",
    prev: "",
    next: "",
    building: 3,
    asset_type: "",
    chassis_type: "",
    manufacturer: "",
    model: "",
    serial: "",
    rails: false,
    live: false,
    bay: 3,
    power_port: "",
    public_port: "",
    private_port: "",
    ipmi_port: "",
    by: "",
    sid: 1,
    date_created: "",
    date_replaced: "",
} as AssetSchema)

let user = ref(users.get(asset.value?.by!))
let prevAsset = ref({}as AssetSchema)
let existing = ref([] as LoadedCartItem[])
let added = ref([] as LoadedCartItem[])
let removed = ref([] as LoadedCartItem[])

function loadPart(part: CartItem) {
    return {part: parts.get(part.nxid), quantity: part.quantity} as LoadedCartItem
}

onMounted(()=>{
    asset.value = assets.get(event.asset_id) ? assets.get(event.asset_id)! : asset.value
    existing.value = event.existing.map(loadPart)
    added.value = event.added.map(loadPart)
    removed.value = event.removed.map(loadPart)
    if(event.info_updated&&(asset.value?.prev!=null)) {
        prevAsset.value = assets.get(asset.value?.prev) ? assets.get(asset.value?.prev)! : {}
    }
})

</script>
<template>
    <div class="background-and-border p-4">
        <h1 class="mb-4 text-4xl leading-8 md:leading-10">
          Start: {{ new Date(event.date_begin).toLocaleString() }}<br> End: {{ new Date(event.date_end    ).toLocaleString() }}
        </h1>
        <div class="md:grid-cols-3 grid">
            <div class="detail-row col-span-1">
                <p>Building:</p>
                <p>{{ asset.building }}</p>
                <p>Asset Type:</p>
                <p>{{ asset.asset_type }}</p>
                <p v-if="asset.chassis_type">Chassis Type</p>
                <p v-if="asset.chassis_type">
                {{ asset.chassis_type }}
                </p>
                <p v-if="asset.manufacturer">Manufacturer:</p>
                <p v-if="asset.manufacturer">
                {{ asset.manufacturer }}
                </p>
                <p v-if="asset.model">Model:</p>
                <p v-if="asset.model">{{ asset.model }}</p>
                <p v-if="asset.serial">Serial:</p>
                <p v-if="asset.serial">{{ asset.serial }}</p>
                <p v-if="asset.live != undefined">Status:</p>
                <p v-if="asset.live">Live</p>
                <p v-else-if="asset.live != undefined">Inactive</p>
                <p v-if="asset.rails != undefined">Rails:</p>
                <p v-if="asset.rails">Yes</p>
                <p v-else-if="asset.rails != undefined">No</p>
                <p v-if="asset.bay">Bay:</p>
                <p v-if="asset.bay">{{ asset.bay }}</p>
                <p v-if="asset.power_port">Power Port:</p>
                <p v-if="asset.power_port">{{ asset.power_port }}</p>
                <p v-if="asset.public_port">Public Port:</p>
                <p v-if="asset.public_port">{{ asset.public_port }}</p>
                <p v-if="asset.private_port">Private Port:</p>
                <p v-if="asset.private_port">
                {{ asset.private_port }}
                </p>
                <p v-if="asset.ipmi_port">IPMI Port:</p>
                <p v-if="asset.ipmi_port">{{ asset.ipmi_port }}</p>
            </div>
            <div v-if="event.info_updated">
                <p>Building:</p>
                <p>{{ prevAsset.building }}</p>
                <p>Asset Type:</p>
                <p>{{ prevAsset.asset_type }}</p>
                <p v-if="prevAsset.chassis_type">Chassis Type</p>
                <p v-if="prevAsset.chassis_type">
                {{ prevAsset.chassis_type }}
                </p>
                <p v-if="prevAsset.manufacturer">Manufacturer:</p>
                <p v-if="prevAsset.manufacturer">
                {{ prevAsset.manufacturer }}
                </p>
                <p v-if="prevAsset.model">Model:</p>
                <p v-if="prevAsset.model">{{ prevAsset.model }}</p>
                <p v-if="prevAsset.serial">Serial:</p>
                <p v-if="prevAsset.serial">{{ prevAsset.serial }}</p>
                <p v-if="prevAsset.live != undefined">Status:</p>
                <p v-if="prevAsset.live">Live</p>
                <p v-else-if="prevAsset.live != undefined">Inactive</p>
                <p v-if="prevAsset.rails != undefined">Rails:</p>
                <p v-if="prevAsset.rails">Yes</p>
                <p v-else-if="prevAsset.rails != undefined">No</p>
                <p v-if="prevAsset.bay">Bay:</p>
                <p v-if="prevAsset.bay">{{ prevAsset.bay }}</p>
                <p v-if="prevAsset.power_port">Power Port:</p>
                <p v-if="prevAsset.power_port">{{ prevAsset.power_port }}</p>
                <p v-if="prevAsset.public_port">Public Port:</p>
                <p v-if="prevAsset.public_port">{{ prevAsset.public_port }}</p>
                <p v-if="prevAsset.private_port">Private Port:</p>
                <p v-if="prevAsset.private_port">
                {{ prevAsset.private_port }}
                </p>
                <p v-if="prevAsset.ipmi_port">IPMI Port:</p>
                <p v-if="prevAsset.ipmi_port">{{ asset.ipmi_port }}</p>
            </div>
            <div></div>
            <div></div>
        </div>
    </div>
</template>
