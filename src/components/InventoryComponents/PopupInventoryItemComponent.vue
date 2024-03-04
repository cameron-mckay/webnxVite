<script setup lang="ts">
import { LoadedCartItem } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import SingleArrowDownButton from '../GenericComponents/Buttons/SingleArrowDownButton.vue';
import DoubleArrowDownButton from '../GenericComponents/Buttons/DoubleArrowDownButton.vue';
interface Props {
  item: LoadedCartItem;
}
const { item } = defineProps<Props>();
let emit = defineEmits(['movePart'])
</script>
<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-8 md:grid-cols-6 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ item.part.nxid }}</p>
      <p class="break-words">{{ item.part.manufacturer }}</p>
      <p class="break-words">{{ item.part.name }}</p>
      <p class="hidden break-words md:block">
        {{
          `${item.part.rack_num ? item.part.rack_num : ''}${
            item.part.shelf_location ? item.part.shelf_location : ''
          }`
        }}
      </p>
      <p class="break-words" v-if="item.part.serialized&&item.serial">
        {{ item.serial }}
      </p>
      <p class="break-words" v-else>{{ item.quantity }}</p>
      <div class="flex justify-end">
        <!-- Single arrow down -->
        <SingleArrowDownButton
          v-on:click="$emit('movePart', item.part, -1, item.serial)"
        />
        <!-- Double arrow down -->
        <DoubleArrowDownButton
          v-if="item.quantity && item.quantity > 1"
          v-on:click="$emit('movePart', item.part, item.quantity ? item.quantity * -1 : -1, item.serial)"
        />
        <div v-else class="button-icon opacity-0"></div>
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
