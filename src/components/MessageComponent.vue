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
    <div class="message">
        <div v-on:click="deleteMessage(message)" v-for="message in messages">
            <p>{{ message }}</p>
        </div>
    </div>
</template>

<style scoped>
.message {
    display: block;
    color: white;
    font-family: sans-serif;
    width: 100%;
    margin: 0 auto;
    position: fixed;
    text-align: center;
}

.message p {
    background-color: #42ff4f;
    max-width: 800px;
    margin: 1em auto;
    padding: 10px;
    border-radius: 25px;
    opacity: 95%;
}

.message p:hover {
    opacity: 50%;
}
</style>