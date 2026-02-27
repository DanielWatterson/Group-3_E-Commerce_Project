<template>
  <div class="guest-banner" v-if="isGuest">
    <div class="banner-content">
      <i class="pi pi-eye"></i>
      <span>
        Preview mode -
        <a href="#" @click.prevent="goToLogin">Login</a> or
        <a href="#" @click.prevent="goToSignup">Sign up</a> to purchase
      </span>
      <button class="close-banner" @click="$emit('close')">
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();
const isGuest = computed(() => store.getters.isGuest);

const goToLogin = () => router.push("/login");
const goToSignup = () => router.push("/login?mode=signup");
</script>

<style scoped>
.guest-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 1000;
}
.banner-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  position: relative;
}
.banner-content a {
  color: white;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}
.close-banner {
  position: absolute;
  right: 0;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.8;
}
@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
    padding-right: 2rem;
  }
}
</style>
