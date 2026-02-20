<script>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputNumber from 'primevue/inputnumber';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { ref, computed, watch } from 'vue';

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
    const showNotification = ref(false);
    const lastAddedItem = ref(null);
    
    // Watch for cart count changes to show notification
    watch(cartCount, (newCount, oldCount) => {
      if (newCount > oldCount && lastAddedItem.value) {
        showNotification.value = true;
        setTimeout(() => {
          showNotification.value = false;
        }, 3000);
      }
    });
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price || 0);
    };
    
    const updateQuantity = async (item, newQuantity) => {
      if (newQuantity < 1) {
        removeItem(item);
        return;
      }
      
      // Don't allow exceeding stock
      if (newQuantity > item.quantity) {
        toast.add({
          severity: 'warn',
          summary: 'Stock Limit',
          detail: `Only ${item.quantity} available`,
          life: 2000
        });
        return;
      }
      
      updating.value = true;
      try {
        await store.dispatch('updateCartQuantity', {
          productId: item.product_id,
          quantity: newQuantity
        });
        
        // Show success toast
        toast.add({
          severity: 'success',
          summary: 'Quantity Updated',
          detail: `${item.product_name} quantity updated to ${newQuantity}`,
          life: 2000
        });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update quantity',
          life: 3000
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
          severity: 'warn',
          summary: 'Out of Stock',
          detail: `Only ${item.quantity} available`,
          life: 2000
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
        await store.dispatch('removeFromCart', item.product_id);
        toast.add({
          severity: 'info',
          summary: 'Item Removed',
          detail: `${item.product_name} removed from cart`,
          life: 2000
        });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove item',
          life: 3000
        });
      } finally {
        updating.value = false;
      }
    };
    
    const clearCart = async () => {
      if (cartItems.value.length === 0) return;
      
      if (confirm('Are you sure you want to clear your cart?')) {
        updating.value = true;
        try {
          await store.dispatch('clearCart');
          toast.add({
            severity: 'info',
            summary: 'Cart Cleared',
            detail: 'All items have been removed from your cart',
            life: 3000
          });
        } catch (error) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to clear cart',
            life: 3000
          });
        } finally {
          updating.value = false;
        }
      }
    };
    
    const checkout = () => {
      if (!isAuthenticated.value) {
        toast.add({
          severity: 'warn',
          summary: 'Login Required',
          detail: 'Please login to proceed with checkout',
          life: 3000
        });
        router.push('/login');
        return;
      }
      
      // Show checkout animation
      showNotification.value = true;
      lastAddedItem.value = { product_name: 'Order' };
      
      setTimeout(() => {
        toast.add({
          severity: 'success',
          summary: 'Order Placed!',
          detail: 'Thank you for your purchase',
          life: 5000
        });
        // Clear cart after successful checkout
        store.dispatch('clearCart');
        showNotification.value = false;
      }, 1500);
    };
    
    return {
      cartItems,
      cartTotal,
      cartCount,
      isAuthenticated,
      updating,
      showNotification,
      lastAddedItem,
      formatPrice,
      updateQuantity,
      addOne,
      removeOne,
      removeItem,
      clearCart,
      checkout,
      continueShopping: () => router.push('/products')
    };
  }
};
</script>

