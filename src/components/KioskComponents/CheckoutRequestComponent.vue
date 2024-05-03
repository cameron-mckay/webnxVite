<script setup lang="ts">
import { BuildKitSchema, KioskQuantity, PartRequestSchema, User } from '../../plugins/interfaces'
import { onBeforeMount, ref } from 'vue';
import CheckOutRequestPartComponent from './CheckOutRequestPartComponent.vue';
import Cacher from '../../plugins/Cacher';

interface Props {
  request: PartRequestSchema
  kit?: BuildKitSchema
  kiosk_quantities: Map<string, KioskQuantity[]>
}

let { request, kiosk_quantities, kit } = defineProps<Props>()

let requestCopy = ref(JSON.parse(JSON.stringify(request)) as PartRequestSchema)
let emit = defineEmits(["submit", "approve", "deny"])
let user = Cacher.getUser(request.requested_by)
let kiosk = {} as User
let quantities = [] as KioskQuantity[][]
let boxes = [] as KioskQuantity[][]

let notes = ref("")

onBeforeMount(()=>{
  for(let p of request.parts) {
    quantities.push([])
    boxes.push([])
  }
  if(kit)
    kiosk = Cacher.getUser(kit.kiosk)
})

function approve() {
  if(kit)
    return emit("approve", notes.value)
  let submission = request.parts.map((v, i)=>{
    return {
      nxid: v.nxid,
      kiosk_quantities: quantities[i].map((q)=>{
        return{
          kiosk: q.kiosk,
          quantity: q.quantity,
          serials: q.selectedSerials ? q.selectedSerials : []
        }
      }).filter((q)=>q.quantity>0),
      boxes: boxes[i].map((b)=>{
        return {
          box_tag: b.kiosk,
          quantity: b.quantity,
          serials: b.selectedSerials ? b.selectedSerials : []
        }
      }),
    }
  }) as { nxid: string, kiosk_quantities: any[], boxes: any[] }[]
  emit("submit", request._id, submission, notes.value)
}

function deny() {
  emit("deny", notes.value)
}
</script>
<template>
  <div class="background-and-border my-4 p-4">

    <div class="flex justify-between">
      <h1 class="text-2xl leading-8 md:leading-10">
        {{ new Date(requestCopy.date_created).toLocaleString() }}
      </h1>
      <p>
        {{ user.first_name + " " + user.last_name }}
      </p>
    </div>
    <div class="col-span-2 my-4" v-if="kit">
      <p>{{kit.kit_name}}</p>
      <p>{{kiosk.first_name}} {{kiosk.last_name}}</p>
      <pre class="notes-with-links whitespace-pre-wrap">{{kit.notes}}</pre>
    </div>
    <div class="col-span-2 my-4" v-if="request.tech_notes">
      <h1 class="col-span-2 mb-4 text-4xl">Tech Notes:</h1>
      <pre class="whitespace-pre-wrap notes-with-links">{{ request.tech_notes }}</pre>
    </div>
    <div
      class="grid grid-cols-4 text-center font-bold"
    >
      <p>NXID</p>
      <p>Name</p>
      <p>Shelf Location</p>
      <p>Quantity/SN</p>
    </div>
    <CheckOutRequestPartComponent
      v-for="(part, index) of request.parts"
      :part="part"
      :kiosk_quantities="kiosk_quantities"
      :view_only="kit?true:false"
      @update="(q: KioskQuantity[], b: KioskQuantity[])=>{
        quantities[index] = JSON.parse(JSON.stringify(q))
        boxes[index] = JSON.parse(JSON.stringify(b))
      }"
    />
    <div class="my-4">
      <!-- -->
      <h1 class="inline-block text-4xl leading-8 md:leading-10">Notes:</h1>
      <textarea
        class="textbox m-1 h-40"
        v-model="notes"
        placeholder="Drag to resize"
      />
      <!-- -->
    </div>
    <div class="flex justify-center">
      <input
        type="submit"
        class="submit col-span-2 mx-1 mt-4"
        @click="approve"
        value="Approve"
      />
      <input
        type="submit"
        @click="deny"
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700 mx-1 mt-4"
        value="Deny"
      />
    </div>
  </div>
</template>
