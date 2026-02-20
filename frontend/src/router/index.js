import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginSignupView from '@/views/LoginSignupView.vue'
import CustomersView from '@/views/CustomersView.vue'
import ProductsView from '@/views/ProductsView.vue' // Add this import
import CartView from '@/views/CartView.vue' // Add this import
import store from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginSignupView,
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomersView,
      meta: { requiresAuth: true }
    },
    {
      path: '/products', // Add products route
      name: 'products',
      component: ProductsView,
    },
    {
      path: '/cart', // Add cart route
      name: 'cart',
      component: CartView,
    },
    {
      path: '/custom-builder', // Add these placeholder routes
      name: 'customBuilder',
      component: { template: '<div>Custom Builder Page - Coming Soon</div>' }
    },
    {
      path: '/virtual-showrooms',
      name: 'virtualShowrooms',
      component: { template: '<div>Virtual Showrooms Page - Coming Soon</div>' }
    },
    {
      path: '/b2b',
      name: 'b2b',
      component: { template: '<div>B2B Page - Coming Soon</div>' }
    }
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router