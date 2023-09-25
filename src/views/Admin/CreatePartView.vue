<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { ref, onBeforeMount } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import PartManagerComponent from '../../components/PartComponents/PartManagerComponent.vue';
import BackButton from '../../components/GenericComponents/BackButton.vue';
import {
createPart,
getNextNXID,
updatePartImage,
} from '../../plugins/dbCommands/partManager';
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
let nextSequentialNXID = ref("")
async function submitPart(part: PartSchema, image: File) {
  // Use create part method from API commands
  createPart(
    http,
    part,
    store.state.user.building!,
    'Parts Room',
    (data, err) => {
      let newPart = data as PartSchema;
      if (err) {
        // Fail
        errorHandler(err);
        return;
      }
      // Success
      displayMessage(`Created part: ${newPart.manufacturer} ${newPart.name}`);
      // Check for image
      if (image) {
        // Rename image file
        let blob = image.slice(0, image.size, image.type);
        let fileName = newPart.nxid!;
        let renamedImage = new File([blob], fileName, { type: image.type });
        // upload image if exists
        updatePartImage(http, renamedImage, (data, err) => {
          if (err) {
            errorHandler(err);
            return;
          }
        });
      }
      key.value += 1;
      // Call our reset form function
    }
  );
}

function nextNXID() {
  return new Promise<string>((res)=>{
    getNextNXID(http, (data, err)=>{
      if(err)
        return res("")
      return res(data as string)
    })
  })
}
</script>
<template>
  <div>
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/manage')" class="mr-2 mb-2"/>
    <PartManagerComponent
      class="background-and-border p-4"
      :oldPart="{}"
      :strict="true"
      :submitText="`Create Part`"
      :title="'Create a new part: '"
      @partSubmit="submitPart"
      :key="key"
      :nextNXID="nextNXID"
    />
  </div>
</template>
