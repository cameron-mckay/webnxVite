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
    path: '/manage',
    name: 'Inventory Manager Dashboard',
    component: () => import('../views/Admin/InventoryManagerDashboardView.vue'),
  },
  {
    path: '/manage/parts',
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
    path: '/admin',
    name: 'Admin Dashboard',
    component: () => import('../views/Admin/AdminDashboardView.vue'),
  },
  {
    path: '/admin/parts/create',
    name: 'Create Part Admin',
    component: () => import('../views/Admin/CreatePartView.vue'),
  },
  {
    path: '/admin/parts',
    name: 'Part Manager Admin',
    component: () => import('../views/Admin/AdminPartSearchView.vue'),
  },
  {
    path: '/admin/users',
    name: 'User Manager',
    component: () => import('../views/Admin/AdminUserView.vue'),
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('../views/Parts/InventoryView.vue'),
  },
  {
    path: '/:catchall(.*)',
    name: '404',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(/*import.meta.env.BASE_URL*/),
  routes,
});

export default router;
