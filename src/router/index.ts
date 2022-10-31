import { createRouter, createWebHistory } from 'vue-router'
import FindPartView from '../views/FindPartView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import NotFound from '../views/NotFound.vue'
import AssetView from '../views/AssetView.vue'
import CreatePartView from '../views/CreatePartView.vue'
import CartView from '../views/CartView.vue'

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
  // {
  //   path: '/assets',
  //   name: 'assets',
  //   component: AssetView
  // },
  {
    path: '/admin/createpart',
    name: 'Create Part',
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


// This callback runs before every route change, including on page load.
router.beforeEach((to, from, next) => {
  // This goes through the matched routes from last to first, finding the closest route with a title.
  // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
  // `/nested`'s will be chosen.
  document.title = `WebNX - ${to.name?.toString()}`

  next();
});


export default router
