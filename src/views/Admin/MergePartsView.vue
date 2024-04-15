<template>
  <div class="background-and-border p-4">
    <PageHeaderWithBackButton :prev-path="'/manage'" :router="router">
      Merge Parts
    </PageHeaderWithBackButton>
    <form @submit.prevent="submit">
      <div class="grid grid-cols-2 max-w-md">
        <label>Part To Delete: </label>
        <input
          id="searchBox"
          class="search ml-0 w-40"
          type="text"
          v-model="deleted"
          placeholder="DELETE"
        />
        <label>Replacement NXID: </label>
        <input
          id="searchBox"
          class="search ml-0 w-40"
          type="text"
          v-model="keep"
          placeholder="KEEP"
        />
        <input class="search-button col-span-2 mx-auto mt-4" type="submit" value="Submit" />
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { AxiosInstance, AxiosError } from 'axios';
import { Store } from 'vuex';
import { NotificationTypes, UserState } from '../../plugins/interfaces';
import { Router } from 'vue-router';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import { ref } from 'vue';
import { mergeParts } from '../../plugins/dbCommands/partManager';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError) => void;
  displayMessage: (message: string, type: NotificationTypes) => void;
}

const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();
let deleted = ref("")
let keep = ref("")

function submit() {
  mergeParts(http, keep.value, deleted.value, (data, err)=>{
    if(err)
      return errorHandler(err)
    displayMessage(data as string, NotificationTypes.Info)
  })
}
</script>
