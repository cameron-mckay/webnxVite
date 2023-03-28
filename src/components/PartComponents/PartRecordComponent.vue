<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { PartRecord, User } from '../../plugins/interfaces';

interface Props {
  record: PartRecord;
  users: User[];
  view?: boolean;
}

const { record, users, view } = defineProps<Props>();

let by = ref({ first_name: '', last_name: '' } as User);
let owner = ref({ first_name: '', last_name: '' } as User);
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
      class="background-and-border group-hover:bab-hover grid grid-cols-5 p-1 text-center leading-8 md:grid-cols-6 md:p-2 md:leading-10"
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
      <div class="my-auto flex justify-end">
        <!-- Eyeball -->
        <svg
          v-if="view === true"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="$emit('viewPartAction', record._id)"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 576 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM432 256c0 79.5-64.5 144-144 144s-144-64.5-144-144s64.5-144 144-144s144 64.5 144 144zM288 192c0 35.3-28.7 64-64 64c-11.5 0-22.3-3-31.6-8.4c-.2 2.8-.4 5.5-.4 8.4c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-2.8 0-5.6 .1-8.4 .4c5.3 9.3 8.4 20.1 8.4 31.6z"
          />
        </svg>
      </div>
    </div>
    <div class="group-hover:bab-drop-hover bab-drop">
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
