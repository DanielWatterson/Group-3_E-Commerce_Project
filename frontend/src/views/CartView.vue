<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";
import RadioButton from "primevue/radiobutton";
import Toast from "primevue/toast";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import { ref, computed } from "vue";
import payfastService from "@/services/payfast";

export default {
  name: "CartView",
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

    const cartItems = computed(() => store.getters.cartItems || []);
    const cartTotal = computed(() => store.getters.cartTotal || 0);
    const cartCount = computed(() => store.getters.cartCount || 0);
    const isAuthenticated = computed(() => store.getters.isAuthenticated);

    const updating = ref(false);
    const processingPayment = ref(false);
    const showConfirmDialog = ref(false);
    const termsAccepted = ref(false);
    const paymentMethod = ref("payfast");

    const customerInfo = ref({
      firstName: localStorage.getItem("userName")?.split(" ")[0] || "",
      lastName: localStorage.getItem("userName")?.split(" ")[1] || "",
      email: localStorage.getItem("userEmail") || "",
      phone: "",
      address: "",
      city: "",
      province: "",
      postalCode: "",
      deliveryInstructions: "",
    });

    const provinces = ref([
      "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
      "Free State", "Limpopo", "Mpumalanga", "North West", "Northern Cape"
    ]);

    const formatPrice = (price) => {
      return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
      }).format(price || 0);
    };

    const updateQuantity = async (item, newQuantity) => {
      if (newQuantity < 1) {
        removeItem(item);
        return;
      }
      if (newQuantity > item.quantity) {
        toast.add({
          severity: "warn",
          summary: "Stock Limit",
          detail: `Only ${item.quantity} available`,
          life: 2000,
        });
        return;
      }
      updating.value = true;
      try {
        await store.dispatch("updateCartQuantity", {
          productId: item.product_id,
          quantity: newQuantity,
        });
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to update quantity",
          life: 3000,
        });
      } finally {
        updating.value = false;
      }
    };

    const addOne = async (item) => {
      const newQuantity = item.cart_quantity + 1;
      if (newQuantity <= item.quantity) {
        await updateQuantity(item, newQuantity);
      } else {
        toast.add({
          severity: "warn",
          summary: "Out of Stock",
          detail: `Only ${item.quantity} available`,
          life: 2000,
        });
      }
    };

    const removeOne = async (item) => {
      const newQuantity = item.cart_quantity - 1;
      if (newQuantity >= 1) {
        await updateQuantity(item, newQuantity);
      } else {
        removeItem(item);
      }
    };

    const removeItem = async (item) => {
      updating.value = true;
      try {
        await store.dispatch("removeFromCart", item.product_id);
        toast.add({
          severity: "info",
          summary: "Item Removed",
          detail: `${item.product_name} removed from cart`,
          life: 2000,
        });
      } catch (error) {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: "Failed to remove item",
          life: 3000,
        });
      } finally {
        updating.value = false;
      }
    };

    const clearCart = async () => {
      if (cartItems.value.length === 0) return;
      if (confirm("Are you sure you want to clear your cart?")) {
        updating.value = true;
        try {
          await store.dispatch("clearCart");
          toast.add({
            severity: "info",
            summary: "Cart Cleared",
            detail: "All items have been removed",
            life: 3000,
          });
        } catch (error) {
          toast.add({
            severity: "error",
            summary: "Error",
            detail: "Failed to clear cart",
            life: 3000,
          });
        } finally {
          updating.value = false;
        }
      }
    };

    const validateCustomerInfo = () => {
      const { firstName, lastName, email, phone, address, city, province, postalCode } = customerInfo.value;
      if (!firstName || !lastName || !email || !phone) {
        toast.add({
          severity: "warn",
          summary: "Missing Information",
          detail: "Please fill in all personal details",
          life: 3000,
        });
        return false;
      }
      if (!address || !city || !province || !postalCode) {
        toast.add({
          severity: "warn",
          summary: "Missing Information",
          detail: "Please fill in your delivery address",
          life: 3000,
        });
        return false;
      }
      return true;
    };

    const openConfirmDialog = () => {
      if (!isAuthenticated.value) {
        toast.add({
          severity: "warn",
          summary: "Login Required",
          detail: "Please login to complete your purchase",
          life: 3000,
        });
        router.push("/login");
        return;
      }
      if (cartItems.value.length === 0) {
        toast.add({
          severity: "warn",
          summary: "Empty Cart",
          detail: "Your cart is empty",
          life: 3000,
        });
        return;
      }
      if (!validateCustomerInfo()) {
        return;
      }
      showConfirmDialog.value = true;
    };

    const processPayment = async () => {
      if (!termsAccepted.value) {
        toast.add({
          severity: "warn",
          summary: "Terms Required",
          detail: "Please accept the terms and conditions",
          life: 3000,
        });
        return;
      }

      processingPayment.value = true;
      showConfirmDialog.value = false;

      try {
        const total = Number(cartTotal.value) * 1.15;

        const order = {
          amount: total.toFixed(2),
          item_name: cartItems.value.length === 1
            ? cartItems.value[0].product_name
            : `Order (${cartCount.value} items)`,
          name_first: customerInfo.value.firstName?.trim() || "Customer",
          name_last: customerInfo.value.lastName?.trim() || "",
          email_address: customerInfo.value.email?.toLowerCase().trim() || "test@example.com",
        };

        localStorage.setItem("pendingOrder", JSON.stringify({
          ...order,
          items: cartItems.value,
          shipping: customerInfo.value
        }));

        toast.add({
          severity: "info",
          summary: "Redirecting to PayFast",
          detail: "You will be redirected to complete payment",
          life: 3000,
        });

        setTimeout(() => {
          payfastService.redirectToPayFast(order);
        }, 1500);
      } catch (error) {
        console.error("Payment error:", error);
        toast.add({
          severity: "error",
          summary: "Payment Failed",
          detail: error.message || "Please try again",
          life: 5000,
        });
        processingPayment.value = false;
        showConfirmDialog.value = true;
      }
    };

    return {
      cartItems,
      cartTotal,
      cartCount,
      isAuthenticated,
      updating,
      processingPayment,
      showConfirmDialog,
      termsAccepted,
      paymentMethod,
      customerInfo,
      provinces,
      formatPrice,
      addOne,
      removeOne,
      removeItem,
      clearCart,
      openConfirmDialog,
      processPayment,
      continueShopping: () => router.push("/products"),
    };
  },
};
</script>

