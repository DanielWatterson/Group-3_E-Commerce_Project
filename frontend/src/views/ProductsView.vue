<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';

export default {
  name: "ProductsView",
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

    const handleImageError = (event) => {
      event.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
    };

    const products = computed(() => store.state.products || []);
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const cartCount = computed(() => store.getters.cartCount);
    const backgroundStyle = computed(() => {
  return {
    backgroundImage: "url('https://i.postimg.cc/8zxhgS81/images-q-tbn-ANd9Gc-TPxy-RDo1tp2r-Lcvi-H3r-K57l-YEn-TNO3vy-Qqo-Q-s.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    minHeight: '100vh'
  };
});
    
    const loading = ref(false);
    const searchQuery = ref('');
    const selectedCategory = ref(null);
    const productDialog = ref(false);
    const deleteDialog = ref(false);
    const product = ref({});
    const submitted = ref(false);
    const editingProduct = ref(null);
    
    const categories = ref([
      { name: 'All Products', value: null },
      { name: 'Wooden Desks', value: 'Wooden' },
      { name: 'Custom Desks', value: 'Custom' },

    ]);

    const sortOptions = ref([
      { name: 'Name (A-Z)', value: 'name_asc' },
      { name: 'Name (Z-A)', value: 'name_desc' },
      { name: 'Price (Low to High)', value: 'price_asc' },
      { name: 'Price (High to Low)', value: 'price_desc' },
      { name: 'Stock (Low to High)', value: 'stock_asc' },
      { name: 'Stock (High to Low)', value: 'stock_desc' }
    ]);
    
    const selectedSort = ref('name_asc');

    // Filtered and sorted products
    const filteredProducts = computed(() => {
      let filtered = products.value;
      
      if (searchQuery.value) {
        filtered = filtered.filter(p => 
          p.product_name && p.product_name.toLowerCase().includes(searchQuery.value.toLowerCase())
        );
      }
      
      if (selectedCategory.value) {
        filtered = filtered.filter(p => 
          p.product_name && p.product_name.toLowerCase().includes(selectedCategory.value.toLowerCase())
        );
      }
      
      filtered = [...filtered].sort((a, b) => {
        switch(selectedSort.value) {
          case 'name_asc':
            return (a.product_name || '').localeCompare(b.product_name || '');
          case 'name_desc':
            return (b.product_name || '').localeCompare(a.product_name || '');
          case 'price_asc':
            return (a.product_price || 0) - (b.product_price || 0);
          case 'price_desc':
            return (b.product_price || 0) - (a.product_price || 0);
          case 'stock_asc':
            return (a.quantity || 0) - (b.quantity || 0);
          default:
            return 0;
        }
      });
      
      return filtered; 
    });

const getToastIcon = (severity) => {
  switch(severity) {
    case 'success': return 'pi pi-check-circle';
    case 'error': return 'pi pi-times-circle';
    case 'warn': return 'pi pi-exclamation-triangle';
    case 'info': return 'pi pi-info-circle';
    default: return 'pi pi-info-circle';
  }
};
      const notification = ref({
        visible: false,
        severity: 'success',
        summary: '',
        detail: '',
        life: 3000
      });

      // Add this helper function
const showNotification = (severity, summary, detail, life = 3000) => {
  // Hide any existing notification first
  notification.value.visible = false;
  
  // Small delay to ensure smooth transition
  setTimeout(() => {
    notification.value = {
      visible: true,
      severity,
      summary,
      detail,
      life
    };
  }, 100);
  
  // Auto-hide after duration
  setTimeout(() => {
    notification.value.visible = false;
  }, life);
};

    // Load products
    const loadProducts = async () => {
      loading.value = true;
      try {
        await store.dispatch('getProducts');
      } catch (error) {
        console.error("Failed to load products:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load products', life: 3000 });
      } finally {
        loading.value = false;
      }
    };

    // Product CRUD operations
    const openNew = () => {
      product.value = {
        product_name: '',
        product_price: 0,
        quantity: 0
      };
      submitted.value = false;
      productDialog.value = true;
    };

    const editProduct = (prod) => {
      product.value = { ...prod };
      productDialog.value = true;
    };

    const confirmDelete = (prod) => {
      editingProduct.value = prod;
      deleteDialog.value = true;
    };

    const saveProduct = async () => {
      submitted.value = true;
      
      if (product.value.product_name && product.value.product_price > 0 && product.value.quantity >= 0) {
        loading.value = true;
        try {
          if (product.value.product_id) {
            await store.dispatch('updateProduct', {
              id: product.value.product_id,
              product_name: product.value.product_name,
              product_price: product.value.product_price,
              quantity: product.value.quantity
            });
            toast.add({ severity: 'success', summary: 'Success', detail: 'Product updated successfully', life: 3000 });
          } else {
            await store.dispatch('createProduct', {
              product_name: product.value.product_name,
              product_price: product.value.product_price,
              quantity: product.value.quantity
            });
            toast.add({ severity: 'success', summary: 'Success', detail: 'Product created successfully', life: 3000 });
          }
          
          productDialog.value = false;
          product.value = {};
          await loadProducts();
        } catch (error) {
          console.error("Operation failed:", error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'Operation failed', life: 3000 });
        } finally {
          loading.value = false;
        }
      }
    };

    const deleteProduct = async () => {
      loading.value = true;
      try {
        await store.dispatch('deleteProduct', editingProduct.value.product_id);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Product deleted successfully', life: 3000 });
        deleteDialog.value = false;
        editingProduct.value = null;
        await loadProducts();
      } catch (error) {
        console.error("Failed to delete product:", error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete product', life: 3000 });
      } finally {
        loading.value = false;
      }
    };

    // Add to cart
const addToCart = async (product) => {
  console.log('🔵 ADD TO CART CLICKED', product);
  
  if (!isAuthenticated.value) {
    console.log('🔴 User not authenticated');
    toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please login to add items to cart', life: 3000 });
    router.push('/login');
    return;
  }
  
  if (product.quantity <= 0) {
    console.log('🔴 Product out of stock');
    toast.add({ severity: 'error', summary: 'Error', detail: 'Product is out of stock', life: 3000 });
    return;
  }
  
  try {
    console.log('🟡 Sending PATCH request to:', `http://localhost:5050/products/${product.product_id}/decrease-stock`);
    console.log('🟡 Request body:', { quantity: 1 });
    
    const response = await axios.patch(`http://localhost:5050/products/${product.product_id}/decrease-stock`, {
      quantity: 1
    });
    
    console.log('🟢 PATCH response:', response.data);
    
    console.log('🟡 Dispatching to cart store');
    store.dispatch('addToCart', product);
    
    // Update local product quantity
    const productIndex = products.value.findIndex(p => p.product_id === product.product_id);
    if (productIndex !== -1) {
      const updatedProducts = [...products.value];
      updatedProducts[productIndex] = {
        ...updatedProducts[productIndex],
        quantity: updatedProducts[productIndex].quantity - 1
      };
      store.state.products = updatedProducts;
    }
    
    toast.add({ severity: 'success', summary: 'Success', detail: `${product.product_name} added to cart`, life: 3000 });
  } catch (error) {
    console.error('🔴 ERROR in addToCart:', error);
    console.log('🔴 Error response:', error.response?.data);
    console.log('🔴 Error status:', error.response?.status);
    console.log('🔴 Error headers:', error.response?.headers);
    
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: error.response?.data?.error || error.message || 'Failed to add to cart', 
      life: 3000 
    });
  }
};

    // Utility functions
    const getStockStatus = (quantity) => {
      if (quantity <= 0) return 'OUTOFSTOCK';
      if (quantity < 10) return 'LOWSTOCK';
      return 'INSTOCK';
    };

    const getStockSeverity = (status) => {
      switch(status) {
        case 'INSTOCK': return 'success';
        case 'LOWSTOCK': return 'warn';
        case 'OUTOFSTOCK': return 'danger';
        default: return null;
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
      }).format(price || 0);
    };

    const goToCart = () => {
  router.push('/cart');
};

    onMounted(() => {
      loadProducts();
    });

    return {
      products,
      filteredProducts,
      isAuthenticated,
      cartCount,
      loading,
      searchQuery,
      selectedCategory,
      categories,
      sortOptions,
      selectedSort,
      productDialog,
      deleteDialog,
      product,
      submitted,
      openNew,
      editProduct,
      confirmDelete,
      saveProduct,
      deleteProduct,
      addToCart,
      getStockStatus,
      getStockSeverity,
      formatPrice,
      handleImageError,
      backgroundStyle,
      toast,
      goToCart
};
  }
};
</script>

