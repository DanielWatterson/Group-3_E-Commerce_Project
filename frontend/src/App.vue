<script>
import Menubar from "primevue/menubar";
import Button from "primevue/button";
import Badge from "primevue/badge";
import Drawer from "primevue/drawer";
import InputText from "primevue/inputtext";

export default {
  name: "App",
  components: {
    Menubar,
    Button,
    Badge,
    Drawer,
    InputText,
  },
  data() {
    return {
      isScrolled: false,
      isNavbarHovered: false,
      isMobileSidebarVisible: false,
      mobileSearchQuery: "",
    };
  },
  computed: {
    menuItems() {
      return [
        {
          label: "Home",
          icon: "pi pi-home",
          command: () => this.navigateTo("/"),
        },
        {
          label: "Shop",
          icon: "pi pi-shopping-bag",
          command: () => this.navigateTo("/products"),
        },
        {
          label: "Custom Builder",
          icon: "pi pi-pencil",
          command: () => this.navigateTo("/custom-builder"),
        },
        {
          label: "Virtual Showrooms",
          icon: "pi pi-desktop",
          command: () => this.navigateTo("/virtual-showrooms"),
        },
        {
          label: "B2B",
          icon: "pi pi-briefcase",
          command: () => this.navigateTo("/b2b"),
        },
      ];
    },
    isHomeRoute() {
      return this.$route.path === "/";
    },
    isNavbarOpaque() {
      return !this.isHomeRoute || this.isScrolled || this.isNavbarHovered;
    },
    navbarClasses() {
      return {
        "is-opaque": this.isNavbarOpaque,
        "is-transparent": !this.isNavbarOpaque,
      };
    },
    pageContentClasses() {
      return {
        "home-overlay": this.isHomeRoute,
      };
    },
    cartCount() {
      return this.$store.getters.cartCount || 0;
    },
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    this.handleScroll();
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  watch: {
    "$route.path"() {
      this.isNavbarHovered = false;
      this.isMobileSidebarVisible = false;
      this.$nextTick(() => this.handleScroll());
    },
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 10;
    },
    openMobileSidebar() {
      this.isMobileSidebarVisible = true;
    },
    closeMobileSidebar() {
      this.isMobileSidebarVisible = false;
    },
    handleMobileItemClick(item) {
      item.command();
      this.closeMobileSidebar();
    },
    navigateTo(path) {
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
      this.closeMobileSidebar();
    },
  },
};
</script>

