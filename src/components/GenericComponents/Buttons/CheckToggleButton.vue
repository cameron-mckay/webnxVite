<script setup lang="ts">
import ToggleButtonComponent from '../BaseToggleButtonComponent.vue'
import SVGCheck from '../SVG/SVGCheck.vue';
interface Props {
  active: boolean
}
let {active} = defineProps<Props>()
</script>
<template>
  <ToggleButtonComponent :active="active">
    <SVGCheck/>
  </ToggleButtonComponent>
</template>