<template>
  <div class="products-view" :style="backgroundStyle">
    <div>
    <Toast />
    
    <!-- Page Header -->
    <div class="page-header">
      <h1>Our Products</h1>
      <p>Discover our collection of high-quality products</p>
    </div>

    <div class="content-card">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="p-input-icon-left">
            <InputText 
              v-model="searchQuery" 
              placeholder="Search products..." 
              class="search-input"
            />
          </span>
          
          <Dropdown 
            v-model="selectedCategory" 
            :options="categories" 
            optionLabel="name" 
            optionValue="value"
            placeholder="Category" 
            class="category-dropdown"
          />
          
          <Dropdown 
            v-model="selectedSort" 
            :options="sortOptions" 
            optionLabel="name" 
            optionValue="value"
            placeholder="Sort by" 
            class="sort-dropdown"
          />
        </div>
        
        <div class="toolbar-right">
  <button 
    class="mobile-friendly-cart-btn" 
    @click="goToCart"
  >
    <i class="pi pi-shopping-cart"></i>
    <span 
      v-if="cartCount > 0" 
      class="cart-count-badge"
    >
      {{ cartCount }}
    </span>
  </button>
                              </div>
                  </div>
                </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Loading products...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <i class="pi pi-box"></i>
        <h3>No Products Found</h3>
        <p v-if="searchQuery">No products match your search "{{ searchQuery }}"</p>
        <p v-else>No products available in the store yet.</p>
        <Button 
          v-if="isAuthenticated && !searchQuery"
          label="Add Your First Product" 
          icon="pi pi-plus"
          @click="openNew"
        />
        <Button 
          v-if="searchQuery"
          label="Clear Search" 
          icon="pi pi-times"
          @click="searchQuery = ''"
          class="p-button-outlined"
        />
      </div>

      <!-- Products Grid -->
      <div v-else class="products-grid">
        <div 
          v-for="product in filteredProducts"
          :key="product.product_id"
          class="product-card"
          :class="{ 'out-of-stock': product.quantity <= 0 }"
        >
          <div class="product-image">
            <img
              :src="product.image_url"
              :alt="product.product_name"
              @error="handleImageError"
            />
          </div>
          
          <div class="product-badge" v-if="product.quantity <= 0">Out of Stock</div>
          <div class="product-badge low-stock" v-else-if="product.quantity < 10">Low Stock</div>
          
          <div class="product-header">
            <h3 class="product-name">{{ product.product_name }}</h3>
            <span class="product-id">#{{ product.product_id }}</span>
          </div>
          
          <div class="product-details">
            <div class="product-price">{{ formatPrice(product.product_price) }}</div>
            <div class="product-stock">
              <Tag 
                :value="getStockStatus(product.quantity)" 
                :severity="getStockSeverity(getStockStatus(product.quantity))"
              />
              <span class="stock-count">{{ product.quantity }} available</span>
            </div>
          </div>
          
          <div class="product-actions">
            <Button 
              @click="addToCart(product)" 
              :disabled="product.quantity === 0"
              :label="product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'"
              icon="pi pi-shopping-cart"
              class="buy-btn"
              :class="{ 'p-button-outlined': product.quantity === 0 }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Product Dialog -->
    <Dialog 
      v-model:visible="productDialog" 
      :header="product.product_id ? 'Edit Product' : 'Add New Product'" 
      :modal="true"
      :style="{ width: '450px' }"
      class="p-fluid"
    >
      <div class="field">
        <label for="name">Product Name</label>
        <InputText 
          id="name" 
          v-model="product.product_name" 
          required
          :class="{ 'p-invalid': submitted && !product.product_name }"
        />
        <small v-if="submitted && !product.product_name" class="p-error">Product name is required.</small>
      </div>

      <div class="field">
        <label for="price">Price (R)</label>
        <InputNumber 
          id="price" 
          v-model="product.product_price" 
          mode="currency" 
          currency="USD" 
          :min="0.01"
          :class="{ 'p-invalid': submitted && !product.product_price }"
        />
        <small v-if="submitted && !product.product_price" class="p-error">Price is required.</small>
      </div>

      <div class="field">
        <label for="quantity">Quantity</label>
        <InputNumber 
          id="quantity" 
          v-model="product.quantity" 
          :min="0"
          :class="{ 'p-invalid': submitted && product.quantity === null }"
        />
        <small v-if="submitted && product.quantity === null" class="p-error">Quantity is required.</small>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="productDialog = false" class="p-button-text"/>
        <Button label="Save" icon="pi pi-check" @click="saveProduct" autofocus />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog 
      v-model:visible="deleteDialog" 
      header="Confirm Delete" 
      :modal="true"
      :style="{ width: '350px' }"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #f59e0b; margin-right: 1rem;" />
        <span v-if="editingProduct">Are you sure you want to delete <b>{{ editingProduct.product_name }}</b>?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" @click="deleteDialog = false" class="p-button-text"/>
        <Button label="Yes" icon="pi pi-check" @click="deleteProduct" class="p-button-danger" />
      </template>
    </Dialog>
    </div>
