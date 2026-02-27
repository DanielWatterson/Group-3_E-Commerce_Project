import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import LoginSignupView from "@/views/LoginSignupView.vue";
import CustomersView from "@/views/CustomersView.vue";
import ProductsView from "@/views/ProductsView.vue";
import CartView from "@/views/CartView.vue";
import GamingDeskSpecialsView from "@/views/GamingDeskSpecialsView.vue";
import WorkDeskSpecialsView from "@/views/WorkDeskSpecialsView.vue";
import CustomBuilderView from "@/views/CustomBuilderView.vue";
import VirtualShowroomsView from "@/views/VirtualShowroomsView.vue";
import B2BView from "@/views/B2BView.vue";
import PaymentSuccess from "@/views/PaymentSuccess.vue";
import PaymentCancel from "@/views/PaymentCancel.vue";
import store from "@/stores";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/login", name: "login", component: LoginSignupView },
    {
      path: "/customers",
      name: "customers",
      component: CustomersView,
      meta: { requiresAuth: true },
    },
    { path: "/products", name: "products", component: ProductsView },
    { path: "/cart", name: "cart", component: CartView },
    {
      path: "/specials/gaming-pc-desks",
      name: "gamingSpecials",
      component: GamingDeskSpecialsView,
    },
    {
      path: "/specials/work-desks",
      name: "workDeskSpecials",
      component: WorkDeskSpecialsView,
    },
    {
      path: "/custom-builder",
      name: "customBuilder",
      component: CustomBuilderView,
    },
    {
      path: "/virtual-showrooms",
      name: "virtualShowrooms",
      component: VirtualShowroomsView,
    },
    { path: "/b2b", name: "b2b", component: B2BView },
    {
      path: "/payment/success",
      name: "paymentSuccess",
      component: PaymentSuccess,
    },
    {
      path: "/payment/cancel",
      name: "paymentCancel",
      component: PaymentCancel,
    },
    {
      path: "/payment/notify",
      name: "paymentNotify",
      component: () => import("@/views/PaymentNotify.vue"),
    },
    { path: "/shop", redirect: "/products" },
    { path: "/purchase", redirect: "/products" },
  ],
});

router.beforeEach((to) => {
  const isAuthenticated = store.getters.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    next("/");
  } else {
    next();
  }
});

export default router;
