<script setup lang="ts">
interface ErrorProps {
    message: string
}

const props = defineProps<ErrorProps>()


</script>

<template>
    <div class="error">
        <p>{{ props.message }}</p>
    </div>
</template>

<style scoped>
.error {
    display: block;
    color: white;
    font-family: sans-serif;
    width: 100%;
    margin: 0 auto;
    position: fixed;
    text-align: center;
}

.error p {
    background-color: #ff424f;
    max-width: 800px;
    margin: 0 auto;
    padding: 10px;
    border-radius: 25px;
}
</style>