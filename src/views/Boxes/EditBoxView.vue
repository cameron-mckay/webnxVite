<script setup lang="ts">
import type { AxiosInstance } from 'axios';
import { onBeforeMount, ref } from 'vue';
import type { Router } from 'vue-router';
import type { Store } from 'vuex';
import BackButton from '../../components/GenericComponents/Buttons/BackButton.vue';
import LoaderComponent from '../../components/GenericComponents/LoaderComponent.vue';
import Cacher from '../../plugins/Cacher';
import AssetPartInventoryComponent from '../../components/AssetComponents/AssetPartInventoryComponent.vue';
import type {
  UserState,
BoxSchema
} from '../../plugins/interfaces';
import Inventory from '../../plugins/InventoryClass';
import { updateBox } from '../../plugins/dbCommands/boxManager';
import BoxManagerComponent from '../../components/BoxComponents/BoxManagerComponent.vue';

interface Props {
  http: AxiosInstance;
  store: Store<UserState>;
  router: Router;
}

const { http, store, router } = defineProps<Props>();

let oldBox = {} as BoxSchema;
let loading = ref(false)
let processingSubmission = false
let inventory:Inventory;
let correction = ref(false)

onBeforeMount(async () => {
  if (router.currentRoute.value.query.box_tag) {
    loading.value = true
    // get asset tag from url
    await Cacher.loadAllUsersFromAPISync()
    inventory = new Inventory(store.state.user)
    let nxid = router.currentRoute.value.query.box_tag as string;
    await inventory.loadSourceInv(inventory.thisUser._id!)
    await inventory.loadDestFromBox(nxid)
    // Check mode
    // Set asset to res
    oldBox = await Cacher.getBox(nxid);
    // Save a copy for reset value
    loading.value = false
    // Get user inventory from api
  }
});

function boxSubmit(updatedBox: BoxSchema, correction: boolean) {
  if(processingSubmission)
    return
  processingSubmission = true
  let unloadedParts = Cacher.unloadParts(inventory.getDestInv())

  updateBox(http, updatedBox, unloadedParts, correction, (data, err)=>{
    processingSubmission = false
    if (err) {
        return Cacher.errorHandler(err);
    }
    if(updatedBox.box_tag) {
      router.push({ name: 'View Box', query: { box_tag: updatedBox.box_tag } });
    }
    else {
      router.back();
    }
  })
}

async function reset() {
  // Reset inventory component
  inventory.setCorrection(correction.value)
  await inventory.loadSourceInv(inventory.thisUser._id!)
  await inventory.loadDestFromBox(oldBox.box_tag!)
}

function correctionChanged(newCorrection: boolean) {
  correction.value = newCorrection
  reset()
}
</script>

<template>
  <LoaderComponent class="mt-16" v-if="loading"/>
  <div
    v-else
    class="background-and-border p-4"
  >
    <BackButton @click="router.options.history.state.back ? router.back() : router.push('/boxes')" class="mr-2 mb-2"/>
    <BoxManagerComponent
      :title="'Edit Box:'"
      :submitText="'Update Box'"
      :strict="true"
      :oldBox="oldBox"
      :isAdmin="store.state.user.roles?.includes('correct_boxes')"
      :untracked="oldBox.migrated?true:false"
      @boxSubmit="boxSubmit"
      @boxReset="reset"
      @correctionChanged="correctionChanged"
    >
      <AssetPartInventoryComponent 
        :inventory="inventory"
        :correction="correction"
        :untracked="oldBox.migrated?true:false"
      />
    </BoxManagerComponent>
  </div>
</template>
