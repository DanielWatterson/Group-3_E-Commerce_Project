import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginSignupView from '@/views/LoginSignupView.vue'
import CustomersView from '@/views/CustomersView.vue'
import ProductsView from '@/views/ProductsView.vue'
import CartView from '@/views/CartView.vue'
import GamingDeskSpecialsView from '@/views/GamingDeskSpecialsView.vue'
import WorkDeskSpecialsView from '@/views/WorkDeskSpecialsView.vue'
import CustomBuilderView from '@/views/CustomBuilderView.vue'
import VirtualShowroomsView from '@/views/VirtualShowroomsView.vue'
import B2BView from '@/views/B2BView.vue'
import store from '@/stores'
import PaymentSuccess from '@/views/PaymentSuccess.vue'
import PaymentCancel from '@/views/PaymentCancel.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { transition: 'page-fade' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginSignupView,
      meta: { transition: 'page-fade' }
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomersView,      
      meta: { requiresAuth: true, transition: 'page-fade' }
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { transition: 'page-fade' }
    },
    {
      path: '/shop',
      redirect: '/products'
    },
    {
      path: '/purchase',
      redirect: '/products'
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
      meta: { transition: 'page-fade' }
    },
    {
      path: '/specials/gaming-pc-desks',
      name: 'gamingSpecials',
      component: GamingDeskSpecialsView,
      meta: { transition: 'swipe-right' }
    },
    {
      path: '/specials/work-desks',
      name: 'workDeskSpecials',
      component: WorkDeskSpecialsView,
      meta: { transition: 'swipe-left' }
    },
    {
      path: '/custom-builder',
      name: 'customBuilder',
      component: CustomBuilderView,
      meta: { transition: 'page-fade' }
    },
    {
      path: '/virtual-showrooms',      
      name: 'virtualShowrooms',
      component: VirtualShowroomsView,
      meta: { transition: 'page-fade' }
    },
    {
      path: '/b2b',
      name: 'b2b',
      component: B2BView,
      meta: { transition: 'page-fade' }
    },
    {
      path: '/payment/success',
      name: 'paymentSuccess',
      component: PaymentSuccess,
      meta: { transition: 'page-fade' }
    },
    {
      path: '/payment/cancel',
      name: 'paymentCancel',
      component: PaymentCancel,
      meta: { transition: 'page-fade' }
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
