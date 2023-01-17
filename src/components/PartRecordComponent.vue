<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { PartRecord, User } from '../plugins/interfaces';


interface Props {
    record: PartRecord,
    users: User[],
    view?: boolean
}

const { record, users, view } = defineProps<Props>()

let by = ref({ first_name: "", last_name: "" } as User)
let owner = ref({ first_name: "", last_name: "" } as User)
let date = new Date(Date.parse(record.date_created!))

onMounted(() => {
    setTimeout(() => {
        by.value = users.find(e => e._id === record.by)!
        owner.value = users.find(e => e._id === record.owner)!
    }, 500)
})

</script>
<template>
    <div class="group my-1">
        <div class="grid md:grid-cols-6 grid-cols-5 relative leading-10 text-center group-hover:bg-zinc-400 p-2 rounded-lg group-hover:rounded-bl-none">
            <p class="break-words">{{ record.building }}</p>
            <p class="break-words">{{ record.location }}</p>
            <p class="col-span-2" v-if="owner">{{ `${owner?.first_name} ${owner?.last_name}` }}</p>
            <p class="col-span-2" v-else-if="record.asset_tag">{{ record.asset_tag }}</p>
            <p class="break-words col-span-2" v-else></p>
            <p class="break-words hidden md:block">{{ `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
            }}</p>
            <img v-if="(view === true)"
                class="h-10 w-10 p-2 m-1 bg-zinc-400 hover:bg-green-500 shadow-lg rounded-lg transition"
                src="../assets/eye-solid.svg" v-on:click="$emit('viewPartAction', record._id)">
        </div>
        <div class="hidden h-0 absolute group-hover:h-auto group-hover:block rounded-b-lg group-hover:bg-zinc-400 p-2 z-30 group-hover:shadow-lg">
            <p class="block md:hidden">{{ `Date Created: ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
            }}</p>
            <p>{{ `ID: ${record._id}` }}</p>
            <p v-if="record.prev != null">{{ `Previous: ${record.prev}` }}</p>
            <p v-if="record.next != null">{{ `Next: ${record.next}` }}</p>
            <p v-if="record.serial">{{ `Serial#: ${record.serial}` }}</p>
            <p>{{ `By: ${by.first_name} ${by.last_name}` }}</p>
        </div>
    </div>
</template>
