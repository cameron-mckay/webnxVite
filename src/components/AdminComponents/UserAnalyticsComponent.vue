<script setup lang="ts">
import { User } from '../../plugins/interfaces';
import RightCaretButton from '../GenericComponents/Buttons/RightCaretButton.vue';
interface Props {
  user: User;
  assetsUpdated: number;
  newAssets: number;
  palletsUpdated: number;
  newPallets: number;
  checkins: number;
  checkouts: number;
}
const { newPallets, palletsUpdated, user, assetsUpdated, newAssets, checkins, checkouts } = defineProps<Props>();
</script>
<template>
  <div class="group relative p-0">
    <div
      class="background-and-border relative m-1 p-1 leading-8 hover:rounded-md md:p-2 md:leading-10"
    >
      <h1 class="text-2xl leading-8 md:leading-10 p-2">
        {{ `${user.first_name} ${user.last_name}` }}
      </h1>
      <div class="flex justify-between my-2 rounded-md hover:shadow-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition p-2 md:delay-300">
        <p>{{ checkouts }} checkouts</p>
        <RightCaretButton @click="$emit('checkouts')"/>
      </div>
      <div class="flex justify-between my-2 rounded-md hover:shadow-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition p-2 md:delay-300">
        <p>{{ checkins }} checkins</p>
        <RightCaretButton @click="$emit('checkins')"/>
      </div>
      <div class="flex justify-between my-2 rounded-md hover:shadow-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition p-2 md:delay-300">
        <p>{{ assetsUpdated }} assets updated</p>
        <RightCaretButton @click="$emit('assetsUpdated')"/>
      </div>
      <div class="flex justify-between my-2 rounded-md hover:shadow-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition p-2 md:delay-300">
        <p>{{ newAssets }} new assets tracked</p>
        <RightCaretButton @click="$emit('newAssets')"/>
      </div>
      <div class="flex justify-between my-2 rounded-md hover:shadow-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition p-2 md:delay-300">
        <p>{{ palletsUpdated }} pallets updated</p>
        <RightCaretButton @click="$emit('palletsUpdated')"/>
      </div>
      <div class="flex justify-between my-2 rounded-md hover:shadow-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition p-2 md:delay-300">
        <p>{{ newPallets }} new pallets tracked</p>
        <RightCaretButton @click="$emit('newPallets')"/>
      </div>
    </div>
  </div>
</template>
