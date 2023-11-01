import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Parts/FindPartView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/forgotPassword',
    name: 'Forgot Password',
    component: () => import('../views/SendResetEmailView.vue'),
  },
  {
    path: '/passwordReset',
    name: 'Password Reset',
    component: () => import('../views/ResetPasswordView.vue'),
  },
  {
    path: '/cart',
    name: 'Check Out',
    component: () => import('../views/Parts/CartView.vue'),
  },
  {
    path: '/checkin',
    name: 'Check In',
    component: () => import('../views/Parts/CheckInView.vue'),
  },
  {
    path: '/parts',
    name: 'Parts',
    component: () => import('../views/Parts/FindPartView.vue'),
  },
  {
    path: '/parts/view',
    name: 'Part View',
    component: () => import('../views/Parts/PartView.vue'),
  },
  {
    path: '/parts/location',
    name: 'Part Location',
    component: () => import('../views/Parts/PartLocationView.vue'),
  },
  {
    path: '/parts/view/history',
    name: 'Part History',
    component: () => import('../views/Parts/PartHistoryView.vue'),
  },
  {
    path: '/assets',
    name: 'Assets',
    component: () => import('../views/Assets/AssetSearchView.vue'),
  },
  {
    path: '/assets/add',
    name: 'Add Untracked Asset',
    component: () => import('../views/Assets/AddUntrackedAssetView.vue'),
  },
  {
    path: '/assets/edit',
    name: 'Edit Asset',
    component: () => import('../views/Assets/EditAssetView.vue'),
  },
  {
    path: '/assets/view',
    name: 'View Asset',
    component: () => import('../views/Assets/AssetView.vue'),
  },
  {
    path: '/assets/history',
    name: 'Asset History',
    component: () => import('../views/Assets/AssetHistoryView.vue'),
  },
  {
    path: '/clerk/parts',
    name: 'Part Manager',
    component: () => import('../views/Admin/AdminPartSearchView.vue'),
  },
  {
    path: '/ebay/sell',
    name: 'Sell On eBay',
    component: () => import('../views/Parts/SellOnEbay.vue'),
  },
  {
    path: '/manage/parts/create',
    name: 'Create Part',
    component: () => import('../views/Admin/CreatePartView.vue'),
  },
  {
    path: '/clerk/checkin',
    name: 'Check In Queue',
    component: () => import('../views/Admin/CheckinApprovalView.vue'),
  },
  {
    path: '/manage/checkout',
    name: 'Check Out History',
    component: () => import('../views/Admin/CheckoutHistoryView.vue'),
  },
  {
    path: '/manage/checkin',
    name: 'Check In History',
    component: () => import('../views/Admin/CheckinHistoryView.vue'),
  },
  {
    path: '/manage',
    name: 'Manage',
    component: () => import('../views/Admin/AdminDashboardView.vue'),
  },
  {
    path: '/manage/all',
    name: 'All Techs History',
    component: () => import('../views/Admin/AllTechsHistoryView.vue'),
  },
  {
    path: '/admin/users',
    name: 'User Manager',
    component: () => import('../views/Admin/AdminUserView.vue'),
  },
  {
    path: '/manage/users/analytics',
    name: 'User Analytics',
    component: () => import('../views/Admin/UserAnalyticsView.vue'),
  },
  {
    path: '/manage/user/checkouts',
    name: 'User Checkout History',
    component: () => import('../views/Admin/CheckoutHistoryView.vue'),
  },
  {
    path: '/manage/user/checkins',
    name: 'User Checkin History',
    component: () => import('../views/Admin/CheckinHistoryView.vue'),
  },
  {
    path: '/manage/user/newAssets',
    name: 'User New Asset History',
    component: () => import('../views/Admin/NewAssetsHistoryView.vue'),
  },
  {
    path: '/manage/user/assetsUpdated',
    name: 'User Asset Update History',
    component: () => import('../views/Admin/AssetUpdateHistoryView.vue'),
  },
  {
    path: '/manage/part/history',
    name: 'Part Action History',
    component: () => import('../views/Admin/PartHistoryView.vue'),
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/Parts/InventoryView.vue'),
  },
  {
    path: '/pallets',
    name: 'Pallets',
    component: () => import('../views/Pallets/PalletSearchView.vue'),
  },
  {
    path: '/pallets/add',
    name: 'Create Pallet',
    component: () => import('../views/Pallets/CreatePalletView.vue'),
  },
  {
    path: '/pallets/edit',
    name: 'Edit Pallet',
    component: () => import('../views/Pallets/EditPalletView.vue'),
  },
  {
    path: '/pallets/view',
    name: 'View Pallet',
    component: () => import('../views/Pallets/PalletView.vue'),
  },
  {
    path: '/pallets/history',
    name: 'Pallet History',
    component: () => import('../views/Pallets/PalletHistoryView.vue'),
  },
  {
    path: '/:catchall(.*)',
    name: '404',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