<template>
  <div class="cart-view">
    <Toast />
    
    <!-- Slide-down notification -->
    <transition name="slide-down">
      <div v-if="showNotification" class="cart-notification">
        <div class="notification-content">
          <i class="pi pi-check-circle"></i>
          <span v-if="lastAddedItem">
            {{ lastAddedItem.product_name }} added to cart! 
            <strong>({{ cartCount }})</strong>
          </span>
          <span v-else>
            Order placed successfully! 
            <strong>Thank you!</strong>
          </span>
        </div>
      </div>
    </transition>
    
    <div class="page-header">
      <h1>Shopping Cart</h1>
      <p v-if="cartItems.length > 0">You have <strong>{{ cartCount }}</strong> item{{ cartCount !== 1 ? 's' : '' }} in your cart</p>
      <p v-else>Your cart is waiting to be filled</p>
    </div>
    
    <div class="cart-container">
      <!-- Empty Cart State -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <Card class="empty-cart-card">
          <template #content>
            <div class="empty-cart-content">
              <i class="pi pi-shopping-cart empty-icon"></i>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any items to your cart yet</p>
              <div class="empty-cart-actions">
                <Button 
                  label="Browse Products" 
                  icon="pi pi-shopping-bag"
                  class="shop-btn"
                  @click="continueShopping"
                />
                <Button 
                  v-if="!isAuthenticated"
                  label="Login" 
                  icon="pi pi-user"
                  class="p-button-outlined login-btn"
                  @click="$router.push('/login')"
                />
              </div>
            </div>
          </template>
        </Card>
      </div>
      
      <!-- Cart with Items -->
      <div v-else class="cart-with-items">
        <!-- Cart Items Section -->
        <div class="cart-items-section">
          <div class="cart-header">
            <h2>Cart Items <span class="item-count-badge">{{ cartCount }}</span></h2>
            <Button 
              label="Clear Cart" 
              icon="pi pi-trash" 
              class="p-button-text p-button-danger"
              :disabled="updating"
              @click="clearCart"
            />
          </div>
          
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
                  <div class="item-price">
                    {{ formatPrice(item.product_price) }} each
                  </div>
                  <div class="item-total">
                    Total: <strong>{{ formatPrice(item.product_price * item.cart_quantity) }}</strong>
                  </div>
                </div>
                
                <div class="item-actions">
                  <div class="quantity-controls">
                    <label>Quantity:</label>
                    <div class="quantity-buttons">
                      <Button 
                        icon="pi pi-minus" 
                        class="p-button-rounded p-button-text quantity-btn"
                        :disabled="updating || item.cart_quantity <= 1"
                        @click="removeOne(item)"
                      />
                      <span class="quantity-display">{{ item.cart_quantity }}</span>
                      <Button 
                        icon="pi pi-plus" 
                        class="p-button-rounded p-button-text quantity-btn"
                        :disabled="updating || item.cart_quantity >= item.quantity"
                        @click="addOne(item)"
                      />
                    </div>
                    <small v-if="item.quantity < 10" class="stock-warning">
                      Only {{ item.quantity }} left in stock
                    </small>
                    <small v-else class="stock-info">
                      {{ item.quantity }} available
                    </small>
                  </div>
                  
                  <Button 
                    icon="pi pi-trash" 
                    class="p-button-rounded p-button-outlined p-button-danger remove-btn"
                    :disabled="updating"
                    @click="removeItem(item)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Order Summary Section -->
        <div class="order-summary-section">
          <Card class="summary-card">
            <template #title>
              <div class="summary-title">
                <h2>Order Summary</h2>
                <span class="summary-badge">{{ cartCount }} items</span>
              </div>
            </template>
            <template #content>
              <div class="summary-details">
                <div class="summary-row">
                  <span>Subtotal</span>
                  <span class="summary-value">{{ formatPrice(cartTotal) }}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping</span>
                  <span class="free-shipping">Free</span>
                </div>
                <div class="summary-row">
                  <span>Tax (10%)</span>
                  <span class="summary-value">{{ formatPrice(cartTotal * 0.1) }}</span>
                </div>
                <div class="summary-divider"></div>
                <div class="summary-row total">
                  <span>Total</span>
                  <span class="total-amount">{{ formatPrice(cartTotal * 1.1) }}</span>
                </div>
              </div>
              
              <div class="checkout-actions">
                <Button 
                  label="Proceed to Checkout" 
                  icon="pi pi-lock"
                  class="checkout-btn"
                  :disabled="updating"
                  @click="checkout"
                />
                <Button 
                  label="Continue Shopping" 
                  icon="pi pi-arrow-left"
                  class="p-button-outlined continue-btn"
                  :disabled="updating"
                  @click="continueShopping"
                />
              </div>
              
              <div class="payment-methods">
                <p class="payment-label">Secure Payment</p>
                <div class="payment-icons">
                  <i class="pi pi-credit-card"></i>
                  <i class="pi pi-paypal"></i>
                  <i class="pi pi-apple"></i>
                </div>
              </div>
            </template>
          </Card>
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

/* Slide-down notification */
.cart-notification {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1000;
  background: #8B4513;
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
  border: 2px solid white;
  animation: slideDown 0.3s ease;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
}

.notification-content i {
  font-size: 1.25rem;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #718096;
  font-size: 1.1rem;
}

.page-header p strong {
  color: #8B4513;
}

