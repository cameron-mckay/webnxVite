<script setup lang="ts">
import type { AxiosError, AxiosInstance } from 'axios';
import { Ref, onActivated, ref, onBeforeMount } from 'vue';
import { Router } from 'vue-router';
import type { Store } from 'vuex';
import AddInventoryComponent from '../../components/PartComponents/AddInventoryComponent.vue';
import EditPartComponent from '../../components/PartComponents/EditPartComponent.vue';
import PageHeaderWithBackButton from '../../components/GenericComponents/PageHeaderWithBackButton.vue';
import TextSearchComponent from '../../components/GenericComponents/Search/TextSearchComponent.vue';
import SlidersButton from '../../components/GenericComponents/Buttons/SlidersButton.vue';
import AdvancedSearchComponent from '../../components/PartComponents/PartAdvancedSearchComponent.vue';
import PartComponent from '../../components/PartComponents/PartComponent.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import {
  createNewPartRecords,
  deletePart,
  updatePart,
  updatePartImage,
  deleteFromPartsRoom,
  auditPart,
  getPartsByTextSearch,
  getPartsByData
} from '../../plugins/dbCommands/partManager';
import type {
  CartItem,
  PartSchema,
  SortType,
  TextSearchPage,
  User,
  UserState,
} from '../../plugins/interfaces';
import Cacher from '../../plugins/Cacher';
import TextSearch from '../../plugins/TextSearchClass';
import { arrayToCSV, downloadCSV, replaceLinksWithAnchors } from '../../plugins/CommonMethods';
import { DEFAULT_BUILDING, TEXT_SEARCH_PAGE_SIZE } from '../../plugins/Constants';

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
let currentBuilding = ref(DEFAULT_BUILDING);
let users:User[]
let kiosks:User[]
let loading = ref(false)

// Default building is Ogden - 3
let parts: Ref<PartSchema[]> = ref([]);
let showAdvanced = ref(false);
let searchObject = new TextSearch(textSearchCallback, advancedSearchCallback)

onBeforeMount(async ()=>{
  // Set loader
  loading.value = true
  // Load users n shit
  users = await Cacher.loadAllUsersFromAPISync()
  kiosks = Cacher.getKiosks()
  // unset loader
  loading.value = false
})

