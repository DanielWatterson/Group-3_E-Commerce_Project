<!-- src/components/UserMenu.vue -->
<script>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

export default {
  name: 'UserMenu',
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();
    
    const showMenu = ref(false);
    const sessionTimer = ref(null);
    const warningTimer = ref(null);
    const showWarning = ref(false);
    
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const currentUser = computed(() => store.state.user || {});
    
    // Session timeout configuration (1 hour = 3600000 ms)
    const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour
    const WARNING_BEFORE = 5 * 60 * 1000; // 5 minutes before
    
    // Check for existing session on mount
    onMounted(() => {
      if (isAuthenticated.value) {
        startSessionTimer();
      }
    });
    
    onUnmounted(() => {
      clearTimers();
    });
    
    const startSessionTimer = () => {
      // Clear any existing timers
      clearTimers();
      
      // Get last activity from localStorage
      const lastActivity = localStorage.getItem('lastActivity');
      const now = Date.now();
      
      if (lastActivity) {
        const timeSinceLastActivity = now - parseInt(lastActivity);
        const timeRemaining = SESSION_TIMEOUT - timeSinceLastActivity;
        
        if (timeRemaining <= 0) {
          // Session expired
          handleSessionExpired();
          return;
        }
        
        // Set warning timer
        if (timeRemaining > WARNING_BEFORE) {
          warningTimer.value = setTimeout(() => {
            showWarning.value = true;
            toast.add({
              severity: 'warn',
              summary: 'Session Expiring Soon',
              detail: 'Your session will expire in 5 minutes. Stay logged in?',
              life: 10000,
              group: 'session-warning'
            });
          }, timeRemaining - WARNING_BEFORE);
        }
        
        // Set expiration timer
        sessionTimer.value = setTimeout(() => {
          handleSessionExpired();
        }, timeRemaining);
      } else {
        // First time - set full session
        localStorage.setItem('lastActivity', now.toString());
        
        warningTimer.value = setTimeout(() => {
          showWarning.value = true;
          toast.add({
            severity: 'warn',
            summary: 'Session Expiring Soon',
            detail: 'Your session will expire in 5 minutes. Stay logged in?',
            life: 10000,
            group: 'session-warning'
          });
        }, SESSION_TIMEOUT - WARNING_BEFORE);
        
        sessionTimer.value = setTimeout(() => {
          handleSessionExpired();
        }, SESSION_TIMEOUT);
      }
    };
    
    const resetSessionTimer = () => {
      if (isAuthenticated.value) {
        localStorage.setItem('lastActivity', Date.now().toString());
        showWarning.value = false;
        startSessionTimer(); // Restart timers
        
        toast.add({
          severity: 'success',
          summary: 'Session Extended',
          detail: 'Your session has been extended for another hour',
          life: 3000
        });
      }
    };
    
    const handleSessionExpired = async () => {
      clearTimers();
      showWarning.value = false;
      
      if (isAuthenticated.value) {
        await store.dispatch('logout');
        toast.add({
          severity: 'info',
          summary: 'Session Expired',
          detail: 'Your session has expired. Please login again.',
          life: 5000
        });
        router.push('/login');
      }
    };
    
    const clearTimers = () => {
      if (sessionTimer.value) clearTimeout(sessionTimer.value);
      if (warningTimer.value) clearTimeout(warningTimer.value);
    };
    
    const toggleMenu = () => {
      showMenu.value = !showMenu.value;
    };
    
    const handleLogout = async () => {
      try {
        showMenu.value = false;
        clearTimers();
        localStorage.removeItem('lastActivity');
        await store.dispatch('logout');
        
        toast.add({
          severity: 'success',
          summary: 'Logged Out',
          detail: 'You have been successfully logged out',
          life: 3000
        });
        
        router.push('/');
      } catch (error) {
        console.error('Logout failed:', error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to logout',
          life: 3000
        });
      }
    };
    
    const navigateTo = (path) => {
      showMenu.value = false;
      router.push(path);
    };
    
    // Update last activity on user interaction
    const updateActivity = () => {
      if (isAuthenticated.value) {
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    };
    
    // Add activity listeners
    onMounted(() => {
      window.addEventListener('click', updateActivity);
      window.addEventListener('keypress', updateActivity);
      window.addEventListener('scroll', updateActivity);
      window.addEventListener('mousemove', updateActivity);
    });
    
    onUnmounted(() => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('mousemove', updateActivity);
    });
    
    return {
      showMenu,
      isAuthenticated,
      currentUser,
      toggleMenu,
      handleLogout,
      navigateTo,
      showWarning,
      resetSessionTimer
    };
  }
};
</script>

