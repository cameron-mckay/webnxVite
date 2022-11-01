<script setup lang="ts">
import type { Message } from '../plugins/interfaces';

// Define props
interface MessageProps {
    messages: Array<Message>,
    errors: Array<Message>
}
// Get messages from app
const { messages, errors } = defineProps<MessageProps>()

// Delete message from array
function deleteMessage(message: Message) {
    let i = messages.indexOf(message);
    messages.splice(i, 1)
}

// Delete error on click
function deleteError(error: Message) {
    let i = errors.indexOf(error);
    messages.splice(i, 1)
}
</script>

<template>
    <div class="fixed z-50 text-white text-center mx-auto block w-full top-12 left-0 ">
        <div class="bg-red-400 max-w-3xl mb-1 mx-auto p-2 rounded-full hover:bg-red-500 transition" v-on:click="deleteError(error)" v-for="error in errors">
            <p v-if="error.quantity > 1">{{ `${error.text}(${error.quantity})` }}</p>
            <p v-else>{{ error.text }}</p>
        </div>
        <div class="bg-green-400 max-w-3xl mb-1 mx-auto p-2 rounded-full hover:bg-green-500 transition" v-on:click="deleteMessage(message)" v-for="message in messages">
            <p v-if="message.quantity > 1">{{ `${message.text}(${message.quantity})` }}</p>
            <p v-else>{{ message.text }}</p>
        </div>
    </div>
</template>