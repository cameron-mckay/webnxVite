<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { PartRecord, User } from '../../plugins/interfaces';
import EyeButton from '../GenericComponents/Buttons/EyeButton.vue';

interface Props {
  record: PartRecord;
  users: User[];
  view?: boolean;
  quantity?: number;
}

const { record, users, view } = defineProps<Props>();

let by = ref({ first_name: '', last_name: '' } as User);
let owner = ref({ first_name: '', last_name: '' } as User);
let date = new Date(Date.parse(record.date_created!));

onMounted(() => {
  by.value = users.find((e) => e._id === record.by)!;
  owner.value = users.find((e) => e._id === record.owner)!;
});
</script>
<template>
  <div class="group relative my-1">
    <div
      class="background-and-border group-hover:bab-hover grid grid-cols-5 p-1 text-center leading-8 md:grid-cols-6 md:p-2 md:leading-10"
      v-bind:class="{ 'group-hover:rounded-md': quantity }"
    >
      <p class="break-words">{{ record.building }}</p>
      <p class="break-words">{{ record.location }}</p>
      <p class="col-span-2" v-if="owner">
        {{ `${owner?.first_name} ${owner?.last_name}` }}
      </p>
      <p class="col-span-2" v-else-if="record.asset_tag">
        {{ record.asset_tag }}
      </p>
      <p class="col-span-2" v-else-if="record.pallet_tag">
        {{ record.pallet_tag }}
      </p>
      <p class="col-span-2" v-else-if="record.box_tag">
        {{ record.box_tag }}
      </p>
      <p class="col-span-2 break-words" v-else></p>
      <p class="hidden break-words md:block" v-if="quantity">
        {{ quantity }}
      </p>
      <p class="hidden break-words md:block" v-else>
        {{ `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}` }}
      </p>
      <div class="my-auto flex justify-end">
        <!-- Eyeball -->
        <EyeButton
          v-if="view === true"
          v-on:click="$emit('viewPartAction', record, quantity)"
        />
      </div>
    </div>
    <div
      class="group-hover:bab-drop-hover bab-drop"
      v-if="quantity == undefined"
    >
      <p class="block">
        {{ `Date Updated: ${date.toLocaleString()}` }}
      </p>
      <p>{{ `ID: ${record._id}` }}</p>
      <p v-if="record.prev != null">{{ `Previous: ${record.prev}` }}</p>
      <p v-if="record.next != null">{{ `Next: ${record.next}` }}</p>
      <p v-if="record.serial">{{ `Serial#: ${record.serial}` }}</p>
      <p>{{ `By: ${by.first_name} ${by.last_name}` }}</p>
    </div>
  </div>
</template>
