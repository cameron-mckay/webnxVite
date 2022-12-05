<template>
    <div>
        <div class="w-full h-full top-0 left-0 fixed z-50 pointer-events-auto bg-zinc-700 opacity-50" @click="$emit('toggle')"></div>
        <div class="w-full h-full top-0 left-0 fixed z-50 pointer-events-none">
            <div class="p-4 rounded-xl block bg-zinc-300 top-40 mx-auto mt-32 max-w-xl shadow-lg z-50 pointer-events-auto">
                <slot></slot>
            </div>
        </div>
    </div>
</template>