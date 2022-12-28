<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import PartRecordComponent from '../../components/PartRecordComponent.vue';
import { getPartByID, getPartHistoryByID } from '../../plugins/dbCommands/partManager';
import { getUserByID } from '../../plugins/dbCommands/userManager';
import type { PartRecord, PartSchema, User, UserState } from '../../plugins/interfaces';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

let part = ref({} as PartSchema)
let partRecords = ref([] as PartRecord[])
let users = ref([{ _id: 'all', first_name: 'All', last_name: 'Techs' }] as User[])

onBeforeMount(() => {
    if (router.currentRoute.value.query.id) {
        let nxid = router.currentRoute.value.query.nxid as string
        let id = router.currentRoute.value.query.id as string
        getPartByID(http, nxid, 3, "Parts Room", (res, err) => {
            if (err) {
                errorHandler(err)
            }
            part.value = res as PartSchema
        })
        getPartHistoryByID(http, id, async (res, err) => {
            if (err) {
                errorHandler(err)
            }
            partRecords.value = res as PartRecord[]
            for (const record of res as PartRecord[]) {
                // IF USER IS NOT IN ARRAY, FIND AND ADD TO ARRAy
                if (record.owner && record.owner != 'all' && users.value.find(e => e._id == record.owner) === undefined) {
                    await getUserByID(http, record.owner, (res, err) => {
                        if (err) {
                            errorHandler(err)
                        }
                        users.value.push(res as User)
                    })
                }
                // IF USER IS NOT IN ARRAY, FIND AND ADD TO ARRAy
                if (record.by && users.value.find(e => e._id == record.by) === undefined) {
                    await getUserByID(http, record.by, (res, err) => {
                        if (err) {
                            errorHandler(err)
                        }
                        users.value.push(res as User)
                    })
                }
            }
        })
    }
})

function viewHistory(id: string) {
    router.push({ name: 'Part History', query: { id } })
}
</script>
<template>
    <div>
        <div class="grid grid-cols-4">
            <h1 class="text-4xl mb-4 inline-block col-span-4">{{ `${part.manufacturer} ${part.name}` }}</h1>
            <p class="font-bold my-2">NXID:</p>
            <p class="my-2 col-span-3">{{ part.nxid }}</p>
            <p class="font-bold my-2">Shelf Location:</p>
            <p class="my-2 col-span-3">{{ part.shelf_location }}</p>
            <p class="font-bold my-2">Parts Room Quantity:</p>
            <p class="my-2 col-span-3">{{ part.quantity }}</p>
            <p class="font-bold my-2">Total Quantity:</p>
            <p class="my-2 col-span-3">{{ part.total_quantity }}</p>
            <p class="font-bold my-2">Type:</p>
            <p class="my-2 col-span-3">{{ part.type }}</p>
            <div class="col-span-4 grid grid-cols-4" v-if="part.type == 'Motherboard'">
                <p class="font-bold my-2">Chipset</p>
                <p class="my-2 col-span-3">{{ part.chipset }}</p>
            </div>
            <div v-if="part.type == 'CPU'" class="col-span-4 grid grid-cols-4">
                <p class="font-bold my-2">Chipset:</p>
                <p class="my-2 col-span-3">{{ part.chipset }}</p>
                <p class="font-bold my-2">Frequency: </p>
                <p class="my-2 col-span-3">{{ part.frequency + "GHz" }}</p>
            </div>
            <div v-if="part.type == 'Memory'" class="col-span-4 grid grid-cols-4">
                <p class="font-bold my-2">Frequency: </p>
                <p class="my-2 col-span-3">{{ part.frequency + "MHz" }}</p>
                <p class="font-bold my-2">Capacity: </p>
                <p class="my-2 col-span-3">{{ part.capacity + "GB" }}</p>
                <p class="font-bold my-2">Memory Type:</p>
                <p class="my-2 col-span-3">{{ part.memory_type }}</p>
            </div>
            <div v-if="part.type == 'Peripheral Card'" class="col-span-4 grid grid-cols-4">
                <p class="font-bold my-2">Card Type: </p>
                <p class="my-2 col-span-3">{{ part.peripheral_type }}</p>
                <p class="font-bold my-2">Port Type: </p>
                <p class="my-2 col-span-3">{{ part.port_type }}</p>
            </div>
            <div v-if="part.type == 'Storage'" class="col-span-4 grid grid-cols-4">
                <p class="font-bold my-2">Interface:</p>
                <p class="my-2 col-span-3">{{ part.storage_interface }}</p>
                <p class="font-bold my-2">Capacity: </p>
                <p class="my-2 col-span-3">{{ `${part.capacity}${part.capacity_unit}` }}</p>
                <div v-if="part.storage_interface == 'NVME'" class="col-span-4 grid grid-cols-4">
                    <p class="font-bold my-2">Connector:</p>
                    <p class="my-2 col-span-3">{{ part.port_type }}</p>
                </div>
            </div>
            <div v-if="part.type == 'GPU'">
                <!-- Placeholder -->
            </div>
            <div v-if="part.type == 'Cable'" class="col-span-4 grid grid-cols-4">
                <p class="font-bold my-2">End 1:</p>
                <p class="my-2 col-span-3">{{ part.cable_end1 }}</p>
                <p class="font-bold my-2">End 2:</p>
                <p class="my-2 col-span-3">{{ part.cable_end2 }}</p>
            </div>
            <div v-if="part.type == 'Backplane'" class="col-span-4 grid grid-cols-4">
                <p class="font-bold my-2">Interface:</p>
                <p class="my-2 col-span-3">{{ part.storage_interface }}</p>
                <p class="font-bold my-2">Ports: </p>
                <p class="my-2 col-span-3">{{ part.port_type }}</p>
            </div>
            <div v-if="part.type == 'Misc.'">
                <!-- Placeholder -->
            </div>
        </div>
        <!-- PART RECORDS GO HERE -->
        <div v-if="partRecords.length > 0"
            class="grid md:grid-cols-6 grid-cols-5 relative leading-10 text-center p-2 rounded-xl transition font-bold my-2">
            <p>Building</p>
            <p>Location</p>
            <p class="col-span-2">Owner</p>
            <p class="hidden md:block">Date Created</p>
            <p></p>
        </div>
        <PartRecordComponent v-for="record in partRecords" :users="users" :record="record" />
    </div>
</template>
