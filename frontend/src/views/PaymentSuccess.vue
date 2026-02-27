<script setup>
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { onMounted, ref } from "vue";
import axios from "axios";
import Button from "primevue/button";
import Card from "primevue/card";

const router = useRouter();
const route = useRoute();
const store = useStore();

const checkingStatus = ref(true);
const paymentConfirmed = ref(false);

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";
const verifyAttempts = 12;
const verifyDelayMs = 2500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getPendingOrder() {
  try {
    const raw = localStorage.getItem("pendingOrder");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearPendingCartData() {
  store.dispatch("clearCart");
  localStorage.removeItem("pendingOrder");
}

function resolvePaymentId() {
  const directId = Number(route.query.payment_id);
  if (Number.isInteger(directId) && directId > 0) {
    return directId;
  }

  const pendingOrder = getPendingOrder();
  const pendingId = Number(pendingOrder?.payment_id);
  return Number.isInteger(pendingId) && pendingId > 0 ? pendingId : null;
}

async function fetchPaymentStatus(paymentId) {
  const { data } = await axios.get(`${apiBaseUrl}/payments/${paymentId}`);
  return String(data?.payment_status || "").toLowerCase();
}

async function waitForCompletedStatus(paymentId) {
  for (let attempt = 1; attempt <= verifyAttempts; attempt += 1) {
    const status = await fetchPaymentStatus(paymentId);

    if (status === "completed") {
      return true;
    }

    if (status === "failed") {
      return false;
    }

    if (attempt < verifyAttempts) {
      await sleep(verifyDelayMs);
    }
  }

  return false;
}

async function finalizeForLocalhost(paymentId) {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  if (!isLocalhost) {
    return false;
  }

  try {
    await axios.patch(`${apiBaseUrl}/payments/${paymentId}`, {
      payment_status: "completed",
    });
    return true;
  } catch (error) {
    console.warn("Localhost fallback finalization failed:", error);
    return false;
  }
}

onMounted(async () => {
  const paymentId = resolvePaymentId();

  if (!paymentId) {
    checkingStatus.value = false;
    return;
  }

  try {
    const queryStatus = String(route.query.payment_status || "").toUpperCase();

    if (queryStatus === "COMPLETE") {
      paymentConfirmed.value = true;
      clearPendingCartData();
      return;
    }

    const verified = await waitForCompletedStatus(paymentId);
    if (verified) {
      paymentConfirmed.value = true;
      clearPendingCartData();
      return;
    }

    // In local dev, ITN callbacks usually cannot reach localhost.
    // Fallback to finalize after a successful return redirect.
    const localFinalized = await finalizeForLocalhost(paymentId);
    if (localFinalized) {
      paymentConfirmed.value = true;
      clearPendingCartData();
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
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
          <div :class="paymentConfirmed ? 'success-icon' : 'pending-icon'">
            {{ paymentConfirmed ? "OK" : "..." }}
          </div>
          <h1>
            {{ paymentConfirmed ? "Payment Successful!" : "Payment Verification Pending" }}
          </h1>

          <p v-if="checkingStatus">Checking your payment status...</p>
          <p v-else-if="paymentConfirmed">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <p v-else>
            We could not confirm payment yet. If you completed payment, please refresh shortly or contact support.
          </p>

          <p class="order-info">
            {{ paymentConfirmed ? "A confirmation email has been sent to your email address." : "Your cart was not cleared." }}
          </p>

          <div class="status-actions">
            <Button label="Continue Shopping" @click="router.push('/products')" />
            <Button
              v-if="!paymentConfirmed"
              label="Refresh Status"
              class="p-button-outlined"
              @click="router.go(0)"
            />
            <Button
              v-if="!paymentConfirmed"
              label="Back to Cart"
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
  max-width: 540px;
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
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
  font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
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
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
