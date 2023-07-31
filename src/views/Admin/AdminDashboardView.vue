<script lang='ts' setup>
import { UserState } from '../../plugins/interfaces';
import { Store } from 'vuex';
import { onMounted, onBeforeMount, onActivated, ref } from 'vue';

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
    <h1 class="mb-4 text-4xl">Management Dashboard</h1>
    <div class="grid grid-cols-2">
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
        v-if="admin"
        to="/admin/users"
        class="manager-button"
      >
        Manage Users
      </RouterLink>
      <RouterLink
        v-if="lead||admin"
        to="/manage/users/analytics"
        class="manager-button"
      >
        User Analytics
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
    </div>
  </div>
</template>
