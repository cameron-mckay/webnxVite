import { createRouter, createWebHistory } from 'vue-router'
import AddUntrackedAsset from '../views/AddUntrackedAssetView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AdminPartSearchView from '../views/AdminPartSearchView.vue'
import AdminUserView from '../views/AdminUserView.vue'
import AssetSearchView from '../views/AssetSearchView.vue'
import AssetView from '../views/AssetView.vue'
import CartView from '../views/CartView.vue'
import CheckInView from '../views/CheckInView.vue'
import CreatePartView from '../views/CreatePartView.vue'
import FindPartView from '../views/FindPartView.vue'
import InventoryManagerDashboardView from '../views/InventoryManagerDashboardView.vue'
import InventoryView from '../views/InventoryView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
import PartHistoryView from '../views/PartHistoryView.vue'
import PartView from '../views/PartView.vue'
import RegisterView from '../views/RegisterView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: FindPartView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/login',
    name: 'Login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: LoginView
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartView
  },
  {
    path: '/checkin',
    name: 'Cart',
    component: CheckInView
  },
  {
    path: '/parts',
    name: 'Parts',
    component: FindPartView
  },
  {
    path: '/parts/view',
    name: 'Part View',
    component: PartView
  },
  {
    path: '/parts/view/history',
    name: 'Part History',
    component: PartHistoryView
  },
  {
    path: '/assets',
    name: 'Assets',
    component: AssetSearchView
  },
  {
    path: '/assets/add',
    name: 'Add Untracked Asset',
    component: AddUntrackedAsset
  },
  {
    path: '/assets/edit',
    name: 'Edit Asset',
    component: AssetView
  },
  {
    path: '/manage',
    name: 'Inventory Manager Dashboard',
    component: InventoryManagerDashboardView
  },
  {
    path: '/manage/parts',
    name: 'Part Manager',
    component: AdminPartSearchView
  },
  {
    path: '/manage/parts/create',
    name: 'Create Part',
    component: CreatePartView
  },
  {
    path: '/admin',
    name: 'Admin Dashboard',
    component: AdminDashboardView
  },
  {
    path: '/admin/parts/create',
    name: 'Create Part Admin',
    component: CreatePartView
  },
  {
    path: '/admin/parts',
    name: 'Part Manager Admin',
    component: AdminPartSearchView
  },
  {
    path: '/admin/users',
    name: 'User Manager',
    component: AdminUserView
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: InventoryView
  },
  {
    path: '/:catchall(.*)',
    name: '404',
    component: NotFound
  },
]

const router = createRouter({
  history: createWebHistory(/*import.meta.env.BASE_URL*/),
  routes
})

export default router
