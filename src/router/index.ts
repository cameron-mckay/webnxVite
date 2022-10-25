import { createRouter, createWebHistory } from 'vue-router'
import FindPartView from '../views/FindPartView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
import AssetView from '../views/AssetView.vue'
import CreatePartView from '../views/CreatePartView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: FindPartView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/login',
    name: 'login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: LoginView
  },
  {
    path: '/parts',
    name: 'parts',
    component: FindPartView
  },
  {
    path: '/assets',
    name: 'assets',
    component: AssetView
  },
  {
    path: '/admin/createpart',
    name: 'createPart',
    component: CreatePartView
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
