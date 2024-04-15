<script setup lang="ts">
import { PalletSchema } from '../../plugins/interfaces';
import SVGEye from '../GenericComponents/SVG/SVGEye.vue';
import SVGPencil from '../GenericComponents/SVG/SVGPencil.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';

interface Props {
  pallet: PalletSchema;
  edit?: boolean;
  add?: boolean;
  view?: boolean;
}

const { pallet, edit, add, view } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="background-and-border group-hover:bab-hover grid grid-cols-4 p-1 text-center leading-8 group-hover:rounded-bl-none md:p-2 md:leading-10"
    >
      <p>{{ pallet.pallet_tag }}</p>
      <p class="break-words">{{ pallet.building }}</p>
      <p class="break-words">{{ pallet.location }}</p>
      <div class="my-auto flex justify-end">
        <!-- Pencil -->
        <RouterLink :to="'/pallets/edit?pallet_tag='+pallet.pallet_tag"
            class="button-icon hover:button-icon-hover active:button-icon-active"
            title="Edit pallet"
            v-if="edit === true"
        >
          <SVGPencil
            v-on:click="$emit('editAction')"
          />
        </RouterLink>
        <!-- Plus -->
        <PlusButton
          v-if="add === true"
          v-on:click="$emit('addAction')"
        />
        <!-- Eyeball -->
        <RouterLink :to="'/pallets/view?pallet_tag='+pallet.pallet_tag"
            title="View Pallet"
            class="button-icon hover:button-icon-hover active:button-icon-active"
            v-if="view === true"
        >
          <SVGEye
            v-on:click="$emit('viewAction')"
          />
        </RouterLink>
      </div>
    </div>
    <div class="group-hover:bab-drop-hover bab-drop">
      <p>
        {{
          'Date Updated: ' +
          new Date(pallet.date_created).toLocaleString()
        }}
      </p>
      <pre class="font-extrabold whitespace-pre-wrap notes-with-links" v-if="pallet.notes">Notes:<br><span class="font-normal">{{ pallet.notes }}</span></pre>
    </div>
  </div>
</template>
