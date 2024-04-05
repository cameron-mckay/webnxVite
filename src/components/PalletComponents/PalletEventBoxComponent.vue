<script setup lang="ts">
import { BoxSchema } from '../../plugins/interfaces';
import SVGRoundMinus from '../GenericComponents/SVG/SVGRoundMinus.vue';
import SVGRoundPlus from '../GenericComponents/SVG/SVGRoundPlus.vue';
interface Props {
  box: BoxSchema;
  plus?: boolean;
  minus?: boolean;
}

const { box } = defineProps<Props>();
</script>

<template>
  <div class="group relative col-span-4 my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-2 md:grid-cols-3 rounded-md p-1 text-center leading-8 md:p-2 md:leading-10 group-hover:rounded-bl-md"
    >
      <div class="flex">
        <!-- Plus -->
        <SVGRoundPlus
          class="my-auto h-8 w-8 shrink-0 p-2 text-green-500 shadow-none mx-1 md:h-10 md:w-10"
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
        <p>{{ box.box_tag }}</p>
      </div>
      <p class="break-words hidden md:block">{{ box.building}}</p>
      <p class="break-words">{{ box.location }}</p>
    </div>
  </div>
</template>
