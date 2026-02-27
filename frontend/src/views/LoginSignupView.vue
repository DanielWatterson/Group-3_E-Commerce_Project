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
      },
      loginError: "",
      signupError: "",
      isLoading: false,
      passwordErrors: [],
      passwordStrength: 0,
    };
  },

  computed: {
  passwordRequirements() {
    const password = this.newCustomer.password || "";
    const errors = [];
    let strength = 0;
    
    if (password.length < 8) {
      errors.push("At least 8 characters");
    } else {
      strength += 25;
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    } else {
      strength += 25;
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    } else {
      strength += 15;
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    } else {
      strength += 20;
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("One special character");
    } else {
      strength += 15;
    }
    
    if (/\s/.test(password)) {
      errors.push("No spaces allowed");
    } else if (strength < 100) {
      strength = Math.min(strength + 5, 100);
    }
    
    this.passwordErrors = errors;
    this.passwordStrength = strength;
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      strength: strength
    };
  }
},
  methods: {
    async postCustomer() {
      this.signupError = "";
      this.isLoading = true;
      
      try {
        await this.$store.dispatch("postCustomer", this.newCustomer);
        alert("Registration successful! Please login.");
        this.login = true; 
        this.newCustomer = {
          customer_name: "",
          email: "",
          password: "",
        };
      } catch (error) {
        console.error("Registration failed:", error);
        this.signupError = error.response?.data?.message || "Registration failed";
      } finally {
        this.isLoading = false;
      }
    },
    async loginMethod() {
      this.loginError = "";
      this.isLoading = true;
      
      try {
        const didLogin = await this.$store.dispatch(
          "login",
          this.loginCustomer,
        );

        if (didLogin) {
          this.loginCustomer = {
            email: "",
            password: "",
          };
          this.$router.push("/");
        }
      } catch (error) {
        console.error("Login failed:", error);
        this.loginError = error.response?.data?.message || "Invalid email or password";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>{{ login ? "Welcome Back" : "Create Account" }}</h1>
        <p>
          {{
            login ? "Please login to your account" : "Sign up to get started"
          }}
        </p>
      </div>

      <div class="toggle-section">
        <button @click="login = !login" class="toggle-btn">
          {{
            login
              ? "Need an account? Sign up"
              : "Already have an account? Login"
          }}
        </button>
      </div>

      <div class="form-section">
        <form v-if="login" @submit.prevent="loginMethod" class="auth-form">
          <div v-if="loginError" class="error-message">
            {{ loginError }}
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              v-model="loginCustomer.email"
              placeholder="Enter your email"
              required
              :disabled="isLoading"
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
              :disabled="isLoading"
            />
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? "Logging in..." : "Login" }}
          </button>
        </form>

        <!-- SIGNUP FORM -->
<form v-else @submit.prevent="postCustomer" class="auth-form">
  <div v-if="signupError" class="error-message">
    {{ signupError }}
  </div>

  <div class="form-group">
    <label for="name">Full Name</label>
    <input
      type="text"
      id="name"
      v-model="newCustomer.customer_name"
      placeholder="Enter your full name"
      required
      :disabled="isLoading"
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
      :disabled="isLoading"
    />
  </div>

  <div class="form-group">
    <label for="signup-password">Password</label>
    <input
      type="password"
      id="signup-password"
      v-model="newCustomer.password"
      placeholder="Create a password"
      required
      minlength="8"
      :disabled="isLoading"
      @input="passwordRequirements" 
    />
    
    <!-- Password strength bar -->
    <div class="password-strength" v-if="newCustomer.password">
      <div 
        class="strength-bar" 
        :style="{ width: passwordStrength + '%' }"
        :class="{
          'weak': passwordStrength < 40,
          'medium': passwordStrength >= 40 && passwordStrength < 70,
          'strong': passwordStrength >= 70
        }"
      ></div>
    </div>
    
    <!-- Password requirements list -->
    <div class="password-requirements" v-if="newCustomer.password">
      <p class="requirements-title">Password must contain:</p>
      <ul>
        <li 
          v-for="error in passwordErrors" 
          :key="error"
          class="requirement unmet"
        >
          ❌ {{ error }}
        </li>
        <li 
          v-for="req in [
            'At least 8 characters',
            'One uppercase letter',
            'One lowercase letter', 
            'One number',
            'One special character',
            'No spaces'
          ].filter(r => !passwordErrors.includes(r))" 
          :key="req"
          class="requirement met"
        >
          ✅ {{ req }}
        </li>
      </ul>
    </div>
  </div>

  <button type="submit" class="submit-btn" :disabled="isLoading || (newCustomer.password && !passwordRequirements.isValid)">
    {{ isLoading ? "Creating Account..." : "Sign Up" }}
  </button>
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
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
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.error-message {
  background-color: #fee;
  color: #c00;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #fcc;
  font-size: 0.95rem;
  text-align: center;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* Password validation styles */
.password-strength {
  height: 5px;
  background-color: #e0e0e0;
  border-radius: 5px;
  margin: 10px 0;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s ease;
}

.strength-bar.weak {
  background-color: #ff4444;
}

.strength-bar.medium {
  background-color: #ffaa00;
}

.strength-bar.strong {
  background-color: #00c851;
}

.password-requirements {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  font-size: 0.9rem;
}

.requirements-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirement {
  padding: 4px 0;
  font-size: 0.85rem;
}

.requirement.met {
  color: #00c851;
}

.requirement.unmet {
  color: #ff4444;
}

</style>
 