<template>
  <div class="cart-view">
    <Toast />
    <div class="page-header">
      <h1>Shopping Cart</h1>
      <p v-if="cartItems.length > 0">
        You have <strong>{{ cartCount }}</strong> item{{ cartCount !== 1 ? "s" : "" }} in your cart
      </p>
      <p v-else>Your cart is waiting to be filled</p>
    </div>

    <div class="cart-container">
      <div v-if="cartItems.length === 0" class="empty-cart">
        <Card class="empty-cart-card">
          <template #content>
            <div class="empty-cart-content">
              <i class="pi pi-shopping-cart empty-icon"></i>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any items yet</p>
              <Button label="Browse Products" icon="pi pi-shopping-bag" class="shop-btn" @click="continueShopping" />
            </div>
          </template>
        </Card>
      </div>

      <div v-else class="cart-with-items">
        <div class="cart-main">
          <Card class="items-card">
            <template #title>
              <div class="section-header">
                <h2>Your Items</h2>
                <Button label="Clear Cart" icon="pi pi-trash" class="p-button-text p-button-danger" :disabled="updating" @click="clearCart" />
              </div>
            </template>
            <template #content>
              <div class="cart-items-list">
                <div v-for="item in cartItems" :key="item.product_id" class="cart-item-card">
                  <div class="item-image">
                    <div class="image-placeholder">
                      <i class="pi pi-box"></i>
                    </div>
                  </div>
                  <div class="item-details">
                    <div class="item-header">
                      <h3>{{ item.product_name }}</h3>
                      <span class="item-id">#{{ item.product_id }}</span>
                    </div>
                    <div class="item-price-row">
                      <div class="item-price">{{ formatPrice(item.product_price) }} each</div>
                      <div class="item-total">
                        Total: <strong>{{ formatPrice(item.product_price * item.cart_quantity) }}</strong>
                      </div>
                    </div>
                    <div class="item-actions">
                      <div class="quantity-controls">
                        <label>Quantity:</label>
                        <div class="quantity-buttons">
                          <Button icon="pi pi-minus" class="p-button-rounded p-button-text quantity-btn" :disabled="updating || item.cart_quantity <= 1" @click="removeOne(item)" />
                          <span class="quantity-display">{{ item.cart_quantity }}</span>
                          <Button icon="pi pi-plus" class="p-button-rounded p-button-text quantity-btn" :disabled="updating || item.cart_quantity >= item.quantity" @click="addOne(item)" />
                        </div>
                        <small v-if="item.quantity < 10" class="stock-warning">Only {{ item.quantity }} left</small>
                      </div>
                      <Button icon="pi pi-trash" class="p-button-rounded p-button-outlined p-button-danger remove-btn" :disabled="updating" @click="removeItem(item)" />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <Card class="info-card">
            <template #title><h2>Your Information</h2></template>
            <template #content>
              <div class="info-grid">
                <div class="info-row">
                  <div class="info-field">
                    <label>First Name *</label>
                    <InputText v-model="customerInfo.firstName" placeholder="John" />
                  </div>
                  <div class="info-field">
                    <label>Last Name *</label>
                    <InputText v-model="customerInfo.lastName" placeholder="Doe" />
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-field">
                    <label>Email *</label>
                    <InputText v-model="customerInfo.email" type="email" placeholder="john@example.com" />
                  </div>
                  <div class="info-field">
                    <label>Phone *</label>
                    <InputText v-model="customerInfo.phone" placeholder="081 234 5678" />
                  </div>
                </div>
                <div class="info-field full-width">
                  <label>Street Address *</label>
                  <InputText v-model="customerInfo.address" placeholder="123 Main Street" />
                </div>
                <div class="info-row">
                  <div class="info-field">
                    <label>City *</label>
                    <InputText v-model="customerInfo.city" placeholder="Johannesburg" />
                  </div>
                  <div class="info-field">
                    <label>Province *</label>
                    <Dropdown v-model="customerInfo.province" :options="provinces" placeholder="Select Province" />
                  </div>
                  <div class="info-field">
                    <label>Postal Code *</label>
                    <InputText v-model="customerInfo.postalCode" placeholder="2000" />
                  </div>
                </div>
                <div class="info-field full-width">
                  <label>Delivery Instructions (Optional)</label>
                  <InputText v-model="customerInfo.deliveryInstructions" placeholder="Gate code, special instructions" />
                </div>
              </div>
            </template>
          </Card>

          <Card class="payment-card">
            <template #title><h2>Payment Method</h2></template>
            <template #content>
              <div class="payment-methods">
                <div class="payment-option" :class="{ selected: paymentMethod === 'payfast' }">
                  <RadioButton v-model="paymentMethod" inputId="payfast" value="payfast" />
                  <label for="payfast" class="payment-label">
                    <span class="payment-name">PayFast</span>
                    <span class="payment-badge">Recommended</span>
                  </label>
                  <div class="payment-icons">
                    <i class="pi pi-credit-card"></i>
                    <i class="pi pi-paypal"></i>
                    <span class="payfast-icon">EFT</span>
                  </div>
                </div>
                <div class="test-info">
                  <h4>Test Mode Information</h4>
                  <p>Use these test cards:</p>
                  <ul>
                    <li><strong>Visa:</strong> 4000 0000 0000 0002, CVV: 123, Expiry: 12/25</li>
                    <li><strong>Mastercard:</strong> 5300 0000 0000 0001, CVV: 123, Expiry: 12/25</li>
                    <li><strong>Instant EFT:</strong> Select FNB, any credentials</li>
                  </ul>
                  <p class="test-note">Test environment - no real money charged</p>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <div class="order-sidebar">
          <Card class="summary-card">
            <template #title><h2>Order Summary</h2></template>
            <template #content>
              <div class="summary-items">
                <div v-for="item in cartItems" :key="item.product_id" class="summary-item">
                  <span>{{ item.product_name }} x{{ item.cart_quantity }}</span>
                  <span class="item-price">{{ formatPrice(item.product_price * item.cart_quantity) }}</span>
                </div>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ formatPrice(cartTotal) }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span class="free">Free</span>
              </div>
              <div class="summary-row">
                <span>VAT (15%)</span>
                <span>{{ formatPrice(cartTotal * 0.15) }}</span>
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row total">
                <span>Total (ZAR)</span>
                <span class="total-amount">{{ formatPrice(cartTotal * 1.15) }}</span>
              </div>
              <Button label="Confirm & Pay" icon="pi pi-lock" class="checkout-btn" :disabled="processingPayment" @click="openConfirmDialog" />
              <div class="secure-badge">
                <i class="pi pi-shield"></i>
                <span>Secured by PayFast</span>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <Dialog v-model:visible="showConfirmDialog" header="Confirm Your Order" :modal="true" :style="{ width: '450px' }">
      <div class="confirmation-content">
        <div class="order-summary-mini">
          <h3>Order Summary</h3>
          <div class="summary-mini-row">
            <span>Items:</span>
            <span>{{ cartCount }}</span>
          </div>
          <div class="summary-mini-row">
            <span>Subtotal:</span>
            <span>{{ formatPrice(cartTotal) }}</span>
          </div>
          <div class="summary-mini-row">
            <span>VAT (15%):</span>
            <span>{{ formatPrice(cartTotal * 0.15) }}</span>
          </div>
          <div class="summary-mini-row total">
            <span>Total to Pay:</span>
            <span class="total-amount">{{ formatPrice(cartTotal * 1.15) }}</span>
          </div>
        </div>
        <div class="delivery-summary">
          <h4>Delivery to:</h4>
          <p>{{ customerInfo.firstName }} {{ customerInfo.lastName }}</p>
          <p>{{ customerInfo.address }}</p>
          <p>{{ customerInfo.city }}, {{ customerInfo.province }} {{ customerInfo.postalCode }}</p>
        </div>
        <div class="terms-checkbox">
          <Checkbox v-model="termsAccepted" :binary="true" inputId="terms" />
          <label for="terms">I confirm my order details are correct and agree to the terms and conditions.</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="showConfirmDialog = false" class="p-button-text" />
        <Button label="Confirm & Pay Now" icon="pi pi-lock" @click="processPayment" :disabled="!termsAccepted || processingPayment" :loading="processingPayment" class="confirm-btn" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.cart-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}
