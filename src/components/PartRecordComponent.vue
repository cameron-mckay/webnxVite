<script setup lang="ts">
import { onMounted, ref } from "vue";
import { PartRecord, User } from "../plugins/interfaces";

interface Props {
  record: PartRecord;
  users: User[];
  view?: boolean;
}

const { record, users, view } = defineProps<Props>();

let by = ref({ first_name: "", last_name: "" } as User);
let owner = ref({ first_name: "", last_name: "" } as User);
let date = new Date(Date.parse(record.date_created!));

onMounted(() => {
  setTimeout(() => {
    by.value = users.find((e) => e._id === record.by)!;
    owner.value = users.find((e) => e._id === record.owner)!;
  }, 500);
});
</script>
<template>
  <div class="group relative my-1">
    <div
      class="background-and-border group-hover:bab-hover grid grid-cols-5 p-2 text-center leading-10 md:grid-cols-6"
    >
      <p class="break-words">{{ record.building }}</p>
      <p class="break-words">{{ record.location }}</p>
      <p class="col-span-2" v-if="owner">
        {{ `${owner?.first_name} ${owner?.last_name}` }}
      </p>
      <p class="col-span-2" v-else-if="record.asset_tag">
        {{ record.asset_tag }}
      </p>
      <p class="col-span-2 break-words" v-else></p>
      <p class="hidden break-words md:block">
        {{ `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}` }}
      </p>
      <div class="flex justify-end">
        <img
          v-if="view === true"
          class="m-1 h-10 w-10 rounded-lg bg-zinc-400 p-2 shadow-lg transition hover:bg-green-500"
          src="../assets/eye-solid.svg"
          v-on:click="$emit('viewPartAction', record._id)"
        />
      </div>
    </div>
    <div class="group-hover:bab-drop-hover hidden">
      <p class="block md:hidden">
        {{
          `Date Created: ${
            date.getMonth() + 1
          }/${date.getDate()}/${date.getFullYear()}`
        }}
      </p>
      <p>{{ `ID: ${record._id}` }}</p>
      <p v-if="record.prev != null">{{ `Previous: ${record.prev}` }}</p>
      <p v-if="record.next != null">{{ `Next: ${record.next}` }}</p>
      <p v-if="record.serial">{{ `Serial#: ${record.serial}` }}</p>
      <p>{{ `By: ${by.first_name} ${by.last_name}` }}</p>
    </div>
  </div>
</template>
