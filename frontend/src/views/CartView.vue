<script>
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
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

    const handleImageError = (event) => {
  event.target.style.display = 'none';
  event.target.parentElement.innerHTML = '<i class="pi pi-box"></i>';
}

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

    const continueShopping = () => {
      router.push("/products");
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
      customerInfo,
      provinces,
      formatPrice,
      addOne,
      removeOne,
      removeItem,
      clearCart,
      openConfirmDialog,
      processPayment,
      continueShopping,
      handleImageError
    };
  },
};
</script>

<template>
  <div class="cart-view">
    <Toast />
    
    <div class="cart-header">
      <button class="back-btn" @click="continueShopping">
        <i class="pi pi-arrow-left"></i>
        Continue Shopping
      </button>
      <h1>Shopping Cart</h1>
      <div class="cart-count-badge" v-if="cartItems.length > 0">
        {{ cartCount }} item{{ cartCount !== 1 ? "s" : "" }}
      </div>
    </div>

    <div class="cart-container">
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-cart-content">
          <i class="pi pi-shopping-cart empty-icon"></i>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items yet</p>
          <button class="shop-btn" @click="continueShopping">
            <i class="pi pi-shopping-bag"></i>
            Browse Products
          </button>
        </div>
      </div>

      <div v-else class="cart-with-items">
        <div class="cart-main">
          <div class="cart-items-section">
            <h2>Your Items</h2>
            
            <div v-for="item in cartItems" :key="item.product_id" class="cart-item">
                    <div class="item-image">
                      <img 
                        v-if="item.image_url" 
                        :src="item.image_url" 
                        :alt="item.product_name"
                        @error="handleImageError"
                      />
                      <i v-else class="pi pi-box"></i>
                    </div>
              
              <div class="item-details">
                <div class="item-header">
                  <h3>{{ item.product_name }}</h3>
                  <span class="item-price">{{ formatPrice(item.product_price * item.cart_quantity) }}</span>
                </div>
                
                <div class="item-meta">
                  <span class="item-unit-price">{{ formatPrice(item.product_price) }} each</span>
                </div>
                
                <div class="item-actions">
                  <div class="quantity-controls">
                    <button 
                      class="qty-btn" 
                      :disabled="updating || item.cart_quantity <= 1"
                      @click="removeOne(item)"
                    >
                      <i class="pi pi-minus"></i>
                    </button>
                    <span class="quantity">{{ item.cart_quantity }}</span>
                    <button 
                      class="qty-btn" 
                      :disabled="updating || item.cart_quantity >= item.quantity"
                      @click="addOne(item)"
                    >
                      <i class="pi pi-plus"></i>
                    </button>
                  </div>
                  
                  <button class="remove-btn" @click="removeItem(item)" :disabled="updating">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
                
                <div v-if="item.quantity < 10" class="stock-warning">
                  Only {{ item.quantity }} left in stock
                </div>
              </div>
            </div>
            
            <div class="cart-actions">
              <button class="clear-cart-btn" @click="clearCart" :disabled="updating">
                <i class="pi pi-trash"></i>
                Clear Cart
              </button>
            </div>
          </div>

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
                    <Select v-model="customerInfo.province" :options="provinces" placeholder="Select Province" />
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
          <div class="summary-card">
            <h2>Order Summary</h2>
            
            <div class="summary-items">
              <div v-for="item in cartItems" :key="item.product_id" class="summary-item">
                <span>{{ item.product_name }} x{{ item.cart_quantity }}</span>
                <span>{{ formatPrice(item.product_price * item.cart_quantity) }}</span>
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
            
            <div class="summary-total">
              <span>Total (ZAR)</span>
              <span class="total-amount">{{ formatPrice(cartTotal * 1.15) }}</span>
            </div>
            
            <button 
              class="checkout-btn" 
              :disabled="processingPayment"
              @click="openConfirmDialog"
            >
              <i class="pi pi-lock"></i>
              {{ processingPayment ? 'Processing...' : 'Proceed to Checkout' }}
            </button>
            
            <div class="secure-badge">
              <i class="pi pi-shield"></i>
              <span>Secured by PayFast</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showConfirmDialog" class="modal-overlay" @click="showConfirmDialog = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirm Your Order</h3>
          <button class="close-modal" @click="showConfirmDialog = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="order-summary-mini">
            <h4>Order Summary</h4>
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
            <h4>Deliver to:</h4>
            <p>{{ customerInfo.firstName }} {{ customerInfo.lastName }}</p>
            <p>{{ customerInfo.address }}</p>
            <p>{{ customerInfo.city }}, {{ customerInfo.province }} {{ customerInfo.postalCode }}</p>
          </div>
          
          <div class="terms-checkbox">
            <input 
              type="checkbox" 
              id="terms" 
              v-model="termsAccepted"
            />
            <label for="terms">
              I confirm my order details are correct and agree to the terms and conditions.
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="showConfirmDialog = false">
            Cancel
          </button>
          <button 
            class="confirm-btn" 
            @click="processPayment" 
            :disabled="!termsAccepted || processingPayment"
          >
            <i class="pi pi-lock"></i>
            {{ processingPayment ? 'Processing...' : 'Confirm & Pay Now' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: #8b4513;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s;
}

.back-btn:hover {
  background: #f0f0f0;
}

.cart-header h1 {
  font-size: 2rem;
  color: #2d3748;
  margin: 0;
}

.cart-count-badge {
  background: #8b4513;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.empty-cart {
  max-width: 500px;
  margin: 3rem auto;
}

.empty-cart-content {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 5rem;
  color: #cbd5e0;
  margin-bottom: 1.5rem;
}

.empty-cart-content h2 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-cart-content p {
  color: #718096;
  margin-bottom: 2rem;
}

.shop-btn {
  background: #8b4513;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.shop-btn:hover {
  background: #a0522d;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
}

.cart-with-items {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

.cart-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cart-items-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.cart-items-section h2 {
  margin: 0 0 1.5rem;
  color: #2d3748;
  font-size: 1.25rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.item-image img {
  width: 100%;  /* Changed from 30% to 100% */
  height: 100%; /* Changed from 30% to 100% */
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.item-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #2d3748;
}

.item-price {
  font-weight: 600;
  color: #8b4513;
}

.item-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #a0aec0;
}

.item-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.qty-btn:hover:not(:disabled) {
  background: #8b4513;
  color: white;
  border-color: #8b4513;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

.remove-btn {
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s;
}

.remove-btn:hover:not(:disabled) {
  background: #fff5f5;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stock-warning {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #e53e3e;
}

.cart-actions {
  margin-top: 1rem;
  text-align: right;
}

.clear-cart-btn {
  background: none;
  border: 1px solid #e53e3e;
  color: #e53e3e;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.clear-cart-btn:hover:not(:disabled) {
  background: #e53e3e;
  color: white;
}

.clear-cart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.info-section h2 {
  margin: 0 0 1.5rem;
  color: #2d3748;
  font-size: 1.25rem;
}

.info-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4a5568;
}

.form-group input,
.form-group select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #8b4513;
}

.order-sidebar {
  position: sticky;
  top: 100px;
  align-self: start;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.summary-card h2 {
  margin: 0 0 1.5rem;
  color: #2d3748;
  font-size: 1.25rem;
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
  font-size: 0.9rem;
}

.summary-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 1rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #718096;
}

.free {
  color: #38a169;
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 1rem 0;
}

.total-amount {
  color: #8b4513;
  font-size: 1.5rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
  margin-bottom: 1rem;
}

.checkout-btn:hover:not(:disabled) {
  background: #a0522d;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
}

.checkout-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.secure-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f0f9ff;
  border-radius: 6px;
  color: #0369a1;
  font-size: 0.8rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 450px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
}

.close-modal {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #718096;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s;
}

.close-modal:hover {
  background: #f7fafc;
  color: #2d3748;
}

.modal-body {
  padding: 1.5rem;
}

.order-summary-mini {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.order-summary-mini h4 {
  margin: 0 0 0.5rem;
  color: #2d3748;
  font-size: 1rem;
}

.summary-mini-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.summary-mini-row.total {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e2e8f0;
  font-weight: 600;
}

.delivery-summary {
  margin-bottom: 1rem;
}

.delivery-summary h4 {
  margin: 0 0 0.5rem;
  color: #2d3748;
  font-size: 1rem;
}

.delivery-summary p {
  margin: 0.25rem 0;
  color: #718096;
  font-size: 0.9rem;
}

.terms-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid #e2e8f0;
}

.terms-checkbox label {
  font-size: 0.9rem;
  color: #4a5568;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.cancel-btn {
  flex: 1;
  padding: 0.75rem;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover {
  background: #f7fafc;
}

.confirm-btn {
  flex: 2;
  padding: 0.75rem;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.confirm-btn:hover:not(:disabled) {
  background: #a0522d;
}

.confirm-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
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
  
  .cart-header {
    flex-direction: column;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    flex-direction: column;
  }
}
</style>