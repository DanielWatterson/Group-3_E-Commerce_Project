<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Menubar from 'primevue/menubar'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Badge from 'primevue/badge'
import { useToast } from 'primevue/usetoast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isScrolled = ref(false)
const isAuthenticated = ref(false)
const cartCount = ref(0)

// Simplified navigation items - only Products and Services
const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => router.push('/')
  },
  {
    label: 'Products',
    icon: 'pi pi-shopping-bag',
    command: () => router.push('/products')
  },
  {
    label: 'Services',
    icon: 'pi pi-cog',
    command: () => router.push('/services')
  }
])

// Check if current page should hide header
const hideHeader = computed(() => {
  return ['/login', '/intro'].includes(route.path)
})

// Check if on home page for transparent header
const isHomePage = computed(() => route.path === '/')

// Header class based on scroll and page
const headerClass = computed(() => ({
  'scrolled': isScrolled.value,
  'home-page': isHomePage.value && !isScrolled.value,
  'solid': !isHomePage.value || isScrolled.value
}))

// Handle scroll
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// Check authentication and cart
const checkAuth = () => {
  const loggedIn = localStorage.getItem('loggedIn') === 'true'
  isAuthenticated.value = loggedIn
}

// Get cart count from store
const updateCartCount = () => {
  if (window.__VUE_APP_STORE__) {
    cartCount.value = window.__VUE_APP_STORE__.getters?.cartCount || 0
  }
}

// Navigation methods
const goToLogin = () => router.push('/login')
const goToCart = () => router.push('/cart')
const logout = () => {
  if (window.__VUE_APP_STORE__) {
    window.__VUE_APP_STORE__.dispatch('logout')
  }
  toast.add({
    severity: 'success',
    summary: 'Logged Out',
    detail: 'You have been successfully logged out',
    life: 3000
  })
  router.push('/')
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  checkAuth()
  updateCartCount()
  
  // Store reference for cart updates
  window.__VUE_APP_STORE__ = window.__VUE_APP_STORE__ || {}
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="app-container">
    <Toast />
    
    <!-- Only show header if not on login/intro page -->
    <header v-if="!hideHeader" :class="headerClass">
      <Menubar :model="items" class="custom-menubar">
        <template #start>
          <div class="logo" @click="router.push('/')">
            <span class="logo-text">LumberLink</span>
            <span class="logo-desktop">Desks</span>
          </div>
        </template>
        
        <template #item="{ item, props, hasSubmenu }">
          <a v-bind="props.action" @click="item.command" class="menu-item">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
            <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down ml-2" />
          </a>
        </template>
        
        <template #end>
          <div class="auth-section">
            <Button 
              icon="pi pi-search" 
              class="p-button-rounded p-button-text header-btn" 
              @click="router.push('/products')"
              v-tooltip="'Search Products'"
            />
            
            <template v-if="!isAuthenticated">
              <Button 
                icon="pi pi-user" 
                class="p-button-rounded p-button-text header-btn" 
                @click="goToLogin"
                v-tooltip="'Login'"
              />
            </template>
            <template v-else>
              <Button 
                icon="pi pi-sign-out" 
                class="p-button-rounded p-button-text header-btn" 
                @click="logout"
                v-tooltip="'Logout'"
              />
            </template>
            
            <Button 
              icon="pi pi-shopping-cart" 
              class="p-button-rounded p-button-text header-btn cart-btn" 
              @click="goToCart"
              v-tooltip="'View Cart'"
            >
              <Badge v-if="cartCount > 0" :value="cartCount" severity="danger" class="cart-badge" />
            </Button>
          </div>
        </template>
      </Menubar>
    </header>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f0f2f5;
}

header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.custom-menubar {
  border-radius: 0;
  padding: 0.75rem 2rem;
  transition: all 0.3s ease;
  border: none;
  border-bottom: 2px solid transparent;
}

/* Home page header - transparent with border */
header.home-page .custom-menubar {
  background: transparent;
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
}

header.home-page .custom-menubar :deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link) {
  color: white;
  font-weight: 500;
}

header.home-page .custom-menubar :deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link:hover) {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
}

header.home-page .header-btn {
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-left: 0.25rem;
}

header.home-page .header-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

header.home-page .logo-text,
header.home-page .logo-desktop {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Solid header for other pages and scrolled */
header.solid .custom-menubar {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-bottom: 2px solid #8B4513;
}

header.solid .custom-menubar :deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link) {
  color: #2d3748;
  font-weight: 500;
}

header.solid .custom-menubar :deep(.p-menubar-root-list > .p-menuitem > .p-menuitem-link:hover) {
  background: #f7fafc;
  border-radius: 6px;
  color: #8B4513;
}

header.solid .header-btn {
  color: #4a5568;
  border: 1px solid #e2e8f0;
  margin-left: 0.25rem;
}

header.solid .header-btn:hover {
  background: #f7fafc;
  border-color: #8B4513;
  color: #8B4513;
}

header.solid .logo-text {
  color: #8B4513;
}

header.solid .logo-desktop {
  color: #4a5568;
}

/* Scrolled state - adds shadow */
header.scrolled .custom-menubar {
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.25rem;
}

.logo-text {
  margin-right: 4px;
}

.auth-section {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.header-btn {
  width: 2.5rem;
  height: 2.5rem;
  transition: all 0.2s ease;
}

.cart-btn {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  font-size: 0.7rem;
  min-width: 1.25rem;
  height: 1.25rem;
  line-height: 1.25rem;
}

.main-content {
  padding-top: 70px;
  min-height: calc(100vh - 70px);
}

@media (max-width: 768px) {
  .custom-menubar {
    padding: 0.5rem 1rem;
  }
  
  .logo-desktop {
    display: none;
  }
  
  .main-content {
    padding-top: 60px;
  }
}
</style>