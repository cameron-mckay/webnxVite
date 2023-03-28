<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onActivated, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AddInventoryComponent from '../../components/PartComponents/AddInventoryComponent.vue';
import EditPartComponent from '../../components/PartComponents/EditPartComponent.vue';
import SearchComponent from '../../components/PartComponents/PartSearchComponent.vue';
import {
  createNewPartRecords,
  updatePart,
} from '../../plugins/dbCommands/partManager';
import { getAllUsers } from '../../plugins/dbCommands/userManager';
import type {
  CartItem,
  PartSchema,
  User,
  UserState,
} from '../../plugins/interfaces';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
  errorHandler: (err: Error | AxiosError | string) => void;
  displayMessage: (message: string) => void;
}
const { http, store, router, errorHandler, displayMessage } =
  defineProps<Props>();

let buildings: Ref<Array<number>> = ref([]);
let editPart = ref(false);
let addPart = ref(false);
let currentPart: Ref<PartSchema> = ref({});
let currentBuilding = ref(3);
let users = ref([] as User[]);
getUsers();

// Wait for store to init
onActivated(() => {
  currentBuilding.value = store.state.user.building!;
});

// Get all users
function getUsers() {
  getAllUsers(http, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    users.value = data as User[];
  });
}

// Get search method from child component
const searchRef = ref();
const search = () => {
  searchRef.value.search();
};

// Toggle editing parts menu
function toggleEdit(part: PartSchema) {
  currentPart.value = part;
  editPart.value = !editPart.value;
}

// Toggle add parts menu
function toggleAdd(part: PartSchema) {
  currentPart.value = part;
  addPart.value = !addPart.value;
}

function viewPart(part: PartSchema) {
  router.push({ name: 'Part View', query: { nxid: part.nxid } });
}

function updatePartInfo(part: PartSchema) {
  // Update part info
  updatePart(http, part, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    // Display confirmation
    displayMessage(data as string);
    // Reset vars
    toggleEdit({});
    // Call search to refresh data
    search();
  });
}

function submitAddToInventory(request: CartItem, owner: User) {
  // Send creation details to API
  createNewPartRecords(http, request, owner, (records, err) => {
    if (err) {
      return errorHandler(err);
    }
    // Display confirmation
    displayMessage('Successfully added to inventory');
    // Reset
    toggleAdd({});
    // Refresh parts list
    search();
  });
}
</script>
<template>
  <div>
    <h1 class="mb-4 text-4xl">Part Manager</h1>
    <SearchComponent
      ref="searchRef"
      :building="currentBuilding"
      :edit="true"
      :add="true"
      :view="true"
      :http="http"
      :errorHandler="errorHandler"
      :location="'Parts Room'"
      :displayMessage="displayMessage"
      :changeBuilding="true"
      @editPartAction="toggleEdit"
      @addPartAction="toggleAdd"
      @viewPartAction="viewPart"
      :router="router"
    />

    <EditPartComponent
      v-if="editPart"
      @toggle="toggleEdit"
      @updatePart="updatePartInfo"
      :show="editPart"
      :oldPart="currentPart"
    />

    <AddInventoryComponent
      v-if="addPart"
      @toggle="toggleAdd"
      @submitRequest="submitAddToInventory"
      :users="users"
      :buildings="buildings"
      :part="currentPart"
    />
  </div>
</template>
