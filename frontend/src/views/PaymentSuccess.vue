<script setup>
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { onMounted } from 'vue';
import Button from 'primevue/button';
import Card from 'primevue/card';

const router = useRouter();
const store = useStore();

onMounted(() => {
  // Clear the cart on successful payment
  store.dispatch('clearCart');
  localStorage.removeItem('pendingOrder');
});
</script>

<template>
  <div class="payment-status">
    <Card class="status-card">
      <template #content>
        <div class="status-content">
          <div class="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p>Thank you for your purchase. Your order has been confirmed.</p>
          <p class="order-info">A confirmation email has been sent to your email address.</p>
          <div class="status-actions">
            <Button label="Continue Shopping" @click="router.push('/products')" />
            <Button label="Return Home" class="p-button-outlined" @click="router.push('/')" />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.payment-status {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.status-card {
  max-width: 500px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
}

.status-content {
  text-align: center;
  padding: 2rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: #38a169;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
}

h1 {
  color: #2d3748;
  margin-bottom: 1rem;
}

p {
  color: #718096;
  margin-bottom: 0.5rem;
}

.order-info {
  color: #8B4513;
  margin: 1rem 0 2rem;
}

.status-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>