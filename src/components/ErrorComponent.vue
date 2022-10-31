<script setup lang="ts">
interface ErrorProps {
    messages: Array<string>
}

const { messages } = defineProps<ErrorProps>()

function deleteMessage(message: string) {
    let i = messages.indexOf(message);
    messages.splice(i, 1)
}
</script>

<template>
    <div class="fixed z-50 text-white text-center mx-auto block w-full">
        <div class="bg-red-400 max-w-3xl mb-1 mx-auto p-2 rounded-full hover:bg-red-500 transition" v-on:click="deleteMessage(message)" v-for="message in messages">
            <p>{{ message }}</p>
        </div>
    </div>
</template>