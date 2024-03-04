<script setup lang="ts">
import ToggleButtonComponent from '../BaseToggleButtonComponent.vue'
import SVGX from '../SVG/SVGX.vue';
interface Props {
  active: boolean
}
let {active} = defineProps<Props>()
</script>
<template>
  <ToggleButtonComponent :active="active" :red="true">
    <SVGX/>
  </ToggleButtonComponent>
</template>
