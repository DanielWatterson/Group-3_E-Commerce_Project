import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginSignupView from '@/views/LoginSignupView.vue'
import CustomersView from '@/views/CustomersView.vue'
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
    }
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  
// REDIRECTIONS (Logged in or not)

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login page if not authenticated
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    // Redirect to home if already authenticated
    next('/');
  } else {
    next();
  }
});

export default router