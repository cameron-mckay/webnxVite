<template>
  <div class="background-and-border p-4">
    <h1 class="mb-4 text-4xl">Inventory Manager Dashboard</h1>
    <div class="grid grid-cols-2">
      <RouterLink
        to="/manage/parts/create"
        class="manager-button"
      >
        Create a part
      </RouterLink>
      <RouterLink
        to="/manage/parts"
        class="manager-button"
      >
        Manage Parts
      </RouterLink>
      <RouterLink
        to="/manage/checkin"
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