<template>
  <div class="app-shell">
    <header
      class="top-nav"
      :class="navbarClasses"
      @mouseenter="isNavbarHovered = true"
      @mouseleave="isNavbarHovered = false"
    >
      <Menubar :model="menuItems" class="woodcraft-menubar">
        <template #start>
          <div class="nav-start">
            <Button
              icon="pi pi-bars"
              text
              rounded
              class="mobile-menu-btn"
              aria-label="Open navigation menu"
              @click="openMobileSidebar"
            />
            <button type="button" class="brand" @click="navigateTo('/')">
              <span class="brand-mark">WC</span>
              <span class="brand-text">WoodCraft Workshop</span>
            </button>
          </div>
        </template>

        <template #item="{ item, props }">
          <a
            v-bind="props.action"
            class="menu-link"
            @click.prevent="item.command"
          >
            <i :class="item.icon" class="menu-icon"></i>
            <span>{{ item.label }}</span>
          </a>
        </template>

        <template #end>
          <div class="nav-actions">
            <Button
              icon="pi pi-search"
              rounded
              text
              class="icon-btn"
              aria-label="Search"
              @click="navigateTo('/products')"
            />
            <Button
              icon="pi pi-user"
              rounded
              text
              class="icon-btn"
              aria-label="User account"
              @click="navigateTo('/login')"
            />
            <div class="desktop-cart-wrap">
              <Button
                icon="pi pi-shopping-cart"
                rounded
                text
                class="icon-btn cart-btn"
                aria-label="Shopping cart"
                @click="navigateTo('/cart')"
              />
              <Badge
                v-if="cartCount > 0"
                :value="cartCount"
                severity="contrast"
                class="cart-badge"
              />
            </div>
          </div>
        </template>
      </Menubar>
    </header>

    <Drawer
      v-model:visible="isMobileSidebarVisible"
      position="left"
      class="mobile-sidebar"
      :showCloseIcon="false"
      :dismissable="true"
      :modal="true"
      :baseZIndex="1600"
      :autoZIndex="true"
    >
      <div class="mobile-sidebar-content">
        <div class="mobile-sidebar-header">
          <span class="mobile-sidebar-title">WoodCraft Workshop</span>
          <Button
            icon="pi pi-times"
            text
            rounded
            class="mobile-close-btn"
            aria-label="Close navigation menu"
            @click="closeMobileSidebar"
          />
        </div>

        <div class="mobile-search-wrap">
          <i class="pi pi-search"></i>
          <InputText
            v-model="mobileSearchQuery"
            placeholder="Search"
            class="mobile-search-input"
            aria-label="Search products"
          />
        </div>

        <nav class="mobile-nav-links" aria-label="Mobile navigation">
          <button
            v-for="item in menuItems"
            :key="item.label"
            type="button"
            class="mobile-nav-link"
            @click="handleMobileItemClick(item)"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <div class="mobile-sidebar-footer">
          <Button
            icon="pi pi-user"
            label="Account"
            outlined
            class="mobile-footer-btn"
            @click="navigateTo('/login')"
          />
          <div class="mobile-cart-wrap">
            <Button
              icon="pi pi-shopping-cart"
              label="Cart"
              outlined
              class="mobile-footer-btn mobile-footer-cart"
              @click="navigateTo('/cart')"
            />
            <Badge
              v-if="cartCount > 0"
              :value="cartCount"
              severity="contrast"
              class="mobile-cart-badge"
            />
          </div>
        </div>
      </div>
    </Drawer>

    <main class="page-content" :class="pageContentClasses">
      <router-view v-slot="{ Component, route }">
        <Transition :name="route.meta.transition || 'page-fade'" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f4f1ec;
  font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.top-nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 1000;
  transition:
    background-color 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.woodcraft-menubar {
  border: 0;
  border-radius: 0;
  padding: 0.78rem 2rem;
  background: rgba(255, 255, 255, 0);
  border-bottom: 1px solid transparent;
  transition:
    background-color 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.top-nav.is-transparent .woodcraft-menubar {
  background: transparent;
  box-shadow: none;
}

.top-nav.is-opaque .woodcraft-menubar {
  background: rgba(255, 255, 255, 0.97);
  border-bottom-color: rgba(99, 73, 44, 0.18);
  box-shadow: 0 6px 20px rgba(22, 17, 12, 0.1);
  backdrop-filter: blur(6px);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.nav-start {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.mobile-menu-btn {
  display: none;
  width: 2.25rem;
  height: 2.25rem;
}

.brand-mark {
  width: 2.05rem;
  height: 2.05rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  background: linear-gradient(135deg, #7c542f, #b07d48);
  color: #f8f3eb;
}

.brand-text {
  font-size: 1.02rem;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.top-nav.is-transparent .brand-text,
.top-nav.is-transparent .menu-link,
.top-nav.is-transparent .icon-btn,
.top-nav.is-transparent .mobile-menu-btn {
  color: #f8f3eb;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.top-nav.is-opaque .brand-text,
.top-nav.is-opaque .menu-link,
.top-nav.is-opaque .icon-btn,
.top-nav.is-opaque .mobile-menu-btn {
  color: #3f3023;
  text-shadow: none;
}

.menu-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding: 0.52rem 0.72rem;
  text-decoration: none;
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.top-nav.is-transparent .menu-link:hover {
  background: rgba(255, 255, 255, 0.14);
}

.top-nav.is-opaque .menu-link:hover {
  background: rgba(99, 73, 44, 0.11);
  color: #2a2119;
}

.menu-icon {
  font-size: 0.95rem;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.icon-btn {
  width: 2.25rem;
  height: 2.25rem;
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
}

.top-nav.is-transparent .icon-btn.p-button:hover {
  background: rgba(255, 255, 255, 0.18);
}

.top-nav.is-opaque .icon-btn.p-button:hover {
  background: rgba(99, 73, 44, 0.1);
}

.cart-btn {
  position: relative;
}

.desktop-cart-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.cart-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(45%, -45%);
  min-width: 1rem;
  height: 1rem;
  line-height: 1rem;
  font-size: 0.62rem;
  z-index: 2;
}

.page-content {
  min-height: 100vh;
  padding-top: 72px;
}

.page-content.home-overlay {
  padding-top: 0;
}

.woodcraft-menubar :deep(.p-menubar-button) {
  display: none;
  color: inherit;
}

.woodcraft-menubar :deep(.p-menubar-root-list) {
  flex-wrap: nowrap;
}

.mobile-sidebar-content {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.mobile-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.mobile-sidebar-title {
  font-size: 1rem;
  font-weight: 650;
  color: #101010;
}

.mobile-search-wrap {
  position: relative;
  margin-bottom: 1rem;
}

.mobile-search-wrap .pi-search {
  position: absolute;
  left: 0.72rem;
  top: 50%;
  transform: translateY(-50%);
  color: #767676;
  font-size: 0.9rem;
  z-index: 1;
}

.mobile-search-input {
  width: 100%;
}

.mobile-search-input :deep(.p-inputtext) {
  width: 100%;
  padding-left: 2.1rem;
  border-color: #d6d6d6;
  color: #111;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.mobile-nav-link {
  border: 0;
  background: transparent;
  color: #111;
  border-radius: 8px;
  padding: 0.7rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
}

.mobile-nav-link:hover {
  background: #f5f5f5;
}

.mobile-nav-link i {
  font-size: 0.95rem;
}

.mobile-sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #ececec;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  align-items: stretch;
  overflow: visible;
}

.mobile-footer-btn {
  justify-content: center;
  border-color: #d8d8d8;
  color: #141414;
  width: 100%;
}

.mobile-cart-wrap {
  position: relative;
  display: flex;
  overflow: visible;
}

.mobile-cart-badge {
  position: absolute;
  top: -0.2rem;
  right: 0.1rem;
  transform: none;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.22rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 999px;
  background: #1c1c1c;
  color: #ffffff;
  z-index: 5;
  pointer-events: none;
}

@media (max-width: 1160px) {
  .woodcraft-menubar {
    padding: 0.65rem 1rem;
  }

  .brand-text {
    display: none;
  }

  .menu-link {
    padding: 0.45rem 0.5rem;
    gap: 0.35rem;
    font-size: 0.9rem;
  }

  .menu-icon {
    font-size: 0.85rem;
  }

  .icon-btn {
    width: 2.05rem;
    height: 2.05rem;
  }
}

@media (max-width: 960px) {
  .woodcraft-menubar {
    padding: 0.65rem 1rem;
  }
  .woodcraft-menubar :deep(.p-menubar-start) {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    margin-inline-end: 0;
    min-width: 0;
  }

  .nav-start {
    width: 100%;
    justify-content: space-between;
  }

  .woodcraft-menubar :deep(.p-menubar-root-list) {
    display: none;
  }

  .mobile-menu-btn {
    display: inline-flex;
  }

  .nav-actions {
    display: none;
  }

  .brand-text {
    font-size: 0.88rem;
  }

  .page-content {
    padding-top: 64px;
  }

  .page-content.home-overlay {
    padding-top: 0;
  }
}
</style>
