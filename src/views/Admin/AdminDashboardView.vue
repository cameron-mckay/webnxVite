<template>
  <div class="background-and-border p-4">
    <h1 class="mb-4 text-4xl">Admin Dashboard</h1>
    <div class="grid grid-cols-2">
      <RouterLink
        to="/manage/parts/create"
        class="m-2 block rounded-lg bg-orange-400 p-4 text-center hover:bg-orange-500 active:bg-orange-600"
      >
        Create a part
      </RouterLink>
      <RouterLink
        to="/manage/parts"
        class="m-2 block rounded-lg bg-orange-400 p-4 text-center hover:bg-orange-500 active:bg-orange-600"
      >
        Manage Parts
      </RouterLink>
      <RouterLink
        to="/admin/users"
        class="m-2 block rounded-lg bg-orange-400 p-4 text-center hover:bg-orange-500 active:bg-orange-600"
      >
        Manage Users
      </RouterLink>
      <RouterLink
        to="/manage/checkin"
        class="m-2 block rounded-lg bg-orange-400 p-4 text-center hover:bg-orange-500 active:bg-orange-600"
      >
        Check In Queue
      </RouterLink>
      <RouterLink
        to="/manage/checkout"
        class="m-2 block rounded-lg bg-orange-400 p-4 text-center hover:bg-orange-500 active:bg-orange-600"
      >
        Check Out History
      </RouterLink>
    </div>
  </div>
</template>
