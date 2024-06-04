<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { CartItem, InventoryEntry, KioskQuantity, LoadedCartItem, PartOrderSchema, UserState } from '../../plugins/interfaces'
import CheckoutHistoryPartComponent from '../../components/KioskComponents/CheckoutHistoryPartComponent.vue';
import Cacher from '../../plugins/Cacher';
import { AxiosError, AxiosInstance } from 'axios';
import { Store } from 'vuex';
import { Router } from 'vue-router';
import { fulfillPartOrder, getPartOrderByID } from '../../plugins/dbCommands/partManager';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import Inventory from '../../plugins/InventoryClass';
import AssetPartInventoryComponent from '../../components/AssetComponents/AssetPartInventoryComponent.vue';
import InlinePartSpecComponent from '../../components/PartComponents/InlinePartSpecComponent.vue';
import OrderPartComponent from '../../components/PartComponents/OrderPartComponent.vue';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}

const { http, router, store, errorHandler, displayMessage } =
  defineProps<Props>();

let orderedParts = ref([] as LoadedCartItem[])

let perUnitCosts =ref([] as LoadedCartItem[])

let quantities = [] as KioskQuantity[][]
let boxes = [] as KioskQuantity[][]
let kiosk_quantities = new Map<string, KioskQuantity[]>()
let kioskParts = ref([] as CartItem[])
let receivedParts = ref([] as LoadedCartItem[])
let processing = false
let notes = ref("")


let loading = ref(false)
let createPartRecords = ref(true)
let order:PartOrderSchema
let inventory = new Inventory(store.state.user)
let kiosks = [] as string[]
let updating = ref(false)

onBeforeMount(async ()=>{
  loading.value = true
  inventory.setCorrection(true)
  let kUsers = await Cacher.loadAllUsersFromAPISync()
  kiosks = kUsers.filter((u)=>u.roles?.includes('is_kiosk')).map((u)=>u.first_name + " " + u.last_name)
  let { id } = router.currentRoute.value.query
  getPartOrderByID(http, id as string, async (data, err)=>{
    if(err)
      return
    order = data as PartOrderSchema
    orderedParts.value = await Promise.all(order.ordered_parts!.map((p)=>{
      return new Promise<LoadedCartItem>(async (res) => {
        let part = await Cacher.getPartInfo(p.nxid)!
        res({
          part,
          serial: p.serial,
          quantity: p.quantity
        })
      })
    }))
    inventory.setDestInventory(order.ordered_parts)
    handleUpdate()
    loading.value = false
  })
})

function handleUpdate() {
  updating.value = true
  receivedParts.value = JSON.parse(JSON.stringify(inventory.getDestInv()))
  let notOnPerUnit = receivedParts.value.filter((v)=>{
    return perUnitCosts.value.findIndex((p)=>{
      return p.part.nxid==v.part.nxid
    })==-1
  })
  perUnitCosts.value = JSON.parse(JSON.stringify(perUnitCosts.value.filter((v)=>{
    return receivedParts.value.findIndex((p)=>v.part.nxid==p.part.nxid) != -1
  }).concat(notOnPerUnit))).map((p: any)=>{
      delete p.quantity
      return p
  })
  kioskParts.value = receivedParts.value.map((v)=>{

    kiosk_quantities.set(v.part.nxid!, kiosks.map((k, i)=>{
      return {
        kiosk: k,
        max: v.quantity,
        quantity: i == 0 ? v.quantity : 0,
        serials: kiosk_quantities.has(v.part.nxid!) ? padOrClampArray(kiosk_quantities.get(v.part.nxid!)![i].serials, v.quantity!) : padOrClampArray([], v.quantity!)
      } as KioskQuantity
    }))
    return {nxid: v.part.nxid, quantity: v.quantity}
  }) as CartItem[]
  setTimeout(()=>updating.value = false)
}

function padOrClampArray(og_arr: string[], size: number) {
  // Copy the original array to prevent editing in place
  let arr = JSON.parse(JSON.stringify(og_arr?og_arr:[]))
  // If array is greater than desired size
  if(arr.length>size) {
    // Splice to length
    return arr.splice(0, size)
  }
  // While the array is smaller than desired size
  while(arr.length < size) {
    // Push empty string
    arr.push("")
  }
}

