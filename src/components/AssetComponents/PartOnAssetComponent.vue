<script setup lang="ts">
import { PartSchema } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
interface Props {
  part: PartSchema;
  showQuantity?: boolean
}

const { part, showQuantity } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      v-if="showQuantity"
      class="group-hover:bab-hover background-and-border grid grid-cols-5 rounded-md p-1 text-center leading-8 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ part.nxid }}</p>
      <p class="break-words">{{ part.manufacturer }}</p>
      <p class="break-words">{{ part.name }}</p>
      <p class="break-words">{{ part.quantity }}/{{ part.total_quantity }}</p>
      <div class="my-auto flex justify-end">
        <!-- Plus -->
        <PlusButton
          v-on:click="$emit('addPartAction')"
        />
      </div>
    </div>
    <div
      v-else
      class="group-hover:bab-hover background-and-border grid grid-cols-4 rounded-md p-1 text-center leading-8 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ part.nxid }}</p>
      <p class="break-words">{{ part.manufacturer }}</p>
      <p class="break-words">{{ part.name }}</p>
      <div class="my-auto flex justify-end">
        <!-- Plus -->
        <PlusButton
          v-on:click="$emit('addPartAction')"
        />
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="part"
    />
  </div>
</template>
