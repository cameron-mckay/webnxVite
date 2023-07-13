<script setup lang="ts">
import { LoadedCartItem } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';

interface Props {
  item: LoadedCartItem;
  hideButtons?: boolean;
  untracked?: boolean;
}
const { item, hideButtons, untracked } = defineProps<Props>();
const emit = defineEmits(['plus', 'minus', 'delete']);
</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid p-1 text-center leading-8 grid-cols-4 md:p-2 md:leading-10"
    >
      <p>{{ item.part.nxid }}</p>
      <p class="break-words">{{ item.part.manufacturer }}</p>
      <p class="break-words">{{ item.part.name }}</p>
      <input
        class="textbox pl-2"
        v-if="untracked && item.part.serialized"
        required
        v-model="item.serial"
        type="text"
        placeholder="Serial"
      />
      <p class="break-words" v-else-if="item.part.serialized || item.serial">
        {{ item.serial }}
      </p>
      <p class="break-words" v-else>{{ item.quantity }}</p>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
