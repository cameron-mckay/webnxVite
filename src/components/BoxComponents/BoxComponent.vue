<script setup lang="ts">
import { BoxSchema } from '../../plugins/interfaces';
import SVGEye from '../GenericComponents/SVG/SVGEye.vue';
import SVGPencil from '../GenericComponents/SVG/SVGPencil.vue';
import PlusButton from '../GenericComponents/Buttons/PlusButton.vue';

interface Props {
  box: BoxSchema;
  edit?: boolean;
  add?: boolean;
  view?: boolean;
}

const { box, edit, add, view } = defineProps<Props>();
</script>

<template>
  <div class="group relative my-1">
    <div
      class="background-and-border group-hover:bab-hover grid grid-cols-4 p-1 text-center leading-8 group-hover:rounded-bl-none md:p-2 md:leading-10"
    >
      <p>{{ box.box_tag }}</p>
      <p class="break-words">{{ box.building }}</p>
      <p class="break-words">{{ box.location }}</p>
      <div class="my-auto flex justify-end">
        <!-- Pencil -->
        <RouterLink :to="'/boxes/edit?box_tag='+box.box_tag"
          class="button-icon hover:button-icon-hover active:button-icon-active"
          title="Edit box"
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
        <RouterLink :to="'/boxes/view?box_tag='+box.box_tag"
          v-if="view === true"
          title="View Box"
          class="button-icon hover:button-icon-hover active:button-icon-active"
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
          new Date(box.date_created).toLocaleString()
        }}
      </p>
      <pre class="font-extrabold notes-with-links whitespace-pre-wrap" v-if="box.notes">Notes:<br><span class="font-normal">{{ box.notes }}</span></pre>
    </div>
  </div>
</template>
