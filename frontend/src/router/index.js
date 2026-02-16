import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginSignupView from '@/views/LoginSignupView.vue'
import CustomersView from '@/views/CustomersView.vue'

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
    }
  ],
})

export default router
