<script setup lang="ts">

</script>

<template>
    <div class="grid grid-cols-2">
        <RouterLink to="/admin/parts/create" class="block text-center p-4 bg-orange-400 hover:bg-orange-500 active:bg-orange-600 rounded-lg m-2">Create a part</RouterLink>
        <RouterLink to="/admin/parts/manage" class="block text-center p-4 bg-orange-400 hover:bg-orange-500 active:bg-orange-600 rounded-lg m-2">Manage Parts</RouterLink>
        <RouterLink to="/admin/users" class="block text-center p-4 bg-orange-400 hover:bg-orange-500 active:bg-orange-600 rounded-lg m-2">Manage Users</RouterLink>
        <!-- <RouterLink to="/admin/parts/create" class="block text-center p-4 bg-orange-400 hover:bg-orange-500 active:bg-orange-600 rounded-lg m-2">Check In</RouterLink> -->
    </div>
</template>