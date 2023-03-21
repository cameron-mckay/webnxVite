<template>
  <div class="background-and-border p-4">
    <h1 class="mb-4 text-4xl">Inventory Manager Dashboard</h1>
    <div class="grid grid-cols-2">
      <RouterLink
        to="/manage/parts/create"
        class="m-2 block rounded-lg bg-green-400 p-4 text-center hover:bg-green-500 active:bg-green-600"
        >Create a part</RouterLink
      >
      <RouterLink
        to="/manage/parts"
        class="m-2 block rounded-lg bg-green-400 p-4 text-center hover:bg-green-500 active:bg-green-600"
        >Manage Parts</RouterLink
      >
    </div>
  </div>
</template>
