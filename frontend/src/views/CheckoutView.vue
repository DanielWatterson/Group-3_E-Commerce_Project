<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Steps from 'primevue/steps';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import payfastService from '@/services/payfast';

export default {
  name: 'CheckoutView',
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();
    
    const cartItems = computed(() => store.getters.cartItems || []);
    const cartTotal = computed(() => store.getters.cartTotal || 0);
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    
    // Redirect if cart is empty
    if (cartItems.value.length === 0) {
      router.push('/products');
      return;
    }
    
    const activeStep = ref(0);
    const processing = ref(false);
    
    // Form data
    const formData = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      deliveryInstructions: ''
    });
    
    const provinces = ref([
      'Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape',
      'Free State', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape'
    ]);
    
    // Steps
    const steps = ref([
      { label: 'Customer Info' },
      { label: 'Delivery' },
      { label: 'Payment' }
    ]);
    
    // Validation
    const validateStep1 = () => {
      const { firstName, lastName, email, phone } = formData.value;
      if (!firstName || !lastName || !email || !phone) {
        toast.add({
          severity: 'warn',
          summary: 'Missing Information',
          detail: 'Please fill in all required fields',
          life: 3000
        });
        return false;
      }
      return true;
    };
    
    const validateStep2 = () => {
      const { address, city, province, postalCode } = formData.value;
      if (!address || !city || !province || !postalCode) {
        toast.add({
          severity: 'warn',
          summary: 'Missing Information',
          detail: 'Please fill in all address fields',
          life: 3000
        });
        return false;
      }
      return true;
    };
    
    // Navigation
    const nextStep = () => {
      if (activeStep.value === 0 && validateStep1()) {
        activeStep.value = 1;
      } else if (activeStep.value === 1 && validateStep2()) {
        activeStep.value = 2;
      }
    };
    
    const prevStep = () => {
      activeStep.value--;
    };
    
    // Create order and process payment
    const processPayment = async () => {
      processing.value = true;
      
      try {
        const checkoutPayload = {
          customer: {
            firstName: formData.value.firstName,
            lastName: formData.value.lastName,
            email: formData.value.email,
            phone: formData.value.phone,
          },
          items: cartItems.value.map((item) => ({
            product_id: item.product_id,
            quantity: item.cart_quantity,
          })),
          item_name:
            cartItems.value.length === 1
              ? cartItems.value[0].product_name
              : `LumberLink Order (${cartItems.value.length} items)`,
        };

        const paymentSession = await payfastService.createPaymentSession(checkoutPayload);

        localStorage.setItem('pendingOrder', JSON.stringify({
          payment_id: paymentSession.payment_id,
          order_id: paymentSession.order_id,
          items: cartItems.value,
          shipping: formData.value,
        }));
        
        toast.add({
          severity: 'info',
          summary: 'Redirecting to PayFast',
          detail: 'You will be redirected to PayFast to complete payment',
          life: 3000
        });
        
        setTimeout(() => {
          payfastService.redirectToPayFast(paymentSession);
        }, 1500);
        
      } catch (error) {
        console.error('Payment error:', error?.response?.data || error);
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: error?.response?.data?.error || 'Failed to process payment. Please try again.',
          life: 5000
        });
        processing.value = false;
      }
    };
    
    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
      }).format(price || 0);
    };
    
    return {
      cartItems,
      cartTotal,
      activeStep,
      steps,
      formData,
      provinces,
      processing,
      nextStep,
      prevStep,
      processPayment,
      formatPrice,
      continueShopping: () => router.push('/products')
    };
  }
};
</script>

