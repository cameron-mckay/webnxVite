<script setup lang="ts">
// Define props
interface MessageProps {
    messages: Array<string>
}

// Get messages from app
const { messages } = defineProps<MessageProps>()

// Delete message from array
function deleteMessage(message: string) {
    let i = messages.indexOf(message);
    messages.splice(i, 1)
}
</script>

<template>
    <div class="fixed z-40 text-white text-center mx-auto block w-full">
        <div class="bg-green-400 max-w-3xl mb-1 mx-auto p-2 rounded-full hover:bg-green-500 transition" v-on:click="deleteMessage(message)" v-for="message in messages">
            <p>{{ message }}</p>
        </div>
    </div>
</template>