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
          login: [
            './src/views/LoginView.vue',
            './src/views/RegisterView.vue',
            './src/views/SendResetEmailView.vue',
            './src/views/ResetPasswordView.vue'
          ],
          essentials: [
            './src/views/Assets/AssetSearchView.vue',
            './src/views/Parts/FindPartView.vue',
            './src/views/Parts/InventoryView.vue',
            './src/views/NotFound.vue',
          ],
          extras: [
            './src/views/Assets/AssetView.vue',
            './src/views/Assets/AddUntrackedAssetView.vue',
            './src/views/Assets/EditAssetView.vue',
            './src/views/Assets/AssetHistoryView.vue',
            './src/views/Parts/PartHistoryView.vue',
            './src/views/Parts/PartView.vue',
            './src/views/Parts/PartLocationView.vue',
          ],
          kiosk: [
            './src/views/Parts/CartView.vue',
            './src/views/Parts/CheckInView.vue',
          ],
          admin: [
            './src/views/Admin/AdminDashboardView.vue',
            './src/views/Admin/CheckinApprovalView.vue',
            './src/views/Admin/CheckoutHistoryView.vue',
            './src/views/Admin/AdminPartSearchView.vue',
            './src/views/Admin/AdminUserView.vue',
            './src/views/Admin/CreatePartView.vue',
            './src/views/Parts/SellOnEbay.vue',
          ],
          analytics: [
            './src/views/Admin/UserAnalyticsView.vue',
            './src/views/Admin/UserCheckinHistoryView.vue',
            './src/views/Admin/UserCheckoutHistoryView.vue',
            './src/views/Admin/UserAssetUpdateHistoryView.vue',
            './src/views/Admin/UserNewAssetsHistoryView.vue',
          ]
        },
      },
    },
  },
});
