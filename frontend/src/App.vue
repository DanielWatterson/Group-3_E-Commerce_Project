<script>
import Menubar from 'primevue/menubar';
import Button from 'primevue/button';

export default {
  components: {
    Menubar,
    Button
  },
  data() {
    return {
      isScrolled: false,
      items: [
        {
          label: 'Shop',
          icon: 'pi pi-shopping-bag',
        },
        {
          label: 'Custom Builder',
          icon: 'pi pi-cog',
        },
        {
          label: 'Virtual Showrooms',
          icon: 'pi pi-images',
        },
        {
          label: 'B2B',
          icon: 'pi pi-briefcase',
        }
      ]
    };
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 10;
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }
};
</script>



<template>
  <div class="app-container">
    <header :class="{ 'scrolled': isScrolled }">
      <Menubar :model="items" class="custom-menubar">
        <template #start>
          <div class="logo">
            <img src="https://via.placeholder.com/150x50?text=LumberLink+Desks" alt="Logo" />
          </div>
        </template>
        <template #end>
          <div class="auth-section">
            <Button icon="pi pi-search" class="p-button-rounded p-button-text" />
            <Button icon="pi pi-user" class="p-button-rounded p-button-text" />
            <Button icon="pi pi-shopping-cart" class="p-button-rounded p-button-text" />
          </div>
        </template>
      </Menubar>
    </header>

    <div class="hero-section">
      <div class="hero-content">
        <h1>Workspaces Redefined.</h1>
        <p>Sustainable wood meets high-performance tech. Custom built for your home, office, or battle station.</p>
        <div class="hero-buttons">
          <Button label="Shop Now" class="p-button-rounded shop-button" />
          <Button label="Design Your Desk" class="p-button-rounded p-button-outlined" />
        </div>
      </div>
    </div>

    
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>


<style scoped>
.app-container {
  min-height: 100vh;
}

header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background 0.3s ease;
  padding: 0;
}

header:not(.scrolled) .custom-menubar {
  background: transparent;
  border: none;
}

header.scrolled .custom-menubar {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo img {
  height: 40px;
}

.hero-section {
  background-image: url('https://via.placeholder.com/1920x600');
  background-size: cover;
  background-position: center;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  margin-top: 70px;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.shop-button {
  background-color: #8B4513;
  border-color: #8B4513;
  color: white;
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}
</style>



