<script setup lang="ts">
import { LoadedCartItem } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
import DoubleArrowDownButton from '../GenericComponents/Buttons/DoubleArrowDownButton.vue';
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
        <PlusButton @click="$emit('plus')"/>
        <div v-if="item.serial" class="button-icon opacity-0"></div>
        <DoubleArrowDownButton v-else @click="$emit('addAll')"/>
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
