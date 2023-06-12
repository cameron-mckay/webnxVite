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
deletePart,
movePart,
updatePart,
updatePartImage,
} from '../../plugins/dbCommands/partManager';
import { getAllUsers } from '../../plugins/dbCommands/userManager';
import type {
CartItem,
PartRecord,
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
  revokeLogin: () => void;
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
  searchRef.value.externalRefresh();
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

function updatePartInfo(part: PartSchema, image: File) {
  // Update part info
  updatePart(http, part, (data, err) => {
    if (err) {
      return errorHandler(err);
    }
    let newPart = data as PartSchema;
    // Display confirmation
    displayMessage(`Updated: ${newPart.manufacturer} ${newPart.name}`);
    // Check for image
    if (image) {
      // Rename image file
      let blob = image.slice(0, image.size, image.type);
      let fileName = part.nxid!;
      let renamedImage = new File([blob], fileName, { type: image.type });
      // upload image if exists
      updatePartImage(http, renamedImage, (data, err) => {
        if (err) {
          errorHandler(err);
          return;
        }
      });
    }
    // Reset vars
    toggleEdit({});
    // Call search to refresh data
    search();
  });
}

function deleteClicked(nxid: string) {
  if (
    window.confirm(
      '***WARNING***\nThis will delete all associated part records, which will remove this part from all locations including user inventories and assets.  If you are trying to correct quantities or specifications, please use the appropriate tools.'
    )
  ) {
    deletePart(http, nxid, (data, err) => {
      if (err) return errorHandler(err);
      displayMessage(data as string);
      editPart.value = false;
      search();
    });
  }
}

function submitAddToInventory(
  request: CartItem,
  owner: User,
  part: PartSchema
) {
  // Send creation details to API
  if(part.serialized) {
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
  else if (
    request.quantity != undefined &&
    part.quantity != undefined &&
    request.quantity > part.quantity
  ) {
    request.quantity = request.quantity - part.quantity;
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
  } else if (
    request.quantity != undefined &&
    part.quantity != undefined &&
    request.quantity < part.quantity
  ) {
    let from = {
      next: null,
      location: 'Parts Room',
      nxid: part.nxid,
      building: request.building,
    };
    let to = JSON.parse(JSON.stringify(from)) as PartRecord;
    to.owner = 'deleted';
    console.log(from);
    console.log(to);
    console.log(part.quantity! - request.quantity!);
    movePart(
      http,
      "deleted",
      'parts', [{
        nxid: part.nxid!,
        unserialized: part.quantity! - request.quantity!,
        serials: []
      }],
      (data, err) => {
        if (err) {
          // Handle errors
          errorHandler(err);
        }
        displayMessage(data as string);
        // Reset
        toggleAdd({});
        // Refresh parts list
        search();
      }
    );
  } else {
    return errorHandler('Quantity error');
  }
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
      :revokeLogin="revokeLogin"
    />

    <EditPartComponent
      v-if="editPart"
      @toggle="toggleEdit"
      @updatePart="updatePartInfo"
      @deletePart="deleteClicked"
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
