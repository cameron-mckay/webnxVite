import { createRouter, createWebHistory } from "vue-router";
import AdminDashboardView from "../views/Admin/AdminDashboardView.vue";
import AdminPartSearchView from "../views/Admin/AdminPartSearchView.vue";
import AdminUserView from "../views/Admin/AdminUserView.vue";
import CreatePartView from "../views/Admin/CreatePartView.vue";
import InventoryManagerDashboardView from "../views/Admin/InventoryManagerDashboardView.vue";
import AddUntrackedAsset from "../views/Assets/AddUntrackedAssetView.vue";
import AssetSearchView from "../views/Assets/AssetSearchView.vue";
import AssetView from "../views/Assets/AssetView.vue";
import EditAssetView from "../views/Assets/EditAssetView.vue";
import LoginView from "../views/LoginView.vue";
import NotFound from "../views/NotFound.vue";
import CartView from "../views/Parts/CartView.vue";
import CheckInView from "../views/Parts/CheckInView.vue";
import FindPartView from "../views/Parts/FindPartView.vue";
import InventoryView from "../views/Parts/InventoryView.vue";
import PartHistoryView from "../views/Parts/PartHistoryView.vue";
import PartView from "../views/Parts/PartView.vue";
import RegisterView from "../views/RegisterView.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: FindPartView,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
  },
  {
    path: "/login",
    name: "Login",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: LoginView,
  },
  {
    path: "/cart",
    name: "Check Out",
    component: CartView,
  },
  {
    path: "/checkin",
    name: "Check In",
    component: CheckInView,
  },
  {
    path: "/parts",
    name: "Parts",
    component: FindPartView,
  },
  {
    path: "/parts/view",
    name: "Part View",
    component: PartView,
  },
  {
    path: "/parts/view/history",
    name: "Part History",
    component: PartHistoryView,
  },
  {
    path: "/assets",
    name: "Assets",
    component: AssetSearchView,
  },
  {
    path: "/assets/add",
    name: "Add Untracked Asset",
    component: AddUntrackedAsset,
  },
  {
    path: "/assets/edit",
    name: "Edit Asset",
    component: EditAssetView,
  },
  {
    path: "/assets/view",
    name: "View Asset",
    component: AssetView,
  },
  {
    path: "/manage",
    name: "Inventory Manager Dashboard",
    component: InventoryManagerDashboardView,
  },
  {
    path: "/manage/parts",
    name: "Part Manager",
    component: AdminPartSearchView,
  },
  {
    path: "/manage/parts/create",
    name: "Create Part",
    component: CreatePartView,
  },
  {
    path: "/admin",
    name: "Admin Dashboard",
    component: AdminDashboardView,
  },
  {
    path: "/admin/parts/create",
    name: "Create Part Admin",
    component: CreatePartView,
  },
  {
    path: "/admin/parts",
    name: "Part Manager Admin",
    component: AdminPartSearchView,
  },
  {
    path: "/admin/users",
    name: "User Manager",
    component: AdminUserView,
  },
  {
    path: "/inventory",
    name: "Inventory",
    component: InventoryView,
  },
  {
    path: "/:catchall(.*)",
    name: "404",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(/*import.meta.env.BASE_URL*/),
  routes,
});

export default router;
