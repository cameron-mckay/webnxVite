<script lang='ts' setup>
import { UserState } from '../../plugins/interfaces';
import { Store } from 'vuex';
import { onMounted, ref } from 'vue';

interface Props {
  store: Store<UserState>;
}

let {store} = defineProps<Props>()

let kiosk = ref(false);
let tech = ref(false);
let clerk = ref(false);
let ebay = ref(false);
let admin = ref(false);
let lead = ref(false)

function setRoles(){
    let roles = store.state.user.roles
    if(roles) {
      kiosk.value = roles.includes("kiosk")
      lead.value = roles.includes("lead")
      tech.value = roles.includes("tech")
      clerk.value = roles.includes("clerk")
      ebay.value = roles.includes("ebay")
      admin.value = roles.includes("admin")
      lead.value = roles.includes("lead")
    }
    else {
      setTimeout(setRoles,100)
    }
}

onMounted(async()=>{
  setRoles()
})
</script>
<template>
  <div class="background-and-border p-4">
    <h1 class="mb-4 text-4xl">
      Management Dashboard
    </h1>

    <div>
      <h1 class="mt-4 text-xl ml-2">
        Parts
      </h1>
      <div class="grid grid-cols-3">
        <RouterLink
          to="/manage/parts/create"
          class="manager-button"
        >
          Create a part
        </RouterLink>
        <RouterLink
          v-if="clerk||admin"
          to="/clerk/parts"
          class="manager-button"
        >
          Manage Parts
        </RouterLink>
        <RouterLink
          to="/manage/part/history"
          class="manager-button"
        >
          Part Action History
        </RouterLink>

        <RouterLink
          v-if="clerk||admin"
          to="/clerk/checkin"
          class="manager-button"
        >
          Check In Queue
        </RouterLink>
        <RouterLink
          to="/manage/checkout"
          class="manager-button"
        >
          Check Out History
        </RouterLink>
        <RouterLink
          to="/manage/checkin"
          class="manager-button"
        >
          Check In History
        </RouterLink>
      </div>
    </div>


    <div>
      <h1 class="mt-4 text-xl ml-2" v-if="lead||admin">
        Users
      </h1>
      <div class="grid grid-cols-3">
        <RouterLink
          v-if="lead||admin"
          to="/manage/users/analytics"
          class="manager-button"
        >
          User Analytics
        </RouterLink>
        <RouterLink
          v-if="admin"
          to="/admin/users"
          class="manager-button"
        >
          Manage Users
        </RouterLink>
        <RouterLink
          to="/manage/all"
          class="manager-button"
        >
          All Techs History
        </RouterLink>
      </div>
    </div>

    <div>
      <h1 class="mt-4 text-xl ml-2">
        Assets
      </h1>
      <div class="grid grid-cols-3">
        <RouterLink
          to="/manage/user/assetsUpdated"
          class="manager-button"
        >
          Asset Update History
        </RouterLink>
        <RouterLink
          to="/manage/user/newAssets"
          class="manager-button"
        >
          New Asset History
        </RouterLink>
      </div>
    </div>


    <div>
      <h1 class="mt-4 text-xl ml-2">
        Pallets
      </h1>
      <div class="grid grid-cols-3">
        <RouterLink
          to="/manage/user/palletsUpdated"
          class="manager-button"
        >
          Pallet Update History
        </RouterLink>
        <RouterLink
          to="/manage/user/newPallets"
          class="manager-button"
        >
          New Pallet History
        </RouterLink>
      </div>
    </div>
  </div>
</template>
