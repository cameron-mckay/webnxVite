<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch } from 'vue';
import InventoryPartHeaderComponent from './InventoryPartHeaderComponent.vue';
import LoaderComponent from '../GenericComponents/LoaderComponent.vue';
import {
  LoadedCartItem,
  PartSchema,
  User,
} from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';
import InventoryPartComponent from './InventoryPartComponent.vue';
import Cacher from '../../plugins/Cacher';
interface Props {
  inventory: Inventory;
  forceSourceUser?: User;
  forceDestUser?: User;
  submitButtonText?: string;
  overrideSourceText?: string;
  serializeDestList?: boolean;
  alwaysShowDest?: boolean;
}

let { inventory, forceSourceUser, forceDestUser, serializeDestList, submitButtonText, alwaysShowDest } = defineProps<Props>()

let sourceUser = ref({} as User)
let destUser = ref({} as User)
let sourceInv = ref([] as LoadedCartItem[])
let destInv = ref([] as LoadedCartItem[])
let sourceUsers = ref([] as User[])
let destUsers = ref([] as User[])
let loading = ref(true)
let emit = defineEmits(['submit'])

onMounted(()=>{
  inventory.registerRefreshCallback(refreshInv)
  sourceUsers.value = inventory.getSourceUsers()
  destUsers.value = inventory.getDestUsers()
  for (let u of sourceUsers.value) {
    if(u._id==inventory.thisUser._id) {
      sourceUser.value = u
    }
  }
  for(let u of destUsers.value) {
    if(u.default)
      destUser.value = u
  }
  refreshInv()
})

function moveToDestList(part: PartSchema, difference: number, serial?: string) {
  // User the helper function
  inventory.moveToDestList(part, difference, serial)
}

function moveToSourceList(part: PartSchema, difference: number, serial?: string) {
  // Use the helper function
  inventory.moveToSourceList(part, difference, serial)
}

// Uses the loader to force a component refresh
function refreshInv() {
  // Set loader
  loading.value = true
  // Get inventories from helper class
  sourceInv.value = inventory.getSourceInv()
  destInv.value = inventory.getDestInv()
  // Unset loaer
  loading.value = false
}

// Watch for source user changes
watch(sourceUser, async (newVal) => {
  // Set loading
  loading.value = true
  destUser.value = {}
  // Clear the dest user
  if(sourceUser.value._id!=inventory.thisUser._id)
    for(let u of destUsers.value) {
      if(u._id==inventory.thisUser._id)
        destUser.value = u
    }
  else
    for(let u of destUsers.value) {
      if(u.default)
        destUser.value = u
    }
  // Load the inventory of the new user
  await inventory.loadSourceInv(newVal._id!)
})

// Override the submit button
function submit() {
  emit("submit", sourceUser.value, destUser.value, Cacher.unloadParts(destInv.value), async ()=>{
    // Reload the source inventory after the submission is successful
    loading.value = true;
    await inventory.loadSourceInv(sourceUser.value._id!)
  })
}

</script>
<template>
  <div>
    <form @submit.prevent="submit" v-on:keydown.enter.prevent>
      <div>
        <div class="mb-4 flex flex-wrap justify-between">
          <h1 v-if="overrideSourceText" class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">{{overrideSourceText}}</h1>
          <h1 v-else class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
            {{ sourceUser._id == inventory.thisUser._id ? "Your Inventory" : (sourceUser.last_name ? sourceUser.first_name + "'s Inventory" : sourceUser.first_name) }}
          </h1>
          <div class="flex" v-if="!forceSourceUser">
            <p class="my-auto mr-2">User:</p>
            <select required v-model="sourceUser" class="mt-auto">
                <option 
                  v-for="user of sourceUsers" 
                  :value="user"
                >
                  {{ inventory.thisUser._id == user._id ? "Your inventory" : (user.last_name ? user.first_name + " " + user.last_name : user.first_name) }}
                </option>
            </select>
          </div>
        </div>
        <!-- Show loader if loading -->
        <LoaderComponent v-if="loading"/>
        <!-- Show inventory if there's items -->
        <div v-else-if="sourceInv.length > 0">
          <InventoryPartHeaderComponent/>
          <div class="md:animate-bottom">
            <InventoryPartComponent
              :isCurrentUser="false"
              v-for="item in sourceInv"
              :part="item.part"
              :quantity="item.quantity"
              :serial="item.serial"
              :item="item"
              @movePart="moveToDestList"
            />
          </div>
        </div>
        <!-- Show message if current user is none {} -->
        <div v-else-if="JSON.stringify(sourceUser) == JSON.stringify({})">
          <p>Please select a user to get started...</p>
        </div>
        <!-- Show if inventory is empty -->
        <div v-else>
          <p>Inventory is empty...</p>
        </div>
        <!-- Transfer list header -->
        <div v-if="destInv.length > 0 || (alwaysShowDest&&!loading)">
          <div class="my-4 flex flex-wrap justify-between">
            <!-- Override transfer list title -->
            <slot>
              <h1 class="my-2 inline-block w-full text-4xl md:my-0 md:w-fit">
                Transfer List
              </h1>
            </slot>
            <!-- Pick destination user -->
            <div class="flex" v-if="!forceDestUser">
              <p class="my-auto mr-2">To:</p>
              <select required v-model="destUser" class="mt-auto">
                <option 
                  v-for="user of destUsers" 
                  :value="user"
                  :disabled="sourceUser._id == user._id"
                >
                  {{ inventory.thisUser._id == user._id ? "Your inventory" : (user.last_name ? user.first_name + " " + user.last_name : user.first_name) }}
                </option>
              </select>
            </div>
          </div>
          <!-- Special warning messages go here -->
          <div>
            <p
              class="my-2 w-full rounded-md bg-red-400 p-2"
              v-if="
                destUser._id == 'testing' && !inventory.thisUser.roles?.includes('transfer_out_testing')
              "
            >
              Your current role does not allow you to transfer parts from the
              testing center to your inventory.  You will not be able to return them
              to your inventory after they are transferred.
            </p>
            <p
              class="my-2 w-full rounded-md bg-red-400 p-2"
              v-if="destUser._id == 'lost'"
            >
              This action will mark these parts as lost and make them unusable
            </p>
            <p
              class="my-2 w-full rounded-md bg-red-400 p-2"
              v-if="destUser._id == 'broken'"
            >
              This action will mark these parts as broken and make them unusable
            </p>
            <p
              class="my-2 w-full rounded-md bg-red-400 p-2"
              v-if="destUser._id == 'deleted'"
            >
              This action will mark these parts as deleted and make them
              unusable.
              <br />
              <span class="font-bold">
                *** This option should only be used to correct clerical errors.
                ***
              </span>
            </p>
          </div>
          <InventoryPartHeaderComponent
            v-if="destInv.length > 0"
          />
          <p v-else>No parts here...</p>
          <InventoryPartComponent
            :isCurrentUser="true"
            v-for="item in destInv"
            :item="item"
            :part="item.part"
            :quantity="item.quantity"
            :serial="item.serial"
            :untracked="!(item.part.serialized&&item.serial)&&serializeDestList"
            :serialOptional="serializeDestList"
            :key="item.part.nxid!+item.serial+Date.now()+destInv.indexOf(item)"
            :maxQuantity="inventory.getMaxQuantity(item.part.nxid!)"
            @movePart="moveToSourceList"
          />
          <!-- Centered submit button -->
          <div class="flex justify-center">
            <input type="submit" class="submit mx-1" :value="submitButtonText ? submitButtonText : 'Move Parts'" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
