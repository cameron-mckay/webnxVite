import { createRouter, createWebHistory } from 'vue-router'
import FindPartView from '../views/FindPartView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
import CreatePartView from '../views/CreatePartView.vue'
import CartView from '../views/CartView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import AdminPartSearchView from '../views/AdminPartSearchView.vue'
import EditPartView from '../views/EditPartView.vue'
import AdminUserView from '../views/AdminUserView.vue'

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
    path: '/parts',
    name: 'Parts',
    component: FindPartView
  },
  {
    path: '/admin',
    name: 'Admin Dashboard',
    component:AdminDashboardView
  },
  {
    path: '/admin/parts/create',
    name: 'Create Part',
    component: CreatePartView
  },
  {
    path: '/admin/parts/manage',
    name: 'Manage Parts',
    component: AdminPartSearchView
  },
  {
    path: '/admin/users',
    name: 'Manage Users',
    component: AdminUserView
  },
  {
    path: '/:catchall(.*)',
    name: '404',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
