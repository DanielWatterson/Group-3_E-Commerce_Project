<script>
export default {
  computed: {
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/');
    }
  }
}
</script>

<template>
  <div class="app-container">
    <header>
      <nav>
        <div class="nav-links">
          <router-link to="/">Home</router-link> |
          <router-link to="/customers">Customers</router-link>
        </div>
        <div class="auth-section">
          <template v-if="!isAuthenticated">
            <router-link to="/login" class="login-btn">Login / Signup</router-link>
          </template>
          <template v-else>
            <span class="welcome-text">Welcome!</span>
            <button @click="logout" class="logout-btn">Logout</button>
          </template>
        </div>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

header {
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 1rem 2rem;
}

nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #667eea;
}

.nav-links a.router-link-active {
  color: #667eea;
  font-weight: 600;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  color: #667eea;
  font-weight: 500;
}

.login-btn {
  text-decoration: none;
  color: #667eea;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: 2px solid #667eea;
  border-radius: 8px;
  transition: all 0.3s;
}

.login-btn:hover {
  background: #667eea;
  color: white;
}

.logout-btn {
  background: #ff4757;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #ff6b81;
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}
</style>