<template>
  <div class="checkout-view">
    <Toast />
    
    <div class="page-header">
      <h1>Checkout</h1>
      <p>Complete your purchase securely</p>
    </div>
    
    <div class="checkout-container">
      <!-- Steps -->
      <Steps :model="steps" :activeStep="activeStep" class="checkout-steps" />
      
      <div class="checkout-content">
        <!-- Left Column - Forms -->
        <div class="checkout-forms">
          <!-- Step 1: Customer Info -->
          <Card v-if="activeStep === 0" class="form-card">
            <template #title>
              <h2>Your Information</h2>
            </template>
            <template #content>
              <div class="form-grid">
                <div class="field">
                  <label>First Name *</label>
                  <InputText v-model="formData.firstName" placeholder="John" />
                </div>
                <div class="field">
                  <label>Last Name *</label>
                  <InputText v-model="formData.lastName" placeholder="Doe" />
                </div>
                <div class="field">
                  <label>Email *</label>
                  <InputText v-model="formData.email" type="email" placeholder="john@example.com" />
                </div>
                <div class="field">
                  <label>Phone *</label>
                  <InputText v-model="formData.phone" placeholder="081 234 5678" />
                </div>
              </div>
              
              <div class="form-actions">
                <Button 
                  label="Continue to Delivery" 
                  icon="pi pi-arrow-right" 
                  iconPos="right"
                  @click="nextStep" 
                />
              </div>
            </template>
          </Card>
          
          <!-- Step 2: Delivery -->
          <Card v-else-if="activeStep === 1" class="form-card">
            <template #title>
              <h2>Delivery Address</h2>
            </template>
            <template #content>
              <div class="form-grid">
                <div class="field full-width">
                  <label>Street Address *</label>
                  <InputText v-model="formData.address" placeholder="123 Main Street" />
                </div>
                <div class="field">
                  <label>City *</label>
                  <InputText v-model="formData.city" placeholder="Johannesburg" />
                </div>
                <div class="field">
                  <label>Province *</label>
                  <Select 
                    v-model="formData.province" 
                    :options="provinces" 
                    placeholder="Select Province" 
                  />
                </div>
                <div class="field">
                  <label>Postal Code *</label>
                  <InputText v-model="formData.postalCode" placeholder="2000" />
                </div>
                <div class="field full-width">
                  <label>Delivery Instructions (Optional)</label>
                  <InputText 
                    v-model="formData.deliveryInstructions" 
                    placeholder="Gate code, special instructions, etc." 
                  />
                </div>
              </div>
              
              <div class="form-actions">
                <Button 
                  label="Back" 
                  icon="pi pi-arrow-left" 
                  class="p-button-text" 
                  @click="prevStep" 
                />
                <Button 
                  label="Continue to Payment" 
                  icon="pi pi-arrow-right" 
                  iconPos="right"
                  @click="nextStep" 
                />
              </div>
            </template>
          </Card>
          
          <!-- Step 3: Payment -->
          <Card v-else-if="activeStep === 2" class="form-card">
            <template #title>
              <h2>Payment Method</h2>
            </template>
            <template #content>
              <div class="payment-method-card">
                <div class="payment-method selected">
                  <div class="method-header">
                    <i class="pi pi-credit-card"></i>
                    <span class="method-name">PayFast</span>
                    <span class="method-badge">Recommended</span>
                  </div>
                  <p class="method-description">
                    Pay securely with PayFast. Accepts all major credit cards, Instant EFT, and more.
                  </p>
                </div>
              </div>
              
              <!-- Test Cards Info -->
              <div class="test-info">
                <h3>Test Mode Information</h3>
                <p>Use these test cards for sandbox payments:</p>
                <ul>
                  <li><strong>Visa:</strong> 4000 0000 0000 0002, CVV: 123, Expiry: 12/25</li>
                  <li><strong>Mastercard:</strong> 5300 0000 0000 0001, CVV: 123, Expiry: 12/25</li>
                  <li><strong>Instant EFT:</strong> Select FNB, use any credentials</li>
                </ul>
                <p class="test-note">This is a test environment - no real money will be charged</p>
              </div>
              
              <div class="form-actions">
                <Button 
                  label="Back" 
                  icon="pi pi-arrow-left" 
                  class="p-button-text" 
                  @click="prevStep" 
                />
                <Button 
                  label="Pay Now" 
                  icon="pi pi-lock" 
                  class="pay-btn"
                  :loading="processing"
                  @click="processPayment" 
                />
              </div>
            </template>
          </Card>
        </div>
        
        <!-- Right Column - Order Summary -->
        <div class="order-summary">
          <Card class="summary-card">
            <template #title>
              <h2>Your Order</h2>
            </template>
            <template #content>
              <div class="summary-items">
                <div v-for="item in cartItems" :key="item.product_id" class="summary-item">
                  <div class="item-info">
                    <span class="item-name">{{ item.product_name }}</span>
                    <span class="item-qty">x{{ item.cart_quantity }}</span>
                  </div>
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
              
              <div class="secure-badge">
                <i class="pi pi-shield"></i>
                <span>Secured by PayFast</span>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-view {
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

.page-header p {
  color: #718096;
}

.checkout-steps {
  margin-bottom: 3rem;
  background: transparent;
  border: none;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

.checkout-forms {
  min-width: 0;
}

.form-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field.full-width {
  grid-column: 1 / -1;
}

.field label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.payment-method-card {
  margin-bottom: 2rem;
}

.payment-method {
  border: 2px solid #8B4513;
  border-radius: 12px;
  padding: 1.5rem;
  background: #fff5f0;
}

.method-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.method-header i {
  font-size: 1.5rem;
  color: #8B4513;
}

.method-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.method-badge {
  background: #8B4513;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  margin-left: auto;
}

.method-description {
  margin: 0;
  color: #4a5568;
  line-height: 1.5;
}

.test-info {
  background: #f0f9ff;
  border: 2px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.test-info h3 {
  color: #0369a1;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.test-info ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  color: #4a5568;
}

.test-info li {
  margin-bottom: 0.25rem;
}

.test-note {
  color: #e53e3e;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0.5rem 0 0;
}

.pay-btn {
  background: #8B4513;
  border: 2px solid #8B4513;
  padding: 0.75rem 2rem;
}

.pay-btn:hover {
  background: #6B3410;
  border-color: #6B3410;
}

.summary-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  position: sticky;
  top: 100px;
}

.summary-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.item-info {
  display: flex;
  gap: 0.5rem;
}

.item-name {
  font-weight: 500;
  color: #2d3748;
}

.item-qty {
  color: #718096;
  font-size: 0.875rem;
}

.item-price {
  color: #8B4513;
  font-weight: 600;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #718096;
}

.summary-row.total {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
}

.total-amount {
  color: #8B4513;
  font-size: 1.5rem;
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

.secure-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 0.75rem;
  background: #f0f9ff;
  border-radius: 8px;
  color: #0369a1;
  font-size: 0.875rem;
}

.secure-badge i {
  font-size: 1.25rem;
}

@media (max-width: 1024px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }
  
  .summary-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-view {
    padding: 1rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>

