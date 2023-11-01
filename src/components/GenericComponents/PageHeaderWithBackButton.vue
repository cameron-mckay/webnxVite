<script setup lang="ts">
import { Router } from 'vue-router';
import PageHeaderComponent from './PageHeaderComponent.vue';
import BackButton from './Buttons/BackButton.vue';
interface Props {
  router: Router
  prevPath: string
}
let { router, prevPath } = defineProps<Props>()
</script>
<template>
  <BackButton @click="router.options.history.state.back ? router.back() : router.push(prevPath)" class="mr-2 mb-2"/>
  <PageHeaderComponent>
    <slot></slot>
  </PageHeaderComponent>
</template>
