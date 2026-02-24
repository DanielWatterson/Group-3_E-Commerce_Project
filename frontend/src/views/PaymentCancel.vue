<script setup>
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';

const router = useRouter();
</script>

<template>
  <div class="payment-status">
    <Card class="status-card">
      <template #content>
        <div class="status-content">
          <div class="cancel-icon">✕</div>
          <h1>Payment Cancelled</h1>
          <p>Your payment was cancelled. No charges were made.</p>
          <p class="order-info">You can try again or continue shopping.</p>
          <div class="status-actions">
            <Button label="Try Again" @click="router.push('/cart')" />
            <Button label="Continue Shopping" class="p-button-outlined" @click="router.push('/products')" />
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

.cancel-icon {
  width: 80px;
  height: 80px;
  background: #e53e3e;
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