<template>
  <div class="premium-overlay" v-if="show">
    <div class="overlay-content">
      <i class="pi pi-lock premium-icon"></i>
      <h3>Premium Feature</h3>
      <p>{{ message || "Login to access" }}</p>
      <Button
        label="Login"
        icon="pi pi-sign-in"
        size="small"
        @click="goToLogin"
      />
      <Button
        label="Sign Up"
        icon="pi pi-user-plus"
        class="p-button-outlined p-button-sm"
        @click="goToSignup"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

defineProps({
  show: Boolean,
  message: String,
});

const router = useRouter();
const goToLogin = () => router.push("/login");
const goToSignup = () => router.push("/login?mode=signup");
</script>

<style scoped>
.premium-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.overlay-content {
  text-align: center;
  padding: 2rem;
}
.premium-icon {
  font-size: 3rem;
  color: #8b4513;
  margin-bottom: 1rem;
}
</style>
