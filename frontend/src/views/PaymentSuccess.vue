<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import Card from 'primevue/card';

const router = useRouter();
const route = useRoute();
const store = useStore();

const checkingStatus = ref(true);
const paymentConfirmed = ref(false);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

onMounted(async () => {
  const paymentId = Number(route.query.payment_id);

  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    checkingStatus.value = false;
    return;
  }

  try {
    const { data } = await axios.get(`${apiBaseUrl}/payments/${paymentId}`);

    if (data?.payment_status === 'completed') {
      paymentConfirmed.value = true;
      store.dispatch('clearCart');
      localStorage.removeItem('pendingOrder');
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
  } finally {
    checkingStatus.value = false;
  }
});
</script>

<template>
  <div class="payment-status">
    <Card class="status-card">
      <template #content>
        <div class="status-content">
          <div :class="paymentConfirmed ? 'success-icon' : 'pending-icon'">{{ paymentConfirmed ? '?' : '…' }}</div>
          <h1>{{ paymentConfirmed ? 'Payment Successful!' : 'Payment Verification Pending' }}</h1>

          <p v-if="checkingStatus">Checking your payment status...</p>
          <p v-else-if="paymentConfirmed">Thank you for your purchase. Your order has been confirmed.</p>
          <p v-else>
            We could not confirm payment yet. If you completed payment, please refresh shortly or contact support.
          </p>

          <p class="order-info">
            {{ paymentConfirmed ? 'A confirmation email has been sent to your email address.' : 'Your cart was not cleared.' }}
          </p>

          <div class="status-actions">
            <Button label="Continue Shopping" @click="router.push('/products')" />
            <Button
              v-if="!paymentConfirmed"
              label="Return to Cart"
              class="p-button-outlined"
              @click="router.push('/cart')"
            />
            <Button
              v-else
              label="Return Home"
              class="p-button-outlined"
              @click="router.push('/')"
            />
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

.success-icon,
.pending-icon {
  width: 80px;
  height: 80px;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
}

.success-icon {
  background: #38a169;
}

.pending-icon {
  background: #d69e2e;
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
  color: #8b4513;
  margin: 1rem 0 2rem;
}

.status-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
