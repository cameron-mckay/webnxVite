<template>
    <div class="overflow-y-scroll w-full h-full top-0 left-0 z-50 fixed pointer-events-auto">
        <div class="w-full h-full top-0 left-0 fixed z-40 bg-zinc-700 opacity-50 pointer-events-none"></div>
        <div class="w-full h-full top-0 left-0 fixed z-30 pointer-events-auto -ml-8" @click="$emit('toggle')"></div>
        <div
            class="relative p-4 rounded-xl block bg-zinc-300 mt-32 mx-auto max-w-xl shadow-lg z-50 pointer-events-auto">
            <slot></slot>
        </div>
    </div>
</template>
