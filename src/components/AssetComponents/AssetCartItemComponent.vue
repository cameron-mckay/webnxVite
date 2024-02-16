<script setup lang="ts">
import { AssetPart } from '../../plugins/interfaces';
import InlinePartSpecComponent from '../PartComponents/InlinePartSpecComponent.vue';
import XButton from '../GenericComponents/Buttons/XButton.vue';
import MinusButton from '../GenericComponents/Buttons/MinusButton.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
import { ref, watch } from 'vue';
interface Props {
  item: AssetPart;
  maxQuantity?: number;
  hideButtons?: boolean;
  untracked?: boolean;
}
const { item, maxQuantity, hideButtons, untracked } = defineProps<Props>();
const emit = defineEmits(['movePart']);
let quantityVisible = ref(item.quantity ? item.quantity : 0)
// let serial = ref(item.serial?item.serial:"")

function updateQuantity() {
  if(maxQuantity&&quantityVisible.value!>maxQuantity)
    quantityVisible.value = maxQuantity
  if(quantityVisible.value!<0)
    quantityVisible.value = 0
  emit('movePart', item.part, quantityVisible.value!-item.quantity!)
}

// Watch for changes in props
watch(()=>item.quantity, ()=>{
  if(item.quantity) {
    // Update visible and invisble quantities to match
    quantityVisible.value = item.quantity
  }
})

</script>

<template>
  <div class="group relative my-1">
    <div
      class="group-hover:bab-hover background-and-border grid grid-cols-4 p-1 text-center leading-8 md:grid-cols-5 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ item.part.nxid }}</p>
      <p class="break-words">{{ item.part.manufacturer }}</p>
      <p class="break-words">{{ item.part.name }}</p>
      <p class="break-words" v-if="item.serial">
        {{ item.serial }}
      </p>
      <div class="flex justify-center" v-else-if="!hideButtons">
        <input
          class="textbox pl-2 w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-right"
          required
          v-model="quantityVisible"
          type="number"
          min="0"
          step="1"
          v-on:focusout="updateQuantity"
        />
        <p class="break-words" v-if="!untracked">/ {{ maxQuantity }}</p>
      </div>
      <p class="break-words" v-else>{{ item.quantity }}</p>
      <div v-if="hideButtons != true" class="my-auto flex justify-end">
        <!-- Plus -->
        <PlusButton
          class="button-icon hover:button-icon-hover active:button-icon-active"
          v-if="!(item.serial)"
          v-on:click="$emit('movePart', item.part, 1, item.serial)"
        />
        <div v-else class="button-icon opacity-0"></div>
        <!-- Minus -->
        <MinusButton
          class="no-margin-on-mobile"
          v-if="!(item.serial)"
          v-on:click="$emit('movePart', item.part, -1, item.serial)"
        />
        <div v-else class="button-icon opacity-0"></div>
        <!-- X icon -->
        <XButton
          v-on:click="$emit('movePart', item.part, item.quantity ? item.quantity * -1 : -1, item.serial)"
        />
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop relative"
      :part="item.part"
    />
  </div>
</template>
