<template>
    <div>
        <h1 class="text-4xl mb-4">Inventory Manager Dashboard</h1>
        <div class="grid grid-cols-2">
            <RouterLink to="/manage/parts/create"
                class="block text-center p-4 bg-green-400 hover:bg-green-500 active:bg-green-600 rounded-lg m-2">Create
                a part</RouterLink>
            <RouterLink to="/manage/parts"
                class="block text-center p-4 bg-green-400 hover:bg-green-500 active:bg-green-600 rounded-lg m-2">Manage
                Parts</RouterLink>
        </div>
    </div>
</template>