<template>
  <div class="user-menu-container">
    <!-- User Icon Button -->
    <button class="user-icon-btn" @click="toggleMenu" @keyup.escape="showMenu = false">
      <i class="pi pi-user"></i>
      <span class="status-indicator" :class="{ 'online': isAuthenticated }"></span>
    </button>
    
    <!-- Dropdown Menu -->
    <div v-if="showMenu" class="user-dropdown" v-click-outside="() => showMenu = false">
      <template v-if="isAuthenticated">
        <div class="user-info">
          <div class="user-avatar">
            <i class="pi pi-user"></i>
          </div>
          <div class="user-details">
            <div class="user-name">{{ currentUser.name || 'User' }}</div>
            <div class="user-email">{{ currentUser.email || 'user@example.com' }}</div>
          </div>
        </div>
        
        <div class="menu-items">
          <button @click="navigateTo('/profile')" class="menu-item">
            <i class="pi pi-user-edit"></i>
            <span>My Profile</span>
          </button>
          
          <button @click="navigateTo('/orders')" class="menu-item">
            <i class="pi pi-list"></i>
            <span>My Orders</span>
          </button>
          
          <button @click="navigateTo('/cart')" class="menu-item">
            <i class="pi pi-shopping-cart"></i>
            <span>My Cart</span>
          </button>
          
          <div class="menu-divider"></div>
          
          <button @click="handleLogout" class="menu-item logout">
            <i class="pi pi-sign-out"></i>
            <span>Logout</span>
          </button>
        </div>
      </template>
      
      <template v-else>
        <div class="menu-items">
          <button @click="navigateTo('/login')" class="menu-item">
            <i class="pi pi-sign-in"></i>
            <span>Login</span>
          </button>
          
          <button @click="navigateTo('/signup')" class="menu-item">
            <i class="pi pi-user-plus"></i>
            <span>Sign Up</span>
          </button>
        </div>
      </template>
    </div>
    
    <!-- Session Warning Dialog -->
    <Dialog 
      v-if="showWarning" 
      :visible="showWarning" 
      modal 
      header="Session Expiring Soon" 
      :style="{ width: '350px' }"
      @hide="showWarning = false"
    >
      <div class="session-warning-content">
        <i class="pi pi-clock warning-icon"></i>
        <p>Your session will expire in 5 minutes due to inactivity.</p>
        <p class="small">Would you like to stay logged in?</p>
      </div>
      
      <template #footer>
        <Button 
          label="Logout Now" 
          icon="pi pi-sign-out" 
          class="p-button-text" 
          @click="handleLogout"
        />
        <Button 
          label="Stay Logged In" 
          icon="pi pi-check" 
          class="p-button-success" 
          @click="resetSessionTimer"
          autofocus
        />
      </template>
    </Dialog>
    
    <!-- Toast for session warning -->
    <Toast position="bottom-center" group="session-warning">
      <template #message="slotProps">
        <div class="session-toast">
          <div class="toast-content">
            <i class="pi pi-exclamation-triangle"></i>
            <div>
              <div class="toast-title">{{ slotProps.message.summary }}</div>
              <div class="toast-detail">{{ slotProps.message.detail }}</div>
            </div>
          </div>
          <div class="toast-actions">
            <Button 
              label="Logout" 
              icon="pi pi-sign-out" 
              class="p-button-text p-button-sm" 
              @click="handleLogout"
            />
            <Button 
              label="Stay" 
              icon="pi pi-check" 
              class="p-button-success p-button-sm" 
              @click="resetSessionTimer"
            />
          </div>
        </div>
      </template>
    </Toast>
  </div>
</template>

<style scoped>
.user-menu-container {
  position: relative;
  display: inline-block;
}

.user-icon-btn {
  background: none;
  border: 2px solid transparent;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.3s;
  color: #333;
  background: rgba(255, 255, 255, 0.9);
}

.user-icon-btn:hover {
  background: white;
  border-color: #8b4513;
  transform: scale(1.05);
}

.user-icon-btn i {
  font-size: 1.2rem;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
  border: 2px solid white;
}

.status-indicator.online {
  background: #4caf50;
}

.user-dropdown {
  position: absolute;
  top: 50px;
  right: 0;
  width: 280px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 2px solid white;
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-items {
  padding: 0.5rem;
}

.menu-item {
  width: 100%;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #4a5568;
  font-size: 0.95rem;
  text-align: left;
}

.menu-item:hover {
  background: #f7fafc;
  color: #8b4513;
}

.menu-item i {
  font-size: 1.1rem;
  color: #718096;
  transition: color 0.2s;
}

.menu-item:hover i {
  color: #8b4513;
}

.menu-item.logout:hover {
  background: #fff5f5;
  color: #e53e3e;
}

.menu-item.logout:hover i {
  color: #e53e3e;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

.session-warning-content {
  text-align: center;
  padding: 1rem 0;
}

.warning-icon {
  font-size: 3rem;
  color: #f59e0b;
  margin-bottom: 1rem;
}

.session-warning-content p {
  margin: 0.5rem 0;
  color: #4a5568;
}

.session-warning-content p.small {
  font-size: 0.85rem;
  color: #718096;
}

.session-toast {
  padding: 0.5rem;
  min-width: 300px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.toast-content i {
  font-size: 1.5rem;
  color: #f59e0b;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.toast-detail {
  font-size: 0.85rem;
  color: #666;
}

.toast-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .user-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: none;
    border-radius: 20px 20px 0 0;
    animation: slideUp 0.3s ease;
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
}
</style>