/* Empty Cart */
.empty-cart {
  max-width: 600px;
  margin: 0 auto;
}

.empty-cart-card {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
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

.empty-cart-content h2 {
  color: #2d3748;
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.empty-cart-content p {
  color: #718096;
  margin-bottom: 2rem;
}

.empty-cart-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.shop-btn {
  background: #8B4513;
  border: 2px solid #8B4513;
  padding: 0.75rem 2rem;
}

.shop-btn:hover {
  background: #6B3410;
  border-color: #6B3410;
}

.login-btn {
  border-color: #8B4513;
  color: #8B4513;
  padding: 0.75rem 2rem;
}

.login-btn:hover {
  background: #8B4513;
  color: white;
}

/* Cart with Items */
.cart-with-items {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

/* Cart Items Section */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.cart-header h2 {
  color: #2d3748;
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.item-count-badge {
  background: #8B4513;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 1rem;
}

.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item-card {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.cart-item-card:hover {
  border-color: #8B4513;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.1);
}

.item-image {
  flex-shrink: 0;
}

.image-placeholder {
  width: 120px;
  height: 120px;
  background: #f7fafc;
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
  display: flex;
  flex-direction: column;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.item-header h3 {
  color: #2d3748;
  font-size: 1.25rem;
  margin: 0;
}

.item-id {
  color: #a0aec0;
  font-size: 0.875rem;
}

.item-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.item-price {
  color: #8B4513;
  font-size: 1rem;
  font-weight: 600;
}

.item-total {
  color: #2d3748;
  font-size: 1rem;
}

.item-total strong {
  color: #8B4513;
  font-size: 1.1rem;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quantity-controls {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.quantity-controls label {
  color: #718096;
  font-size: 0.875rem;
}

.quantity-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid #e2e8f0 !important;
}

.quantity-btn:hover {
  background: #f7fafc !important;
  border-color: #8B4513 !important;
}

.quantity-display {
  min-width: 2.5rem;
  text-align: center;
  font-weight: 600;
  color: #2d3748;
}

.stock-warning {
  color: #e53e3e;
  font-size: 0.75rem;
}

.stock-info {
  color: #38a169;
  font-size: 0.75rem;
}

.remove-btn {
  border-color: #e53e3e !important;
}

.remove-btn:hover {
  background: #e53e3e !important;
  color: white !important;
}

/* Order Summary */
.summary-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  position: sticky;
  top: 90px;
}

.summary-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem 0;
}

.summary-title h2 {
  color: #2d3748;
  font-size: 1.5rem;
  margin: 0;
}

.summary-badge {
  background: #8B4513;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.summary-details {
  padding: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #718096;
}

.summary-value {
  font-weight: 500;
  color: #2d3748;
}

.free-shipping {
  color: #38a169;
  font-weight: 600;
}

.summary-row.total {
  margin-top: 1rem;
  color: #2d3748;
  font-weight: 600;
  font-size: 1.1rem;
}

.total-amount {
  color: #8B4513;
  font-size: 1.5rem;
  font-weight: 700;
}

.summary-divider {
  height: 2px;
  background: #e2e8f0;
  margin: 1rem 0;
}

.checkout-actions {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkout-btn {
  background: #8B4513;
  border: 2px solid #8B4513;
  width: 100%;
  padding: 0.75rem;
}

.checkout-btn:hover {
  background: #6B3410;
  border-color: #6B3410;
}

.continue-btn {
  width: 100%;
  border-color: #8B4513;
  color: #8B4513;
}

.continue-btn:hover {
  background: #8B4513;
  color: white;
}

.payment-methods {
  padding: 1.5rem;
  border-top: 2px solid #e2e8f0;
  text-align: center;
}

.payment-label {
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.payment-icons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  font-size: 1.5rem;
  color: #a0aec0;
}

/* Responsive */
@media (max-width: 1024px) {
  .cart-with-items {
    grid-template-columns: 1fr;
  }
  
  .summary-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-view {
    padding: 1rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .cart-item-card {
    flex-direction: column;
  }
  
  .image-placeholder {
    width: 100%;
    height: 150px;
  }
  
  .item-price-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .item-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .remove-btn {
    align-self: flex-end;
  }
  
  .empty-cart-actions {
    flex-direction: column;
  }
  
  .cart-notification {
    left: 20px;
    right: 20px;
    text-align: center;
  }
}
</style>