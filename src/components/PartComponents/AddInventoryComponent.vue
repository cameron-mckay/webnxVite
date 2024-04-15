<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { CartItem, PartSchema, User } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';
import CustomDropdownComponent from '../GenericComponents/CustomDropdownComponent.vue';

// Start props
interface Props {
  users: User[];
  kiosks: string[];
  part: PartSchema;
}

const { users, kiosks, part } = defineProps<Props>();
// End props

// Request as cart item
let request = ref({
  nxid: part.nxid!,
  building: 3,
  location: 'Parts Room',
} as CartItem);

// Owner
let owner = ref({} as User);
let quantity = ref(part.quantity?part.quantity:0);
let notes = ref("")
// let serials = ref('');
let emit = defineEmits(['submitRequest', 'audit', 'kioskChange']);
let currentKiosk = ref("")
let kioskNames = [] as string[]
// Reset form
function resetForm() {
  request.value.quantity = 0;
  request.value.building = 3;
  request.value.location = 'Parts Room';
}

function submit() {
  // if (part.serialized) {
  //   request.value.serial = serials.value;
  // } else {
    request.value.quantity = quantity.value;
  //}
  emit('submitRequest', request.value, owner.value, part);
}

// When component mounted
onMounted(() => {
  // Set value of request to props
  request.value.nxid = part.nxid!;
  // Register watch on the request object
  watch(currentKiosk, ()=>{
    emit("kioskChange", part, currentKiosk.value)
    request.value.location = currentKiosk.value
    setTimeout(()=>{quantity.value = part.quantity?part.quantity:0},250)
  })
  watch(request, () => {
    switch (request.value.location) {
      // If all techs, set owner to arbitrary data
      case 'All Techs':
        owner.value = {
          _id: 'all',
          first_name: 'All',
          last_name: 'Techs',
          building: request.value.building,
        };
        break;
      // If parts room, remove owner
      case 'Parts Room':
        owner.value = {};
        break;
      // If asset, set location
      case 'Asset':
        owner.value = {
          _id: owner.value._id,
          building: request.value.building,
        };
        break;
      case 'Box':
        owner.value = {
          _id: owner.value._id,
          building: request.value.building,
        };
        break;
      // If tech inventory, set current building to current user
      case 'Tech Inventory':
        request.value.building = owner.value.building;
        break;
      // Default case - do nothing
      default:
        if(kioskNames.includes(request.value.location!))
          owner.value = {};
        break;
    }
  });
});
  
</script>
<template>
  <FullScreenPopupComponent>
    <h1 class="mb-4 text-4xl">Adjust Quantities</h1>
    <form
      id="form"
      @submit.prevent="submit"
      @reset.prevent="resetForm"
      class="grid grid-cols-2"
    >
      <label>Kiosk:</label>
      <select required v-model="currentKiosk" class="textbox m-1">
        <option v-for="kiosk of kiosks">{{kiosk}}</option>
      </select>
      <p class="col-span-2 mb-4 text-xl">
        Current {{currentKiosk}} Quantity: {{ part.quantity }}
      </p>
      <label v-if="currentKiosk">New Quantity:</label>
      <input
        v-if="currentKiosk"
        class="textbox m-1"
        required
        v-model="quantity"
        type="number"
        min="0"
        placeholder="Quantity"
      />
      <!--
      <label v-if="part.serialized&&currentKiosk">Serial numbers:</label>
      <textarea
        class="textbox m-1"
        v-if="part.serialized&&currentKiosk"
        v-model="serials"
        placeholder="One per line.  Drag to resize"
      />
      -->
      <div
        v-if="
          (quantity > part.quantity!)&&!part.consumable
        "
        class="col-span-2 grid grid-cols-2"
      >
        <label>Building:</label>
        <select required v-model="request.building" class="textbox m-1">
          <option>3</option>
          <option>1</option>
          <option>4</option>
        </select>
        <label>Location:</label>
        <select required v-model="request.location" class="textbox m-1">
          <option>Tech Inventory</option>
          <option>All Techs</option>
          <option>Asset</option>
          <option>Box</option>
          <option>{{currentKiosk}}</option>
        </select>
        <div
          class="col-span-2 grid grid-cols-2"
          v-if="request.location == 'Tech Inventory'"
        >
          <label>Owner:</label>
          <select v-model="owner">
            <option
              v-for="user in users"
              v-bind:key="user._id"
              :value="user"
              class="textbox m-1"
            >
              {{ user.first_name + ' ' + user.last_name }}
            </option>
          </select>
        </div>
        <div
          class="col-span-2 grid grid-cols-2"
          v-if="request.location == 'Asset'"
        >
          <label>Asset Tag:</label>
          <input
            type="text"
            placeholder="Asset Tag"
            v-model="owner._id"
            class="textbox m-1"
          />
        </div>
        <div
          class="col-span-2 grid grid-cols-2"
          v-if="request.location == 'Box'"
        >
          <label>Box Tag:</label>
          <input
            type="text"
            placeholder="Box Tag"
            v-model="owner._id"
            class="textbox m-1"
          />
        </div>
      </div>
      <p
        v-if="
          part.quantity != undefined &&
          quantity > part.quantity
        "
        class="col-span-2 mb-4 text-xl"
      >
        Adding {{ quantity - part.quantity }} to {{ request.location }}
        {{ request.location == 'Asset' ? owner._id : '' }}
      </p>
      <p
        v-else-if="
          part.quantity != undefined &&
          quantity < part.quantity
        "
        class="col-span-2 mb-4 text-xl"
      >
        Removing {{ part.quantity - quantity }} from {{currentKiosk}}
      </p>
      <p
        v-else-if="part.quantity != undefined"
        class="col-span-2 mb-4 text-xl"
      >
        No change.
      </p>
      <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        value="Reset"
      />
      <input class="submit col-span-2" type="submit" value="Update" />
      <h1 class="my-4 text-4xl">Audit:</h1>
      <div
        class="col-span-2 grid grid-cols-2"
      >
        <p v-if="part.audited">Last Audited:</p>
        <p v-if="part.audited">{{new Date(Date.parse(part.audited!)).toLocaleString()}}</p>
      </div>
      <div
        class="col-span-2"
      >
        <h1 class="inline-block text-2xl leading-8 md:leading-10">Notes:</h1>
        <textarea
          class="textbox m-1 h-40"
          v-model="notes"
          placeholder="Drag to resize"
        />
      </div>
      <input class="submit col-span-2" type="button" value="Mark As Audited" @click="$emit('audit', notes)"/>
    </form>
  </FullScreenPopupComponent>
</template>
