<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onActivated, ref } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AddInventoryComponent from '../../components/PartComponents/AddInventoryComponent.vue';
import EditPartComponent from '../../components/PartComponents/EditPartComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue';
import AdvancedSearchComponent from '../../components/PartComponents/PartAdvancedSearchComponent.vue';
import PartComponent from '../../components/PartComponents/PartComponent.vue';
import {
  createNewPartRecords,
  deletePart,
  updatePart,
  updatePartImage,
  deleteFromPartsRoom,
  auditPart,
  getPartByID,
  getPartsByTextSearch,
  getPartsByData
} from '../../plugins/dbCommands/partManager';
import type {
  CartItem,
  PartSchema,
  TextSearchPage,
  User,
  UserState,
} from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';
import TextSearch from '../../plugins/TextSearchClass';

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
let users = Cacher.getAllUsers()
let kiosks = Cacher.getKiosks()


// Default building is Ogden - 3
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string) {
  return new Promise<TextSearchPage>((res)=>{
    getPartsByTextSearch(http, searchString, pageNum, 3, (data: any, err) => {
      if (err) {
        // Send error to error handler
        return res({pages: 0, total: 0, items: []})
      }
      // Typecast response
      let response = data as TextSearchPage
      // Resolve promise
      res(response);
    });
  })
}

function advancedSearchCallback(buildingNum: number, pageNum: number, searchObject: PartSchema) {
  return new Promise<TextSearchPage>((res)=>{
    searchObject['advanced'] = 'true';
    searchObject['pageNum'] = pageNum;
    searchObject['pageSize'] = 50;
    // Send request to api
    getPartsByData(http, searchObject, (data, err) => {
      if (err) {
        // Send error to error handler
        return res({pages: 0, total: 0, items: []})
      }
      let response = data as TextSearchPage
      // Resolve promise
      res(response);
    });
  })
}

// Toggle advanced search
function toggleAdvanced() {
  // Negate
  showAdvanced.value = !showAdvanced.value;
}

async function advancedSearchButtonPressed(part: PartSchema) {
  searchObject.newAdvancedSearch(store.state.user.building!, 1, part)
  toggleAdvanced()
}

function displayResults(page: PartSchema[]) {
  parts.value = page
}

// Wait for store to init
onActivated(() => {
  currentBuilding.value = store.state.user.building!;
});


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
  updatePart(http, part, async (data, err) => {
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
    searchObject.forceReloadPage()
  });
}

async function deleteClicked(nxid: string) {
  if (
    window.confirm(
      '***WARNING***\nThis will delete all associated part records, which will remove this part from all locations including user inventories and assets.  If you are trying to correct quantities or specifications, please use the appropriate tools.'
    )
  ) {
    deletePart(http, nxid, async (data, err) => {
      if (err) return errorHandler(err);
      displayMessage(data as string);
      editPart.value = false;
      searchObject.forceReloadPage()
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
    createNewPartRecords(http, request, owner, async (records, err) => {
      if (err) {
        return errorHandler(err);
      }
      // Display confirmation
      displayMessage('Successfully added to inventory');
      // Reset
      toggleAdd({});
      // Refresh parts list
      searchObject.forceReloadPage()
    });
  }
  else if (
    request.quantity != undefined &&
    part.quantity != undefined &&
    request.quantity > part.quantity
  ) {
    request.quantity = request.quantity - part.quantity;
    createNewPartRecords(http, request, owner, async (records, err) => {
      if (err) {
        return errorHandler(err);
      }
      // Display confirmation
      displayMessage('Successfully added to inventory');
      // Reset
      toggleAdd({});
      // Refresh parts list
      searchObject.forceReloadPage()
    });
  } else if (
    request.quantity != undefined &&
    part.quantity != undefined &&
    request.quantity < part.quantity
  ) {
    deleteFromPartsRoom(http, part.nxid!, part.quantity! - request.quantity, store.state.user.building!, request.location!, async (data, err)=>{
      if (err) {
            // Handle errors
          return errorHandler(err);
        }
        displayMessage(data as string);
        // Reset
        toggleAdd({});
        // Refresh parts list
        searchObject.forceReloadPage()

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
</script> <template> <div>
    <PageHeaderWithBackButton class="mb-4" :prev-path="'/manage'" :router="router">Manage Parts</PageHeaderWithBackButton>

    <TextSearchComponent
      :search-object="searchObject"
      @display-results="displayResults"
    >
      <template v-slot:searchIcons>
        <SlidersButton @click="toggleAdvanced"/>
        <AdvancedSearchComponent
          v-if="showAdvanced"
          :startPart="searchObject.getAdvancedSearchObjectFromRouter() as PartSchema"
          @toggle="toggleAdvanced"
          @partSearch="advancedSearchButtonPressed"
        />
      </template>
      <template v-slot:searchHeader>
        <p class="mt-auto hidden md:block">NXID</p>
        <p class="mt-auto">Manufacturer</p>
        <p class="mt-auto">Name</p>
        <p class="mt-auto hidden md:block">Location</p>
        <p class="mt-auto">Quantity</p>
      </template>
      <template v-slot:searchResults>
        <PartComponent
          :view="true"
          :edit="true"
          :add="true"
          v-for="part in parts"
          @editPartAction="toggleEdit(part)"
          @addPartAction="toggleAdd(part)"
          @viewPartAction="viewPart(part)"
          :part="part"
        />
      </template>
    </TextSearchComponent>

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
      :kiosks="kiosks.map((u)=>u.first_name + ' ' + u.last_name)"
      :buildings="buildings"
      :part="currentPart"
    />
  </div>
</template>
