<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { CartItem, PartSchema, User } from '../../plugins/interfaces';
import FullScreenPopupComponent from '../GenericComponents/FullScreenPopupComponent.vue';

// Start props
interface Props {
  users: User[];
  part: PartSchema;
}

const { users, part } = defineProps<Props>();
// End props

// Request as cart item
let request = ref({
  nxid: part.nxid!,
  building: 3,
  location: 'Parts Room',
} as CartItem);

// Owner
let owner = ref({} as User);
let quantity = ref(0)
let serials = ref("")
let emit = defineEmits(['submitRequest'])
// Reset form
function resetForm() {
  request.value.quantity = 0;
  request.value.building = 3;
  request.value.location = 'Parts Room';
}

function submit() {
  console.log(part.serialized)
  if(part.serialized) {
    console.log("tests")
    request.value.serial = serials.value
  }
  else {
    request.value.quantity = quantity.value
  }
  emit("submitRequest", request.value, owner)
}

// When component mounted
onMounted(() => {
  console.log(part)
  // Set value of request to props
  request.value.nxid = part.nxid!;
  // Register watch on the request object
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
      // If tech inventory, set current building to current user
      case 'Tech Inventory':
        request.value.building = owner.value.building;
        break;
      // Default case - do nothing
      default:
        break;
    }
  });
});
</script>
<template>
  <FullScreenPopupComponent>
    <h1 class="mb-4 text-4xl">Add Parts to Inventory</h1>
    <form
      id="form"
      @submit.prevent="submit"
      @reset.prevent="resetForm"
      class="grid grid-cols-2"
    >
      <label v-if="!part.serialized">Quantity:</label>
      <input
        v-if="!part.serialized"
        class="textbox m-1"
        required
        v-model="quantity"
        type="number"
        min="0"
        placeholder="Quantity"
      />
      <label
        v-if="part.serialized"
      >
        Serial numbers:
      </label>
      <textarea
        class="textbox m-1"
        v-if="part.serialized"
        v-model="serials"
        placeholder="One per line.  Drag to resize"
      />
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
        <option>Parts Room</option>
        <option>Asset</option>
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
      <input
        class="submit col-span-2 bg-red-500 hover:bg-red-600 active:bg-red-700"
        type="reset"
        value="Reset"
      />
      <input class="submit col-span-2" type="submit" value="Add" />
    </form>
  </FullScreenPopupComponent>
</template>
