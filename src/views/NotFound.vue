<template>
  <div class="background-and-border p-4">
    <PageHeaderWithBackButton :prev-path="'/'" :router="router">
      ERROR 404
    </PageHeaderWithBackButton>
    <!-- Get cat from api, use get time in fake querystring to bypass vue cache -->
    <img class="w-full" :src="'https://cataas.com/cat/computer?time='+Date.now()">
  </div>
</template>
<script setup lang="ts">
import PageHeaderWithBackButton from '../components/GenericComponents/PageHeaderWithBackButton.vue';
import { Router } from 'vue-router';
interface Props {
  router: Router;
}
let {router} = defineProps<Props>()
</script>
