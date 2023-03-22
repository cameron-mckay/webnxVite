<script setup lang="ts">
import type { Message } from "../plugins/interfaces";

// Define props
interface MessageProps {
  messages: Array<Message>;
  errors: Array<Message>;
}
// Get messages from app
const { messages, errors } = defineProps<MessageProps>();

// Delete message from array
function deleteMessage(message: Message) {
  let i = messages.indexOf(message);
  messages.splice(i, 1);
}

// Delete error on click
function deleteError(error: Message) {
  let i = errors.indexOf(error);
  errors.splice(i, 1);
}
</script>

<template>
  <div
    class="fixed top-12 left-0 z-50 mx-auto block w-full text-center text-white"
  >
    <div
      class="mx-auto mb-1 flex w-fit rounded-lg bg-red-400 p-2 transition"
      v-on:click="deleteError(error)"
      v-for="error in errors"
    >
      <p v-if="error.quantity > 1" class="text-2xl">
        {{ `${error.text}(${error.quantity})` }}
      </p>
      <p v-else class="text-2xl font-bold">{{ error.text }}</p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 384 512"
        class="ml-4 h-8 w-8 rounded-md bg-red-400 p-2 hover:bg-red-500 active:bg-red-600"
        v-on:click="deleteError(error)"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
        />
      </svg>
    </div>

    <div
      class="mx-auto mb-1 flex w-fit rounded-lg bg-green-400 p-2 transition"
      v-for="message in messages"
    >
      <p v-if="message.quantity > 1" class="text-2xl">
        {{ `${message.text}(${message.quantity})` }}
      </p>
      <p v-else class="text-2xl font-bold">{{ message.text }}</p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 384 512"
        class="ml-4 h-8 w-8 rounded-md bg-green-400 p-2 hover:bg-green-500 active:bg-green-600"
        v-on:click="deleteMessage(message)"
      >
        <path
          fill="currentColor"
          stroke="currentColor"
          d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"
        />
      </svg>
    </div>
  </div>
</template>
