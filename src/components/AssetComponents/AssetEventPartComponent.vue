<script setup lang="ts">
import { LoadedCartItem } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import SVGRoundPlus from '../GenericComponents/SVG/SVGRoundPlus.vue';
import SVGRoundMinus from '../GenericComponents/SVG/SVGRoundMinus.vue';
interface Props {
  item: LoadedCartItem;
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
        <SVGRoundPlus
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-if="plus"
        />
        <!-- Minus -->
        <SVGRoundMinus
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-red-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-else-if="minus"
        />
        <div
          class="mx-0.5 my-auto h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:h-10 md:w-10"
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        ></div>
        <p>{{ item.part.nxid }}</p>
      </div>
      <div class="flex justify-start md:justify-center">
        <SVGRoundPlus
          class="mx-0.5 my-auto block h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:hidden md:h-10 md:w-10"
          v-if="plus"
        />
        <!-- Minus -->
        <SVGRoundMinus
          class="mx-0.5 my-auto block h-8 w-8 shrink-0 p-2 text-red-500 shadow-none md:mx-1 md:hidden md:h-10 md:w-10"
          v-else-if="minus"
        />
        <div
          class="mx-0.5 my-auto block h-8 w-8 shrink-0 p-2 text-green-500 shadow-none md:mx-1 md:hidden md:h-10 md:w-10"
          v-else
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        ></div>
        <p class="break-words">{{ item.part.manufacturer }}</p>
      </div>
      <p class="break-words">{{ item.part.name }}</p>
      <p v-if="item.serial" class="break-words">{{ item.serial }}</p>
      <p v-else class="break-words">{{ item.quantity }}</p>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