.page-header h1 {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}
.empty-cart {
  max-width: 600px;
  margin: 0 auto;
}
.empty-cart-card {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
}
.empty-cart-content {
  text-align: center;
  padding: 3rem;
}
.empty-icon {
  font-size: 5rem;
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}
.shop-btn {
  background: #8b4513;
  border: 2px solid #8b4513;
}
.cart-with-items {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}
.cart-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.items-card, .info-card, .payment-card, .summary-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.cart-item-card {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
.item-image {
  flex-shrink: 0;
}
.image-placeholder {
  width: 100px;
  height: 100px;
  background: #edf2f7;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-placeholder i {
  font-size: 2rem;
  color: #a0aec0;
}
.item-details {
  flex: 1;
}
.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.item-header h3 {
  margin: 0;
  font-size: 1.1rem;
}
.item-id {
  color: #a0aec0;
  font-size: 0.75rem;
}
.item-price-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.item-price {
  color: #8b4513;
  font-weight: 600;
}
.item-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.quantity-controls {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.quantity-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.quantity-btn {
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid #e2e8f0 !important;
}
.quantity-display {
  min-width: 2rem;
  text-align: center;
  font-weight: 600;
}
.stock-warning {
  color: #e53e3e;
  font-size: 0.7rem;
}
.remove-btn {
  width: 2rem;
  height: 2rem;
}
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.info-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.info-field.full-width {
  grid-column: 1 / -1;
}
.info-field label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4a5568;
}
.payment-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}
.payment-option.selected {
  border-color: #8b4513;
  background: #fff5f0;
}
.payment-icons {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}
.payfast-icon {
  background: #8b4513;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}
.test-info {
  background: #f0f9ff;
  border: 2px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}
.test-info h4 {
  color: #0369a1;
  margin: 0 0 0.5rem;
}
.test-note {
  color: #e53e3e;
  font-size: 0.8rem;
  font-weight: 600;
}
.order-sidebar {
  position: sticky;
  top: 100px;
  align-self: start;
}
.summary-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}
.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}
.item-price {
  color: #8b4513;
  font-weight: 600;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #718096;
}
.summary-row.total {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 1rem 0;
}
.total-amount {
  color: #8b4513;
  font-size: 1.4rem;
}
.free {
  color: #38a169;
  font-weight: 600;
}
.summary-divider {
  height: 2px;
  background: #e2e8f0;
  margin: 1rem 0;
}
.checkout-btn {
  background: #8b4513;
  border: 2px solid #8b4513;
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
}
.secure-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f0f9ff;
  border-radius: 8px;
  color: #0369a1;
  font-size: 0.8rem;
}
.confirmation-content {
  padding: 1rem 0;
}
.order-summary-mini {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}
.delivery-summary {
  margin-bottom: 1rem;
}
.terms-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
}
.confirm-btn {
  background: #8b4513;
  border: 2px solid #8b4513;
}
@media (max-width: 1024px) {
  .cart-with-items {
    grid-template-columns: 1fr;
  }
  .order-sidebar {
    position: static;
  }
}
@media (max-width: 768px) {
  .cart-view {
    padding: 1rem;
  }
  .cart-item-card {
    flex-direction: column;
  }
  .image-placeholder {
    width: 100%;
    height: 150px;
  }
  .info-row {
    grid-template-columns: 1fr;
  }
}
</style>