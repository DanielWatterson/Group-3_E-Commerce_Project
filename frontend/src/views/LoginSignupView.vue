<script>
export default {
  name: "LoginSignupView",
  data() {
    return {
      login: true,
      newCustomer: {
        customer_name: "",
        email: "",
        password: "",
      },
      loginCustomer: {
        email: "",
        password: "",
      }
    };
  },
  methods: {
    async postCustomer() {
      try {
        await this.$store.dispatch("postCustomer", this.newCustomer);
        alert("Registration successful! Please login.");
        this.login = true; // Switch to login form
        // Clear signup form
        this.newCustomer = {
          customer_name: "",
          email: "",
          password: "",
        };
      } catch (error) {
        console.error("Registration failed:", error);
      }
    },
    async loginMethod() {
      try {
        await this.$store.dispatch("login", this.loginCustomer);
        // Clear login form
        this.loginCustomer = {
          email: "",
          password: "",
        };
        // Redirect to home page after successful login
        this.$router.push('/');
      } catch (error) {
        console.error("Login failed:", error);
      }
    },
  },
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>{{ login ? 'Welcome Back' : 'Create Account' }}</h1>
        <p>{{ login ? 'Please login to your account' : 'Sign up to get started' }}</p>
      </div>

      <div class="toggle-section">
        <button 
          @click="login = !login" 
          class="toggle-btn"
        >
          {{ login ? 'Need an account? Sign up' : 'Already have an account? Login' }}
        </button>
      </div>

      <div class="form-section">
        <!-- Login Form -->
        <form v-if="login" @submit.prevent="loginMethod" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email"
              v-model="loginCustomer.email" 
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password"
              v-model="loginCustomer.password" 
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" class="submit-btn">Login</button>
        </form>

        <!-- Signup Form -->
        <form v-else @submit.prevent="postCustomer" class="auth-form">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              v-model="newCustomer.customer_name" 
              placeholder="Enter your full name"
              required
            />
          </div>

          <div class="form-group">
            <label for="signup-email">Email</label>
            <input 
              type="email" 
              id="signup-email"
              v-model="newCustomer.email" 
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="form-group">
            <label for="signup-password">Password</label>
            <input 
              type="password" 
              id="signup-password"
              v-model="newCustomer.password" 
              placeholder="Create a password (min. 6 characters)"
              required
              minlength="6"
            />
          </div>

          <button type="submit" class="submit-btn">Sign Up</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #666;
}

.toggle-section {
  text-align: center;
  margin-bottom: 2rem;
}

.toggle-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 0.95rem;
  text-decoration: underline;
  transition: color 0.3s;
}

.toggle-btn:hover {
  color: #764ba2;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}
</style>