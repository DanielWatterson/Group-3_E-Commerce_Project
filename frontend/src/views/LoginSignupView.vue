<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

const isLogin = ref(true);
const isLoading = ref(false);
const error = ref("");

const loginData = ref({ email: "", password: "" });
const signupData = ref({ customer_name: "", email: "", password: "" });

const login = async () => {
  error.value = "";
  isLoading.value = true;
  try {
    await store.dispatch("login", loginData.value);
    router.push("/");
  } catch (err) {
    error.value = "Invalid email or password";
  } finally {
    isLoading.value = false;
  }
};

const signup = async () => {
  error.value = "";
  isLoading.value = true;
  try {
    await store.dispatch("postCustomer", signupData.value);
    isLogin.value = true;
    signupData.value = { customer_name: "", email: "", password: "" };
  } catch (err) {
    error.value = "Registration failed";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>{{ isLogin ? "Welcome Back" : "Create Account" }}</h1>

      <div class="toggle">
        <button @click="isLogin = !isLogin">
          {{
            isLogin
              ? "Need an account? Sign up"
              : "Already have an account? Login"
          }}
        </button>
      </div>

      <div v-if="error" class="error">{{ error }}</div>

      <form @submit.prevent="isLogin ? login() : signup()">
        <!-- Signup only fields -->
        <template v-if="!isLogin">
          <input
            v-model="signupData.customer_name"
            placeholder="Full Name"
            required
          />
        </template>

        <!-- Common fields with separate v-model -->
        <input
          v-if="isLogin"
          v-model="loginData.email"
          type="email"
          placeholder="Email"
          required
        />
        <input
          v-else
          v-model="signupData.email"
          type="email"
          placeholder="Email"
          required
        />

        <input
          v-if="isLogin"
          v-model="loginData.password"
          type="password"
          placeholder="Password"
          required
        />
        <input
          v-else
          v-model="signupData.password"
          type="password"
          placeholder="Password"
          required
        />

        <button type="submit" :disabled="isLoading" class="submit-btn">
          {{ isLoading ? "Please wait..." : isLogin ? "Login" : "Sign Up" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 70vh;
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
  max-width: 400px;
}
h1 {
  text-align: center;
  margin-bottom: 1rem;
}
.toggle {
  text-align: center;
  margin-bottom: 1.5rem;
}
.toggle button {
  background: none;
  border: none;
  color: #8b4513;
  cursor: pointer;
  text-decoration: underline;
}
.error {
  background: #fee;
  color: #c00;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
input {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.submit-btn {
  padding: 0.75rem;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
