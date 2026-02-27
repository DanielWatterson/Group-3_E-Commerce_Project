<template>
  <div class="user-menu-container">
    <button class="user-icon-btn" @click="showMenu = !showMenu">
      <i class="pi pi-user"></i>
      <span
        class="status-indicator"
        :class="{ online: isAuthenticated }"
      ></span>
    </button>

    <div
      v-if="showMenu"
      class="user-dropdown"
      v-click-outside="() => (showMenu = false)"
    >
      <template v-if="isAuthenticated">
        <div class="user-info">
          <div class="user-avatar"><i class="pi pi-user"></i></div>
          <div class="user-details">
            <div class="user-name">{{ user?.name || "User" }}</div>
            <div class="user-email">{{ user?.email || "" }}</div>
          </div>
        </div>
        <div class="menu-items">
          <button @click="navigateTo('/cart')" class="menu-item">
            <i class="pi pi-shopping-cart"></i>Cart
          </button>
          <div class="menu-divider"></div>
          <button @click="logout" class="menu-item logout">
            <i class="pi pi-sign-out"></i>Logout
          </button>
        </div>
      </template>
      <template v-else>
        <div class="menu-items">
          <button @click="navigateTo('/login')" class="menu-item">
            <i class="pi pi-sign-in"></i>Login
          </button>
          <button @click="navigateTo('/login')" class="menu-item">
            <i class="pi pi-user-plus"></i>Sign Up
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();
const showMenu = ref(false);

const isAuthenticated = computed(() => store.getters.isAuthenticated);
const user = computed(() => store.state.user);

const logout = () => {
  store.dispatch("logout");
  showMenu.value = false;
  router.push("/");
};

const navigateTo = (path) => {
  showMenu.value = false;
  router.push(path);
};
</script>

<style scoped>
.user-menu-container {
  position: relative;
}
.user-icon-btn {
  background: none;
  border: 2px solid transparent;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  position: relative;
  background: rgba(255, 255, 255, 0.9);
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
  width: 250px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}
.user-info {
  padding: 1rem;
  background: #8b4513;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: #4a5568;
}
.menu-item:hover {
  background: #f7fafc;
  color: #8b4513;
}
.menu-item.logout:hover {
  background: #fff5f5;
  color: #e53e3e;
}
.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}
</style>
