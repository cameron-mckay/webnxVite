<script setup lang="ts">
import { PartSchema } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
interface Props {
  part: PartSchema;
}

const { part } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 rounded-lg p-1 text-center leading-8 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ part.nxid }}</p>
      <p class="break-words">{{ part.manufacturer }}</p>
      <p class="break-words">{{ part.name }}</p>
      <div class="my-auto flex justify-end">
        <!-- Plus -->
        <svg
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-on:click="$emit('addPartAction')"
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
      :part="part"
    />
  </div>
</template>
