<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { CheckOutEvent, User, PartSchema, LoadedCartItem, EbaySaleEvent } from '../../plugins/interfaces'
import CheckoutHistoryPartComponent from '../KioskComponents/CheckoutHistoryPartComponent.vue';
interface Props {
  order: EbaySaleEvent
  user: User
  parts: Map<string, PartSchema>
}

let { user, order, parts } = defineProps<Props>()
let loadedParts = ref([] as LoadedCartItem[])
onBeforeMount(()=>{
  loadedParts.value = order.parts.map((p)=>{
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
    <div>
      <h1 class="text-2xl leading-8 md:leading-10">
        {{ new Date(order.date).toLocaleString() }}
      </h1>
      <p>
        Order ID: {{order.order}}
      </p>
      <p>
        By: {{ user.first_name + " " + user.last_name }}
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
