<script setup lang="ts">
import CartItemComponent from '../components/CartItemComponent.vue';

interface Props {
    http: AxiosInstance,
    store: Store<UserState>,
    router: Router,
    errorHandler: (err: Error | AxiosError | string) => void,
    displayMessage: (message: string) => void
}
// Get global objects from props
const { http, store, router, errorHandler, displayMessage } = defineProps<Props>()

</script>
<template>
    <div>
        <h1>{{ store.state.user.first_name }}'s Inventory'</h1>
        
    </div>
</template>