import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    host: true,
  },
  plugins: [vue()],
  build: {
    rollupOptions: {
      // https://rollupjs.org/guide/en/#outputmanualchunks
      output: {
        manualChunks: {
          login: ['./src/views/LoginView.vue', './src/views/RegisterView.vue'],
          essentials: [
            './src/views/Assets/AssetSearchView.vue',
            './src/views/Parts/FindPartView.vue',
            './src/views/Parts/InventoryView.vue',
            './src/views/NotFound.vue',
          ],
          'asset-extras': [
            './src/views/Assets/AssetView.vue',
            './src/views/Assets/AddUntrackedAssetView.vue',
            './src/views/Assets/EditAssetView.vue',
          ],
          'part-extras': [
            './src/views/Parts/PartHistoryView.vue',
            './src/views/Parts/PartView.vue',
          ],
          kiosk: [
            './src/views/Parts/CartView.vue',
            './src/views/Parts/CheckInView.vue',
          ],
          admin: [
            './src/views/Admin/AddToInventoryView.vue',
            './src/views/Admin/AdminDashboardView.vue',
            './src/views/Admin/AdminPartSearchView.vue',
            './src/views/Admin/AdminUserView.vue',
            './src/views/Admin/CreatePartView.vue',
            './src/views/Admin/InventoryManagerDashboardView.vue',
          ],
        },
      },
    },
  },
});