function finish() {

  if(processing)
    return
  processing = true


  let req = kioskParts.value.map((v, i)=>{
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



  let locationsMap = new Map<string, InventoryEntry[]>()
  let boxMap = new Map<string, InventoryEntry[]>()
  // Loop trhough all the parts
  for(let part of req) {
    // Destructure to declare boxes
    let { boxes } = part
    // Loop through all the kiosk quantities
    for(let kq of part.kiosk_quantities) {
      // There should only be one of these per part of req
      if(kq.kiosk == "Box") {
        let boxArr = [] as InventoryEntry[]
        // Loop through boxes
        for(let box of boxes) {
          // If already in map
          if(boxMap.has(box.box_tag))
            // Get it 
            boxArr = boxMap.get(box.box_tag)!
          else
            boxArr = []
          
          let serials = (box.serials as string[]).filter((v)=>v!=""&&v!="Custom")
            .filter((v, i, arr)=>arr.indexOf(v)==i)
          // If quantity, push serials
          if(box.quantity>0)
            kq.serials = kq.serials.concat(serials)
          // Push to array
          boxArr.push({
            nxid: part.nxid,
            unserialized: box.quantity > serials.length ? box.quantity - serials.length : 0,
            serials
          })
          // Upate map
          boxMap.set(box.box_tag, boxArr)
        }
      }
      // Array for the cart items
      let arr = [] as InventoryEntry[]
      // If the map already has location
      if(locationsMap.has(kq.kiosk)) {
        // Fetch existing array
        arr = locationsMap.get(kq.kiosk)!
      }
      // Remove empty strings and dupes
      let serials = (kq.serials as string[]).filter((v)=>v!=""&&v!="Custom")
        .filter((v, i, arr)=>arr.indexOf(v)==i)
      // Push them as cart items
      arr.push({
        nxid: part.nxid,
        unserialized: kq.quantity > serials.length ? kq.quantity - serials.length : 0,
        serials,
      })
      // Save the array to map
      locationsMap.set(kq.kiosk, arr)
    }
  }

  // Create final request array
  let finalReq = [] as any[]
  // Convert map entries to objects
  locationsMap.forEach((v, k) => {
    finalReq.push({kiosk: k, parts: v})
  })
  // Create final request array
  let finalBoxes = [] as any[]
  // Convert map entries to objects
  boxMap.forEach((v, k) => {
    finalBoxes.push({box_tag: k, parts: v})
  })
  let finalPerUnit = perUnitCosts.value
    .filter((v)=>v&&v.quantity!=undefined)
    .map((v)=>{
      return { nxid: v.part.nxid!, cost: v.quantity! }
    })
  fulfillPartOrder(http, order._id, finalReq, notes.value, finalBoxes, finalPerUnit, (data, err)=>{
    processing = false
    if(err)
      return errorHandler(err)
    displayMessage(data as string)
    router.push({name: "Orders"})
  })
}

</script>
<template>
  <div>
    <LoaderComponent v-if="loading"/>
    <form v-else class="background-and-border my-4 p-4" @submit.prevent="finish">
      <p class="text-4xl">
        Created: {{ new Date(order.date_created).toLocaleString() }}
      </p>
      <p class="my-2 text-xl" v-if="order.create_notes&&order.create_notes!=''">
        Notes:
      </p>
      <pre class="whitespace-pre-wrap notes-with-links">{{ order.create_notes }}</pre>
      <div>
        <h1 class="text-4xl my-4">Ordered Parts:</h1>
        <div
          class="relative grid grid-cols-3 md:grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
        >
          <p class="mt-auto hidden md:block">NXID</p>
          <p class="mt-auto">Manufacturer</p>
          <p class="mt-auto">Name</p>
          <p class="mt-auto">Quantity/SN</p>
        </div>
        <CheckoutHistoryPartComponent
          v-for="part in orderedParts"
          :item="part"
          :hideButtons="true"
        />
      </div>
      <AssetPartInventoryComponent
        :untracked="true"
        :inventory="inventory"
        @update="handleUpdate"
        title="Received Parts:"
        class="mt-4"
      />
      <div v-if="receivedParts.length>0"> 
        <h1 class="text-4xl my-4">Per Unit Costs:</h1>
        <div
          class="relative grid grid-cols-3 md:grid-cols-4 py-1 text-center font-bold leading-8 transition md:py-2 md:leading-10 mt-auto"
        >
          <p class="mt-auto hidden md:block">NXID</p>
          <p class="mt-auto">Manufacturer</p>
          <p class="mt-auto">Name</p>
          <p class="mt-auto">Cost</p>
        </div>
        <div class="group relative my-1" v-for="item of perUnitCosts">
          <div
            class="group-hover:bab-hover background-and-border grid p-1 text-center leading-8 grid-cols-3 md:grid-cols-4 md:p-2 md:leading-10"
          >
            <p class="hidden md:block">{{ item.part.nxid ? item.part.nxid : "PNX0000000" }}</p>
            <p class="break-words">{{ item.part.manufacturer ? item.part.manufacturer : "DELETED PART" }}</p>
            <p class="break-words">{{ item.part.name ? item.part.name : "DELETED PART" }}</p>
            <div class="flex">
            <p>$</p>
            <input
              class="textbox pl-2"
              v-model="item.quantity"
              type="number"
              min="0"
              placeholder="0.00"
              step="0.01"
            />
            </div>
          </div>
          <InlinePartSpecComponent
            class="group-hover:bab-drop-hover bab-drop relative"
            :part="item.part.type ? item.part : { type: 'DELETED', notes: 'The part info associated with this NXID has been deleted' }"
          />
        </div>
      </div>
      <div v-if="receivedParts.length>0&&!updating"> 
        <h1 class="text-4xl my-4">Create Part Records:</h1>
        <div
          class="grid grid-cols-4 text-center font-bold"
        >
          <p>NXID</p>
          <p>Name</p>
          <p>Shelf Location</p>
          <p>Quantity/SN</p>
        </div>
        <OrderPartComponent
          v-for="(part, index) of kioskParts"
          :part="part"
          :kiosk_quantities="kiosk_quantities"
          @update="(q: KioskQuantity[], b: KioskQuantity[])=>{
            quantities[index] = JSON.parse(JSON.stringify(q))
            boxes[index] = JSON.parse(JSON.stringify(b))
          }"
        />
      </div>
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
          class="submit col-span-2 mx-1 mt-4"
          type="submit"
          value="Finish"
        />
      </div>
    </form>
  </div>
</template>
