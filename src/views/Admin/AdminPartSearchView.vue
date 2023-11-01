<script setup lang="ts">
// PROPS SINCE THEY CANT BE IMPORTED FROM A FILE IN VUE 3?????
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onActivated, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AddInventoryComponent from '../../components/PartComponents/AddInventoryComponent.vue';
import EditPartComponent from '../../components/PartComponents/EditPartComponent.vue';
import SearchComponent from '../../components/PartComponents/PartSearchComponent.vue';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import {
createNewPartRecords,
deletePart,
updatePart,
updatePartImage,
deleteFromPartsRoom,
auditPart,
getPartByID
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
let kiosks = ref([] as string[]);
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
    users.value = (data as User[]).filter((u)=>!u.roles?.includes("kiosk")&&u.building==store.state.user.building);
    kiosks.value = (data as User[]).filter((u)=>u.roles?.includes("kiosk")&&u.building==store.state.user.building).map((u)=>{
      console.log(u)
      return u.first_name + " " + u.last_name
    });
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
  request.building = store.state.user.building
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
    deleteFromPartsRoom(http, part.nxid!, part.quantity! - request.quantity, store.state.user.building!, request.location!, (data, err)=>{
      if (err) {
            // Handle errors
          return errorHandler(err);
        }
        displayMessage(data as string);
        // Reset
        toggleAdd({});
        // Refresh parts list
        search();

    }) 
  } else {
    return errorHandler('Quantity error');
  }
}

function changeKiosk(part: PartSchema, kiosk: string) {
  getPartByID(http, part.nxid!, store.state.user.building!, (data, err)=>{
    if(err) {
      return errorHandler(err)
    }
    let resPart = data as PartSchema
    part.quantity = resPart.quantity
  }, kiosk)
}

function audit() {
  auditPart(http, currentPart.value.nxid!, (data, err) => {
    if(err) {
      return errorHandler(err)
    }
    currentPart.value = data as PartSchema
    displayMessage("Part audited.")
  })
}
</script>
<template>
  <div>
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/manage')" class="mr-2 mb-2"/>
    <h1 class="mb-4 text-4xl">Part Manager</h1>
    <SearchComponent
      ref="searchRef"
      :building="currentBuilding"
      :edit="true"
      :add="true"
      :view="true"
      :http="http"
      :errorHandler="errorHandler"
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
      @audit="audit"
      @kioskChange="changeKiosk"
      :users="users"
      :kiosks="kiosks"
      :buildings="buildings"
      :part="currentPart"
    />
  </div>
</template>
