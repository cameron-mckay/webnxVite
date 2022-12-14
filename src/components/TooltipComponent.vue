<script setup lang="ts">
interface Props {
    text: string
}

const { text } = defineProps<Props>()

</script>
<template>
    <div class="relative flex flex-col items-center group w-full">
        <slot>
        
        </slot>
        <div class="absolute top-10 flex-col items-center hidden mb-6 group-hover:flex text-center transition pointer-events-none">
            <div class="w-3 h-3 -rotate-45 bg-zinc-400"></div>
            <span class="relative z-10 p-2 -mt-2 text-sm leading-none whitespace-no-wrap bg-zinc-400 shadow-lg rounded-lg">{{ text }}</span>
        </div>
    </div>
</template>