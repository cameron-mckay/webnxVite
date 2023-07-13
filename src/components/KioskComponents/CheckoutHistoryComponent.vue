<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { CheckOutEvent, User, PartSchema, LoadedCartItem } from '../../plugins/interfaces'
import AssetCartItemComponent from '../AssetComponents/AssetCartItemComponent.vue';
interface Props {
  checkout: CheckOutEvent
  user: User
  parts: Map<string, PartSchema>
}

let { checkout, user, parts } = defineProps<Props>()
let loadedParts = ref([] as LoadedCartItem[])
onBeforeMount(()=>{
  loadedParts.value = checkout.parts.map((p)=>{
    return  {
        part: parts.get(p.nxid)!,
        serial: p.serial,
        quantity: p.quantity
    } as LoadedCartItem
  })
})

</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="flex justify-between">
      <h1 class="mb-8 text-4xl leading-8 md:leading-10">
        {{ new Date(checkout.date).toLocaleString() }}
      </h1>
      <p>
        {{ user.first_name + " " + user.last_name }}
      </p>
    </div>
    <div>
      <AssetCartItemComponent
        v-for="part in loadedParts"
        :item="part"
        :hideButtons="true"
      />
    </div>
  </div>
</template>
