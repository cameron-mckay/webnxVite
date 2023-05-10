<script setup lang="ts">
import { LoadedCartItem } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
interface Props {
  item: LoadedCartItem;
}
const { item } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-8 md:grid-cols-5 md:p-2 md:leading-10"
    >
      <p class="hidden break-words md:block">{{ item.part.nxid }}</p>
      <p class="break-words">{{ item.part.manufacturer }}</p>
      <p class="break-words">{{ item.part.name }}</p>
      <p class="break-words" v-if="item.serial">{{ item.serial }}</p>
      <p class="break-words" v-else>{{ item.quantity }}</p>
      <div class="flex justify-end">
        <!-- Plus -->
        <svg
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="$emit('plus')"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
          />
        </svg>
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
