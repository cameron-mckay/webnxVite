<script setup lang="ts">
import { ref } from 'vue';
import UserButton from '../GenericComponents/Buttons/UserButton.vue'
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import FilterTag from '../GenericComponents/FilterTag.vue';
import type { User }from '../../plugins/interfaces'
import UserComponentNoRoles from './UserComponentNoRoles.vue';

interface Props {
  users: Map<string, User>;
  filterMap: Map<string, User>;
}

let { filterMap, users } = defineProps<Props>()

let filterVisible = ref(false)

function togglePopup() {
  filterVisible.value = !filterVisible.value
}
</script>
<template>
  <div>
    <!-- Button to be displayed inline -->
    <UserButton class="mt-auto md:mb-0 mb-2" :title="'Filter Users'" @click="togglePopup"/>
    <!-- Popup that covers the screen when button is pressed -->
    <FullScreenPopupComponent
      v-show="filterVisible"
      @toggle="togglePopup"
    >
      <!-- Component title -->
      <h1 class="my-auto text-4xl mb-2">Filter Users</h1>
      <!-- Filter tags -->
      <FilterTag class="mb-2" v-for="user of Array.from(filterMap.keys())" :name="filterMap.has(user) ? filterMap.get(user)!.email! : 'ERROR'" @remove="filterMap.delete(user)"/>
      <!-- User Section -->
      <div>
        <!-- Header for user list -->
        <div
          class="relative grid grid-cols-3 p-2 text-center text-sm font-bold leading-8 transition md:leading-10"
        >
          <p>Email</p>
          <p>Name</p>
          <p></p>
        </div>
        <!-- User objects -->
        <UserComponentNoRoles
          v-for="user of Array.from(users.values()).filter((u)=>!(u.roles?.includes('kiosk')||u.roles?.includes('sales')))" :user="user"
          :add="true"
          @add="filterMap.set(user._id!, user)"
        />
      </div>
    </FullScreenPopupComponent>
  </div>
</template>
