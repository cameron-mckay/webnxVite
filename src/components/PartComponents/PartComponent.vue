<script setup lang="ts">
import { PartSchema } from '../../plugins/interfaces';
import InlinePartSpecComponent from './InlinePartSpecComponent.vue';
import InfoIcon from '../GenericComponents/InfoIcon.vue';
import PencilButton from '../GenericComponents/Buttons/PencilButton.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';
import SVGEye from '../GenericComponents/SVG/SVGEye.vue';
interface Props {
  part: PartSchema;
  edit?: boolean;
  add?: boolean;
  view?: boolean;
  showAudit?:boolean;
}

const { part, showAudit } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="background-and-border group-hover:bab-hover grid grid-cols-4 p-1 text-center leading-8 md:grid-cols-6 md:p-2 md:leading-10"
    >
      <p class="hidden md:block">{{ part.nxid }}</p>
      <p class="break-words">{{ part.manufacturer }}</p>
      <p class="break-words">{{ part.name }}</p>
      <p class="hidden break-words md:block">
        {{
          `${part.rack_num ? part.rack_num : ''}${
            part.shelf_location ? part.shelf_location : ''
          }`
        }}
      </p>
      <div class="flex justify-between">
        <InfoIcon class="opacity-0 pointer-events-none" v-if="part.notes" :title="part.notes"/>
        <p class="mx-auto my-auto">{{ part.quantity + '/' + part.total_quantity }}</p>
        <InfoIcon v-if="part.notes" :title="part.notes"
            v-on:click="$emit('viewPartAction')"
        />
      </div>
      <div class="my-auto flex justify-end">
        <!-- Pencil -->
        <PencilButton
          v-if="edit === true"
          v-on:click="$emit('editPartAction')"
        />
        <!-- Plus -->
        <PlusButton
          v-if="add === true"
          v-on:click="$emit('addPartAction')"
          :class="{ noMarginOnMobile: edit }"
        />
        <!-- Eyeball -->
        <RouterLink :to="'/parts/view?nxid='+part.nxid" title="View part"
            class="button-icon hover:button-icon-hover active:button-icon-active hover:button-icon-hover active:button-icon-active"
            :class="{ hideViewOnMobile: edit }"
            v-if="view === true"
        >
          <SVGEye
            v-on:click="$emit('viewPartAction')"
          />
        </RouterLink>
      </div>
    </div>
    <InlinePartSpecComponent
      :show-audit="showAudit"
      class="group-hover:bab-drop-hover bab-drop"
      :part="part"
    />
    <div></div>
  </div>
</template>
