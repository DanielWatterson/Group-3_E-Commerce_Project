<script>
import CustomersList from '@/components/CustomersList.vue';

export default {
  name: "CustomersView",
  
  components: {
    CustomersList,
  },

  computed: {
    customerData() {
      return this.$store.state.customer;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },

  mounted() {
    if (this.isAuthenticated) {
      this.$store.dispatch("getCustomer");
    }
  },

  watch: {
    isAuthenticated(newVal) {
      if (newVal) {
        this.$store.dispatch("getCustomer");
      }
    }
  }
};
</script>

<template>
  <div class="customers-container">
    <div class="page-header">
      <h1>Our Customers</h1>
      <p>View and manage customer information</p>
    </div>
    
    <div class="content-card">
      <div v-if="isAuthenticated" class="customers-list-wrapper">
        <CustomersList :customer-data="customerData" />
      </div>
      <div v-else class="auth-message">
        <p>Please login to view customers</p>
        <router-link to="/login" class="login-link">Go to Login</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customers-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-header p {
  color: rgba(255,255,255,0.9);
  font-size: 1.1rem;
}

.content-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}

.auth-message {
  text-align: center;
  padding: 3rem;
}

.auth-message p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.login-link {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 500;
  transition: transform 0.3s, box-shadow 0.3s;
}

.login-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.customers-list-wrapper {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>