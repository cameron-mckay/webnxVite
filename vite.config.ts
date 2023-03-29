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
          'group-login': [
            './src/views/LoginView.vue',
            './src/views/RegisterView.vue',
          ],
          'group-essentials': [
            './src/views/Assets/AssetSearchView.vue',
            './src/views/Parts/FindPartView.vue',
            './src/views/Parts/InventoryView.vue'
          ],
          'group-asset-extras': [
            './src/views/Assets/AssetView.vue',
            './src/views/Assets/AddUntrackedAssetView.vue',
            './src/views/Assets/EditAssetView.vue',
          ],
          'group-part-extras': [
            './src/views/Parts/PartHistoryView.vue',
            './src/views/Parts/PartView.vue'
          ],
          'group-kiosk': [
            './src/views/Parts/CartView.vue',
            './src/views/Parts/CheckInView.vue',
          ],
          'group-admin': [
            './src/views/Admin/AddToInventoryView.vue',
            './src/views/Admin/AdminDashboardView.vue',
            './src/views/Admin/AdminPartSearchView.vue',
            './src/views/Admin/AdminUserView.vue',
            './src/views/Admin/CreatePartView.vue',
            './src/views/Admin/InventoryManagerDashboardView.vue'
          ]
        },
      },
    },
  },
});
