<script setup lang="ts">
import { AssetSchema } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
interface Props {
  item: AssetSchema;
  plus?: boolean;
  minus?: boolean;
}

const { item } = defineProps<Props>();
</script>

<template>
  <div class="group relative col-span-4 my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-3 rounded-lg p-1 text-center leading-8 md:grid-cols-4 md:p-2 md:leading-10"
    >
      <div class="hidden md:flex">
        <!-- Plus -->
        <svg
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-if="plus"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
          />
        </svg>
        <!-- Minus -->
        <svg
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-red-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-else-if="minus"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
          />
        </svg>
        <svg
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        ></svg>
        <p>{{ item.asset_tag }}</p>
      </div>
      <p class="break-words">{{ item.manufacturer }}</p>
      <p class="break-words">{{ item.asset_type }}</p>
    </div>
    <div
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    >

    </div>
  </div>
</template>
