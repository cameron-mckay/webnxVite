<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import SearchComponent from '../../components/PartComponents/PartSearchComponent.vue';
import { updatePart } from '../../plugins/dbCommands/partManager';
import type { PartSchema, UserState } from '../../plugins/interfaces';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
let editPart = ref(false);

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS
let currentPart: Ref<PartSchema> = ref({});

function toggleEdit(part: PartSchema) {
  currentPart.value = part;
  if (editPart.value) {
    editPart.value = false;
  } else {
    currentPart.value = part;
    editPart.value = true;
  }
}

function update(part: PartSchema) {
  updatePart(http, part, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    displayMessage(data as string);
    currentPart.value = {};
    editPart.value = false;
  });
}
</script>
<template>
  <div>
    <SearchComponent
      :edit="true"
      :http="http"
      :imgUrl="'/assets/pencil-solid.svg'"
      :errorHandler="errorHandler"
      :location="'Parts Room'"
      :displayMessage="displayMessage"
      @partAction="toggleEdit"
      :router="router"
      :building="store.state.user.building ? store.state.user.building : 3"
    />
    <div
      v-if="editPart"
      class="absolute top-0 left-0 z-40 h-full w-full bg-zinc-700 opacity-50"
      @click="toggleEdit"
    ></div>
    <div
      v-if="editPart"
      class="pointer-events-none absolute top-0 left-0 z-50 h-full w-full"
    >
      <div
        class="pointer-events-auto top-40 z-50 mx-auto mt-32 block max-w-xl rounded-xl bg-zinc-300 p-4 shadow-lg"
      >
        <!-- <PartManagerComponent class="pointer-events-auto" :title="'Edit Part: '" :submitText="'Update'" :strict="true" :oldPart="currentPart" @partSubmit="update"/> -->
      </div>
    </div>
  </div>
</template>
