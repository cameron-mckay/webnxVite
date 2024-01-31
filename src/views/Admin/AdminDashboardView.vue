<script lang='ts' setup>
import { UserState } from '../../plugins/interfaces';
import { Store } from 'vuex';

interface Props {
  store: Store<UserState>;
}

let {store} = defineProps<Props>()
</script>
<template>
  <div class="background-and-border p-4">
    <h1 class="mb-4 text-4xl">
      Management Dashboard
    </h1>
    <div>
      <h1
        class="mt-4 text-xl ml-2"
        v-if="store.state.user.roles?.includes('manage_parts')||
          store.state.user.roles?.includes('view_analytics')||
          store.state.user.roles?.includes('process_checkins')||
          store.state.user.roles?.includes('sell_on_ebay')"
      >
        Parts
      </h1>
      <div class="grid grid-cols-2 md:grid-cols-3">
        <RouterLink
          to="/manage/parts/create"
          class="manager-button"
          v-if="store.state.user.roles?.includes('manage_parts')"
        >
          Create a part
        </RouterLink>
        <RouterLink
          to="/clerk/parts"
          class="manager-button"
          v-if="store.state.user.roles?.includes('manage_parts')"
        >
          Manage Parts
        </RouterLink>
        <RouterLink
          to="/manage/part/history"
          class="manager-button"
          v-if="store.state.user.roles?.includes('manage_parts')||store.state.user.roles?.includes('view_analytics')"
        >
          Part Action History
        </RouterLink>

        <RouterLink
          v-if="store.state.user.roles?.includes('process_checkins')"
          to="/clerk/checkin"
          class="manager-button"
        >
          Check In Queue
        </RouterLink>
        <RouterLink
          v-if="store.state.user.roles?.includes('process_checkins')||store.state.user.roles?.includes('view_analytics')"
          to="/manage/checkout"
          class="manager-button"
        >
          Check Out History
        </RouterLink>
        <RouterLink
          v-if="store.state.user.roles?.includes('process_checkins')||store.state.user.roles?.includes('view_analytics')"
          to="/manage/checkin"
          class="manager-button"
        >
          Check In History
        </RouterLink>
        <RouterLink
          v-if="store.state.user.roles?.includes('sell_on_ebay')||store.state.user.roles?.includes('view_analytics')"
          to="/ebay/history"
          class="manager-button"
        >
          Ebay Sales History
        </RouterLink>
      </div>
    </div>
    <div>
      <h1
        class="mt-4 text-xl ml-2"
        v-if="store.state.user.roles?.includes('manage_users')||
          store.state.user.roles?.includes('view_analytics')"
      >
        Users
      </h1>
      <div class="grid grid-cols-2 md:grid-cols-3">
        <RouterLink
          v-if="store.state.user.roles?.includes('view_analytics')"
          to="/manage/users/analytics"
          class="manager-button"
        >
          User Analytics
        </RouterLink>
        <RouterLink
          v-if="store.state.user.roles?.includes('manage_users')"
          to="/admin/users"
          class="manager-button"
        >
          Manage Users
        </RouterLink>
        <RouterLink
          v-if="store.state.user.roles?.includes('view_analytics')"
          to="/manage/all"
          class="manager-button"
        >
          All Techs History
        </RouterLink>
      </div>
    </div>
    <div>
      <h1
        class="mt-4 text-xl ml-2"
        v-if="store.state.user.roles?.includes('view_analytics')"
      >
        Assets
      </h1>
      <div class="grid grid-cols-2 md:grid-cols-3">
        <RouterLink
          v-if="store.state.user.roles?.includes('view_analytics')"
          to="/manage/user/assetsUpdated"
          class="manager-button"
        >
          Asset Update History
        </RouterLink>
        <RouterLink
          v-if="store.state.user.roles?.includes('view_analytics')"
          to="/manage/user/newAssets"
          class="manager-button"
        >
          New Asset History
        </RouterLink>
      </div>
    </div>
    <div>
      <h1
        class="mt-4 text-xl ml-2"
        v-if="store.state.user.roles?.includes('view_analytics')"
      >
        Pallets
      </h1>
      <div class="grid grid-cols-2 md:grid-cols-3">
        <RouterLink
          v-if="store.state.user.roles?.includes('view_analytics')"
          to="/manage/user/palletsUpdated"
          class="manager-button"
        >
          Pallet Update History
        </RouterLink>
        <RouterLink
          v-if="store.state.user.roles?.includes('view_analytics')"
          to="/manage/user/newPallets"
          class="manager-button"
        >
          New Pallet History
        </RouterLink>
      </div>
    </div>
  </div>
</template>
