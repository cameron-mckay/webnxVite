<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import PartManagerComponent from '../../components/PartComponents/PartManagerComponent.vue';
import { createPart } from '../../plugins/dbCommands/partManager';
import type { PartSchema, UserState } from '../../plugins/interfaces';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
// END OF PROPS
let key = ref(0);

async function submitPart(part: PartSchema) {
  // Use create part method from API commands
  createPart(http, part, 3, 'Parts Room', (data, err) => {
    if (err) {
      // Fail
      errorHandler(err);
      return;
    }
    // Success
    displayMessage(String(data));
    key.value += 1;
    // Call our reset form function
  });
}
</script>
<template>
  <PartManagerComponent
    class="background-and-border p-4"
    :oldPart="{}"
    :strict="true"
    :submitText="`Create Part`"
    :title="'Create a new part: '"
    @partSubmit="submitPart"
    :key="key"
  />
</template>
