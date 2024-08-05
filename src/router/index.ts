import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: {
      unauthenticated: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: {
      unauthenticated: true
    }
  },
  {
    path: '/forgotPassword',
    name: 'Forgot Password',
    component: () => import('../views/SendResetEmailView.vue'),
    meta: {
      unauthenticated: true
    }
  },
  {
    path: '/passwordReset',
    name: 'Password Reset',
    component: () => import('../views/ResetPasswordView.vue'),
    meta: {
      unauthenticated: true
    }
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('../views/NotificationView.vue'),
  },
  {
    path: '/cart',
    name: 'Check Out',
    meta: {
      allowedRoles: ["is_kiosk"]
    },
    component: () => import('../views/Parts/CartView.vue'),
  },
  {
    path: '/checkin',
    name: 'Check In',
    meta: {
      allowedRoles: ["is_kiosk"]
    },
    component: () => import('../views/Parts/CheckInView.vue'),
  },
  {
    path: '/avail',
    name: 'Available Servers',
    component: () => import('../views/Admin/AvailableServersView.vue'),
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
    meta: {
      allowedRoles: ["view_assets"]
    },
    component: () => import('../views/Assets/AssetSearchView.vue'),
  },
  {
    path: '/assets/add',
    name: 'Add Untracked Asset',
    meta: {
      allowedRoles: ["edit_assets"]
    },
    component: () => import('../views/Assets/AddUntrackedAssetView.vue'),
  },
  {
    path: '/assets/edit',
    name: 'Edit Asset',
    meta: {
      allowedRoles: ["edit_assets"]
    },
    component: () => import('../views/Assets/EditAssetView.vue'),
  },
  {
    path: '/assets/view',
    name: 'View Asset',
    meta: {
      allowedRoles: ["view_assets"]
    },
    component: () => import('../views/Assets/AssetView.vue'),
  },
  {
    path: '/assets/history',
    name: 'Asset History',
    meta: {
      allowedRoles: ["view_assets"]
    },
    component: () => import('../views/Assets/AssetHistoryView.vue'),
  },
  {
    path: '/clerk/parts',
    name: 'Part Manager',
    meta: {
      allowedRoles: ["manage_parts"]
    },
    component: () => import('../views/Admin/AdminPartSearchView.vue'),
  },
  {
    path: '/clerk/parts/merge',
    name: 'Merge Parts',
    meta: {
      allowedRoles: ["manage_parts"]
    },
    component: () => import('../views/Admin/MergePartsView.vue'),
  },
  {
    path: '/ebay/sell',
    name: 'Sell On eBay',
    meta: {
      allowedRoles: ["sell_on_ebay"]
    },
    component: () => import('../views/Parts/SellOnEbay.vue'),
  },
  {
    path: '/ebay/history',
    name: 'Ebay Sales History',
    meta: {
      allowedRoles: ["sell_on_ebay", "view_analytics"]
    },
    component: () => import('../views/Admin/EbaySaleHistoryView.vue'),
  },
  {
    path: '/manage/parts/create',
    name: 'Create Part',
    meta: {
      allowedRoles: ["manage_parts"]
    },
    component: () => import('../views/Admin/CreatePartView.vue'),
  },
  {
    path: '/requestParts',
    name: 'Request Parts',
    meta: {
      allowedRoles: ["request_parts", "fulfill_part_requests"]
    },
    component: () => import('../views/Parts/RequestPartsView.vue')
  },
  {
    path: '/partRequests/active',
    name: 'Active Part Requests',
    meta: {
      allowedRoles: ["request_parts", "fulfill_part_requests"]
    },
    component: () => import('../views/Parts/ActivePartRequestsView.vue')
  },
  {
    path: '/partRequests/fulfilled',
    name: 'Part Request History',
    meta: {
      allowedRoles: ["request_parts", "fulfill_part_requests"]
    },
    component: () => import('../views/Parts/PastPartRequestsView.vue')
  },
  {
    path: '/clerk/partRequests',
    name: 'Check Out Queue',
    meta: {
      allowedRoles: ["fulfill_part_requests"]
    },
    component: () => import('../views/Admin/PartRequestApprovalView.vue')
  },
  {
    path: '/buildKit/search',
    name: 'Build Kit Search',
    meta: {
      allowedRoles: ["create_build_kit", "request_build_kit", "claim_build_kit", "is_kiosk"]
    },
    component: () => import('../views/Parts/FindBuildKitsView.vue')
  },
  {
    path: '/clerk/buildKit/create',
    name: 'Create Build Kit',
    meta: {
      allowedRoles: ["create_build_kit"]
    },
    component: () => import('../views/Parts/CreateBuildKitView.vue')
  },
  {
    path: '/clerk/buildKit/delete',
    name: 'Delete Build Kit',
    meta: {
      allowedRoles: ["create_build_kit"]
    },
    component: () => import('../views/Parts/DeleteBuildKitView.vue')
  },
  {
    path: '/clerk/checkin',
    name: 'Check In Queue',
    meta: {
      allowedRoles: ["process_checkins"]
    },
    component: () => import('../views/Admin/CheckinApprovalView.vue'),
  },
  {
    path: '/manage/checkout',
    name: 'Check Out History',
    meta: {
      allowedRoles: ["process_checkins", "view_analytics"]
    },
    component: () => import('../views/Admin/CheckoutHistoryView.vue'),
  },
  {
    path: '/manage/checkin',
    name: 'Check In History',
    meta: {
      allowedRoles: ["process_checkins", "view_analytics"]
    },
    component: () => import('../views/Admin/CheckinHistoryView.vue'),
  },
  {
    path: '/manage',
    name: 'Manage',
    meta: {
      allowedRoles: ["view_manage_menu"]
    },
    component: () => import('../views/Admin/AdminDashboardView.vue'),
  },
  {
    path: '/manage/all',
    name: 'All Techs History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/AllTechsHistoryView.vue'),
  },
  {
    path: '/admin/users',
    name: 'User Manager',
    meta: {
      allowedRoles: ["manage_users"]
    },
    component: () => import('../views/Admin/AdminUserView.vue'),
  },
  {
    path: '/manage/users/analytics',
    name: 'User Analytics',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/UserAnalyticsView.vue'),
  },
  {
    path: '/manage/user/checkouts',
    name: 'Checkout History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/CheckoutHistoryView.vue'),
  },
  {
    path: '/manage/user/checkins',
    name: 'Checkin History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/CheckinHistoryView.vue'),
  },
  {
    path: '/manage/user/newAssets',
    name: 'New Asset History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/NewAssetsHistoryView.vue'),
  },
  {
    path: '/manage/user/assetsUpdated',
    name: 'Asset Update History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/AssetUpdateHistoryView.vue'),
  },
  {
    path: '/manage/user/newPallets',
    name: 'New Pallet History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/NewPalletHistoryView.vue'),
  },
  {
    path: '/manage/user/palletsUpdated',
    name: 'Pallet Update History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/PalletUpdateHistoryView.vue'),
  },
  {
    path: '/manage/user/newBoxes',
    name: 'New Box History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/NewBoxHistoryView.vue'),
  },
  {
    path: '/manage/user/boxesUpdated',
    name: 'Box Update History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/BoxUpdateHistoryView.vue'),
  },
  {
    path: '/manage/part/history',
    name: 'Part Action History',
    meta: {
      allowedRoles: ["view_analytics"]
    },
    component: () => import('../views/Admin/PartHistoryView.vue'),
  },
  {
    path: '/manage/part/auditHistory',
    name: 'Part Audit History',
    meta: {
      allowedRoles: ["view_analytics", "manage_parts"]
    },
    component: () => import('../views/Admin/AuditHistoryView.vue'),
  },
  {
    path: '/inventory',
    name: 'Inventory',
    meta: {
      allowedRoles: ["own_parts"]
    },
    component: () => import('../views/Parts/InventoryView.vue'),
  },
  {
    path: '/pallets',
    name: 'Pallets',
    meta: {
      allowedRoles: ["view_pallets"]
    },
    component: () => import('../views/Pallets/PalletSearchView.vue'),
  },
  {
    path: '/pallets/add',
    name: 'Create Pallet',
    meta: {
      allowedRoles: ["edit_pallets"]
    },
    component: () => import('../views/Pallets/CreatePalletView.vue'),
  },
  {
    path: '/pallets/edit',
    name: 'Edit Pallet',
    meta: {
      allowedRoles: ["edit_pallets"]
    },
    component: () => import('../views/Pallets/EditPalletView.vue'),
  },
  {
    path: '/pallets/view',
    name: 'View Pallet',
    meta: {
      allowedRoles: ["view_pallets"]
    },
    component: () => import('../views/Pallets/PalletView.vue'),
  },
  {
    path: '/pallets/history',
    name: 'Pallet History',
    meta: {
      allowedRoles: ["view_pallets"]
    },
    component: () => import('../views/Pallets/PalletHistoryView.vue'),
  },
  {
    path: '/boxes',
    name: 'Boxes',
    meta: {
      allowedRoles: ["view_boxes"]
    },
    component: () => import('../views/Boxes/BoxSearchView.vue'),
  },
  {
    path: '/boxes/add',
    name: 'Create Box',
    meta: {
      allowedRoles: ["edit_boxes"]
    },
    component: () => import('../views/Boxes/CreateBoxView.vue'),
  },
  {
    path: '/boxes/edit',
    name: 'Edit Box',
    meta: {
      allowedRoles: ["edit_boxes"]
    },
    component: () => import('../views/Boxes/EditBoxView.vue'),
  },
  {
    path: '/boxes/view',
    name: 'View Box',
    meta: {
      allowedRoles: ["view_boxes"]
    },
    component: () => import('../views/Boxes/BoxView.vue'),
  },
  {
    path: '/boxes/history',
    name: 'Box History',
    meta: {
      allowedRoles: ["view_boxes"]
    },
    component: () => import('../views/Boxes/BoxHistoryView.vue'),
  },
  {
    path: '/debug/notifications',
    name: 'Notifications Debug',
    meta: {
      allowedRoles: ["debug"]
    },
    component: () => import('../views/Debug/NotificationTest.vue'),
  },
  {
    path: '/orders',
    name: 'Orders',
    meta: {
      allowedRoles: ["manage_orders"]
    },
    component: () => import('../views/Admin/ActivePartOrdersView.vue')
  },
  {
    path: '/orders/create',
    name: 'Create Part Order',
    meta: {
      allowedRoles: ["manage_orders"]
    },
    component: () => import('../views/Admin/CreatePartOrderView.vue')
  },
  {
    path: '/orders/receive',
    name: 'Receive Part Order',
    meta: {
      allowedRoles: ["manage_orders"]
    },
    component: () => import('../views/Admin/ReceivePartOrderView.vue')
  },
  {
    path: '/orders/received',
    name: 'Past Part Orders',
    meta: {
      allowedRoles: ["manage_orders"]
    },
    component: () => import('../views/Admin/PastPartOrdersView.vue')
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
