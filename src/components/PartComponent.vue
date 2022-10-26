<script setup lang="ts">
import { PartSchema } from '../model/part'
import { onMounted } from 'vue'

interface Props {
    part: PartSchema,
    img_src: string
}
const { part, img_src } = defineProps<Props>()

onMounted(() => {
    console.log(part)
})

</script>

<template>
    <div class="part">
        <div class="grid">
            <p>{{ part.nxid }}</p>
            <p>{{ `${part.manufacturer} ${part.name}` }}</p>
            <p>{{ part.type }}</p>
            <p>{{ part.location }}</p>
            <p>{{ part.quantity }}</p>
            <img :src="img_src" v-on:click="$emit('partAction')">
        </div>
        <div class="hover">
            <p>test</p>
            <p>test 2</p>
        </div>
    </div>
</template>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr 1fr 1fr 1fr;
    position: relative;
}

.grid>p {
    padding: 10px;
    border: 1px solid grey;
    margin: 0 -1px -1px 0;
}

.hover {
    display: none;
}

.part:hover>.hover {
    display: block;
    position: absolute;
}

.part:hover>.hover>p {
    margin: 0;
}

.grid img {
    width: 50px;
}
</style>