</template>

<style scoped>

.products-view {
  position: relative;
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background-image: url('https://i.postimg.cc/8zxhgS81/images-q-tbn-ANd9Gc-TPxy-RDo1tp2r-Lcvi-H3r-K57l-YEn-TNO3vy-Qqo-Q-s.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.content-card,
.page-header {
  position: relative;
  z-index: 1;
}

.content-card {
  background: rgba(61, 124, 79, 0.4);  /* 80% opaque, 20% transparent */
  border-radius: 16px;
  backdrop-filter: blur(10px);  /* Adds blur effect */
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #b9b6b2;
  margin-bottom: 0.5rem;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.page-header p {
  color: #ffffff;
  font-size: 1.1rem;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  position: relative;
  z-index: 2;
}

.toolbar-left {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
}

.search-input {
  width: 250px;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.category-dropdown, .sort-dropdown {
  width: 150px;
}

.toolbar-right {
  display: flex;
  gap: 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);  /* Force 4 columns */
  gap: 1.5rem;
  margin-top: 2rem;
}

/* Responsive breakpoints */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);  /* 3 columns on smaller screens */
  }
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);  /* 2 columns on tablets */
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);  /* Still 2 columns on mobile landscape */
    gap: 1rem;
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: 1fr;  /* 1 column on mobile portrait */
  }
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: hidden;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.product-card.out-of-stock {
  opacity: 0.9;
  background: #f7fafc;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.product-badge {
  position: absolute;
  top: 1rem;
  right: -2rem;
  background: #e53e3e;
  color: white;
  padding: 0.25rem 2rem;
  font-size: 0.75rem;
  font-weight: 600;
  transform: rotate(45deg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.product-badge.low-stock {
  background: #dd6b20;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.product-name {
  margin: 0;
  color: #947234;
  font-size: 1.25rem;
  font-weight: 600;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.product-id {
  color: #000000;
  font-size: 0.875rem;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.product-details {
  margin-bottom: 1.5rem;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.product-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #a18848;
  margin-bottom: 0.5rem;
   font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-count {
  color: #719673;
  font-size: 0.875rem;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-image {
  width: 90%;
  height: 250px;              /* HARD LIMIT */
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;         /* IMPORTANT */
}

.buy-btn {
  width: 100%;
}

.admin-actions {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #71967b;
}

.loading-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: #cbd5e0;
}

.empty-state h3 {
  color: #6b5f24;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 2rem;
}

.field {
  margin-bottom: 1.5rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-family: "Poppins", "Segoe UI", Tahoma, sans-serif;
  font-weight: 500;
  color: #7d4423;
}

.confirmation-content {
  display: flex;
  align-items: center;
  padding: 1rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .products-view {
    padding: 1rem;
  }
  
  .toolbar-left {
    flex-direction: column;
    width: 100%;
  }
  
  .search-input,
  .category-dropdown,
  .sort-dropdown {
    width: 100%;
  }
  
  .toolbar-right {
    width: 100%;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }

}@media (max-width: 480px) {
  :deep(.p-toast) {
    width: calc(100vw - 2rem);
    left: 1rem !important;
    right: 1rem !important;
  }
}

.mobile-friendly-cart-btn {
  background: linear-gradient(135deg, #83ea66 0%, #4fa24b 100%);
  border: none;
  color: white;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 0;
  font-size: 24px;
}

.mobile-friendly-cart-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(234, 203, 102, 0.4);
}

.mobile-friendly-cart-btn:active {
  transform: translateY(0);
}

.cart-count-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: bold;
  min-width: 22px;
  height: 22px;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* Desktop override - larger button */
@media (min-width: 769px) {
  .mobile-friendly-cart-btn {
    width: auto;
    height: auto;
    border-radius: 50px;
    padding: 12px 24px;
    gap: 8px;
    font-size: 16px;
  }
  
  .cart-count-badge {
    position: static;
    margin-left: 8px;
    background: rgba(255, 255, 255, 0.3);
    color: white;
    border: none;
    min-width: 24px;
    height: 24px;
  }
}

/* Ensure button is visible on all devices */
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Custom Toast Notification - Single instance */
.custom-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 90vw;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

.custom-toast.success {
  border-left: 4px solid #10b981;
}

.custom-toast.error {
  border-left: 4px solid #ef4444;
}

.custom-toast.warn {
  border-left: 4px solid #f59e0b;
}

.custom-toast.info {
  border-left: 4px solid #3b82f6;
}

.toast-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.toast-content i {
  font-size: 1.5rem;
}

.custom-toast.success i {
  color: #10b981;
}

.custom-toast.error i {
  color: #ef4444;
}

.custom-toast.warn i {
  color: #f59e0b;
}

.custom-toast.info i {
  color: #3b82f6;
}

.toast-text {
  flex: 1;
}

.toast-text strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.toast-text p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.toast-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
}

.toast-close:hover {
  color: #4b5563;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .custom-toast {
    top: auto;
    bottom: 20px;
    right: 20px;
    left: 20px;
    min-width: auto;
    width: calc(100vw - 40px);
  }
  
  .fade-enter-from,
  .fade-leave-to {
    transform: translateY(30px);
  }
}

/* Landscape mobile */
@media (max-width: 992px) and (orientation: landscape) {
  .custom-toast {
    top: 10px;
    right: 10px;
    bottom: auto;
    min-width: 250px;
  }
}

</style>