function textSearchCallback(buildingNum: number, pageNum: number, searchString: string, sortString: string, sortDir: SortType) {
  return new Promise<TextSearchPage>((res)=>{
    getPartsByTextSearch(http, searchString, pageNum, buildingNum, sortString, sortDir, (data: any, err) => {
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

function advancedSearchCallback(_buildingNum: number, pageNum: number, searchObject: PartSchema, sortString: string, sortDir: SortType) {
  return new Promise<TextSearchPage>((res)=>{
    searchObject['advanced'] = 'true';
    searchObject['pageNum'] = pageNum;
    searchObject['pageSize'] = TEXT_SEARCH_PAGE_SIZE;
    searchObject['sortString'] = sortString
    searchObject['sortDir'] = sortDir
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
  setTimeout(()=>replaceLinksWithAnchors(document, 'notes-with-links'),0)
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
  part: PartSchema,
  kq: number
) {
  request.building = store.state.user.building
  // Send creation details to API
  // if(part.serialized) {
  //   createNewPartRecords(http, request, owner, async (records, err) => {
  //     if (err) {
  //       return errorHandler(err);
  //     }
  //     // Display confirmation
  //     displayMessage('Successfully added to inventory');
  //     // Refresh parts list
  //     searchObject.forceReloadPage()
  //     let n = currentPart.value.nxid!
  //     // Reset
  //     toggleAdd({});
  //     toggleAdd(await Cacher.getPartInfo(n));
  //   });
  // }
  // else 
  if (
    request.quantity != undefined &&
    kq != undefined &&
    request.quantity > kq 
  ) {
    request.quantity = request.quantity - kq;
    createNewPartRecords(http, request, owner, async (records, err) => {
      if (err) {
        return errorHandler(err);
      }
      // Display confirmation
      displayMessage('Successfully added to inventory');
      // Refresh parts list
      searchObject.forceReloadPage()
      let n = currentPart.value.nxid!
      // Reset
      toggleAdd({});
      toggleAdd(await Cacher.getPartInfo(n));
    });
  } else if (
    request.quantity != undefined &&
    kq != undefined &&
    request.quantity < kq
  ) {
    deleteFromPartsRoom(http, part.nxid!, kq - request.quantity, store.state.user.building!, request.location!, async (data, err)=>{
      if (err) {
            // Handle errors
          return errorHandler(err);
        }
        displayMessage(data as string);
        // Refresh parts list
        searchObject.forceReloadPage()
        let n = currentPart.value.nxid!
        // Reset
        toggleAdd({});
        toggleAdd(await Cacher.getPartInfo(n));
    }) 
  } else {
    return errorHandler('Quantity error');
  }
}

function audit(notes: string) {
  auditPart(http, currentPart.value.nxid!, notes, (data, err) => {
    if(err) {
      return errorHandler(err)
    }
    toggleAdd({});
    toggleAdd(data as PartSchema);
    displayMessage("Part audited.")
  })
}

function getCSV() {
  if(searchObject.wasLastSearchAdvanced()) {
    searchObject.forceAdvancedSearchCallback((_buildingNum: number, pageNum: number, searchObject: PartSchema, sortString: string, sortDir: SortType)=> {
      return new Promise<TextSearchPage>((res)=>{
        searchObject['advanced'] = 'true';
        searchObject['pageNum'] = pageNum;
        searchObject['pageSize'] = TEXT_SEARCH_PAGE_SIZE;
        searchObject['sortString'] = sortString
        searchObject['sortDir'] = sortDir
        searchObject['skipPagination'] = true
        // Send request to api
        getPartsByData(http, searchObject, (data, err) => {
          if (err) {
            // Send error to error handler
            return res({pages: 0, total: 0, items: []})
          }
          let response = data as any[]
          downloadCSV("advancedSearchResults", arrayToCSV(response))
          // Resolve promise
          return res({pages: 0, total: 0, items: []})
        });
      })
    })
  }
  else {
    searchObject.forceTextSearchCallback((buildingNum: number, pageNum: number, searchString: string, sortString: string, sortDir: SortType) => {
      return new Promise<TextSearchPage>((res)=>{
        getPartsByTextSearch(http, searchString, pageNum, buildingNum, sortString, sortDir, (data: any, err) => {
          if (err) {
            // Send error to error handler
            return res({pages: 0, total: 0, items: []})
          }
          let response = data as PartSchema[]
          downloadCSV("textSearchResults", arrayToCSV(response.map((p)=>{
            return {
              nxid: p.nxid,
              manufacturer: p.manufacturer,
              name: p.name,
              rack_num: p.rack_num,
              shelf_location: p.shelf_location,
              available: p.quantity,
              total: p.total_quantity
            }
          })))
          // Resolve promise
          return res({pages: 0, total: 0, items: []})
        }, undefined, true);
      })
    })
  }
}
</script>
<template>
  <LoaderComponent v-if="loading"/>
  <div v-else>
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
        <p sortName="nxid" class="hidden md:block">NXID</p>
        <p sortName="manufacturer">Manufacturer</p>
        <p sortName="name">Name</p>
        <p sortName="location" class="hidden md:block">Location</p>
        <p sortName="quantity">Quantity</p>
      </template>
      <template v-slot:searchResults>
        <PartComponent
          :view="true"
          :edit="true"
          :add="true"
          :showAudit="store.state.user.roles?.includes('view_audit_date')"
          v-for="part in parts"
          @editPartAction="toggleEdit(part)"
          @addPartAction="toggleAdd(part)"
          @viewPartAction="viewPart(part)"
          :part="part"
        />
      </template>
      <template v-slot:searchFooter>
        <input class="search-button bg-blue-400 hover:bg-blue-500 active:bg-blue-600 ml-auto block px-4" type="button" value="Download CSV" @click="getCSV"/> </template>
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
      :key="currentPart.nxid!+currentPart.audited?currentPart.audited:Date.now()"
      :users="users"
      :kiosks="kiosks.map((u)=>u.first_name + ' ' + u.last_name)"
      :buildings="buildings"
      :part="currentPart"
      :http="http"
    />
  </div>
</template>
