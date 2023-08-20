<script setup lang="ts">
import { PartSchema } from '../../plugins/interfaces';
import InlinePartSpecComponent from './InlinePartSpecComponent.vue';
import InfoIcon from '../GenericComponents/InfoIcon.vue';
interface Props {
  part: PartSchema;
  edit?: boolean;
  add?: boolean;
  view?: boolean;
}

const { part } = defineProps<Props>();
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
        <svg
          v-if="edit === true"
          v-on:click="$emit('editPartAction')"
          class="button-icon hover:button-icon-hover active:button-icon-active hover:button-icon-hover active:button-icon-active"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M421.7 220.3l-11.3 11.3-22.6 22.6-205 205c-6.6 6.6-14.8 11.5-23.8 14.1L30.8 511c-8.4 2.5-17.5 .2-23.7-6.1S-1.5 489.7 1 481.2L38.7 353.1c2.6-9 7.5-17.2 14.1-23.8l205-205 22.6-22.6 11.3-11.3 33.9 33.9 62.1 62.1 33.9 33.9zM96 353.9l-9.3 9.3c-.9 .9-1.6 2.1-2 3.4l-25.3 86 86-25.3c1.3-.4 2.5-1.1 3.4-2l9.3-9.3H112c-8.8 0-16-7.2-16-16V353.9zM453.3 19.3l39.4 39.4c25 25 25 65.5 0 90.5l-14.5 14.5-22.6 22.6-11.3 11.3-33.9-33.9-62.1-62.1L314.3 67.7l11.3-11.3 22.6-22.6 14.5-14.5c25-25 65.5-25 90.5 0z"
          />
        </svg>
        <!-- Plus -->
        <svg
          class="button-icon hover:button-icon-hover active:button-icon-active hover:button-icon-hover active:button-icon-active"
          v-if="add === true"
          v-on:click="$emit('addPartAction')"
          :class="{ noMarginOnMobile: edit }"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
        >
          <path
            fill="currentColor"
            stroke="currentColor"
            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
          />
        </svg>
        <!-- Eyeball -->
        <RouterLink :to="'/parts/view?nxid='+part.nxid" title="View part"
            class="button-icon hover:button-icon-hover active:button-icon-active hover:button-icon-hover active:button-icon-active"
            :class="{ hideViewOnMobile: edit }"
        >
          <svg
            v-if="view === true"
            v-on:click="$emit('viewPartAction')"
            v-on:auxclick="console.log('Test2')"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path
              fill="currentColor"
              stroke="currentColor"
              d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM432 256c0 79.5-64.5 144-144 144s-144-64.5-144-144s64.5-144 144-144s144 64.5 144 144zM288 192c0 35.3-28.7 64-64 64c-11.5 0-22.3-3-31.6-8.4c-.2 2.8-.4 5.5-.4 8.4c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-2.8 0-5.6 .1-8.4 .4c5.3 9.3 8.4 20.1 8.4 31.6z"
            />
          </svg>
        </RouterLink>
      </div>
    </div>
    <InlinePartSpecComponent
      class="group-hover:bab-drop-hover bab-drop"
      :part="part"
    />
    <div></div>
  </div>
</template>
