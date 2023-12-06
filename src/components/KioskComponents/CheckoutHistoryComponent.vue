<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { CheckOutEvent, User, PartSchema, LoadedCartItem } from '../../plugins/interfaces'
import CheckoutHistoryPartComponent from './CheckoutHistoryPartComponent.vue';
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
        part: parts.get(p.nxid)||{nxid: p.nxid, manufacturer: "DELETED PART", name: "DELETED PART", type: "DELETED", notes: "The part info associated with this NXID has been deleted."},
        serial: p.serial,
        quantity: p.quantity
    } as LoadedCartItem
  })
})

</script>
<template>
  <div class="background-and-border my-4 p-4">
    <div class="flex justify-between">
      <h1 class="text-2xl leading-8 md:leading-10">
        {{ new Date(checkout.date).toLocaleString() }}
      </h1>
      <p>
        {{ user.first_name + " " + user.last_name }}
      </p>
    </div>
    <div>
      <div
        class="relative grid grid-cols-3 md:grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
      >
        <p class="mt-auto hidden md:block">NXID</p>
        <p class="mt-auto">Manufacturer</p>
        <p class="mt-auto">Name</p>
        <p class="mt-auto">Quantity/SN</p>
      </div>
      <CheckoutHistoryPartComponent
        v-for="part in loadedParts"
        :item="part"
        :hideButtons="true"
      />
    </div>
  </div>
</template>
