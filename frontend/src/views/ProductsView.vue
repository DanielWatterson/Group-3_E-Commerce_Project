<script>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

export default {
  name: "ProductsView",
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();
    
    const products = computed(() => store.state.products || []);
    const isAuthenticated = computed(() => store.getters.isAuthenticated);
    const cartCount = computed(() => store.getters.cartCount);
    
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
      { name: 'Software', value: 'software' },
      { name: 'AI Chatbot', value: 'ai chatbot' },
      { name: 'Code', value: 'code' }
    ]);

    const sortOptions = ref([
      { name: 'Name (A-Z)', value: 'name_asc' },
      { name: 'Name (Z-A)', value: 'name_desc' },
      { name: 'Price (Low to High)', value: 'price_asc' },
      { name: 'Price (High to Low)', value: 'price_desc' },
      { name: 'Stock (Low to High)', value: 'stock_asc' }
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

    // Load products
    const loadProducts = async () => {
      loading.value = true;
      try {
        await store.dispatch('getProducts');
        if (products.value.length > 0) {
          toast.add({ severity: 'success', summary: 'Success', detail: 'Products loaded successfully', life: 3000 });
        }
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
    const addToCart = (product) => {
      if (!isAuthenticated.value) {
        toast.add({ severity: 'warn', summary: 'Warning', detail: 'Please login to add items to cart', life: 3000 });
        router.push('/login');
        return;
      }
      
      if (product.quantity <= 0) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Product is out of stock', life: 3000 });
        return;
      }
      
      store.dispatch('addToCart', product);
      toast.add({ severity: 'success', summary: 'Success', detail: `${product.product_name} added to cart`, life: 3000 });
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
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price || 0);
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
      formatPrice
    };
  }
};
</script>

<template>
  <div class="products-view">
    <Toast />
    
    <!-- Page Header -->
    <div class="page-header">
      <h1>Our Products</h1>
      <p>Discover our collection of high-quality digital products</p>
    </div>

    <div class="content-card">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
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
          <Button 
            v-if="isAuthenticated"
            label="Add Product" 
            icon="pi pi-plus" 
            class="p-button-success"
            @click="openNew"
          />
          <Button 
            label="Cart" 
            icon="pi pi-shopping-cart" 
            class="p-button-outlined"
            @click="$router.push('/cart')"
          >
            <Badge v-if="cartCount > 0" :value="cartCount" class="cart-badge" />
          </Button>
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
            
            <div v-if="isAuthenticated" class="admin-actions">
              <Button 
                icon="pi pi-pencil" 
                class="p-button-rounded p-button-text p-button-info"
                @click="editProduct(product)"
              />
              <Button 
                icon="pi pi-trash" 
                class="p-button-rounded p-button-text p-button-danger"
                @click="confirmDelete(product)"
              />
            </div>
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
        <label for="price">Price ($)</label>
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #718096;
  font-size: 1.1rem;
}

.content-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.toolbar-left {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  flex: 1;
}

.search-input {
  width: 250px;
}

.category-dropdown, .sort-dropdown {
  width: 150px;
}

.toolbar-right {
  display: flex;
  gap: 1rem;
}

.cart-badge {
  margin-left: 0.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
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
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.product-card.out-of-stock {
  opacity: 0.7;
  background: #f7fafc;
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
}

.product-name {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
}

.product-id {
  color: #a0aec0;
  font-size: 0.875rem;
}

.product-details {
  margin-bottom: 1.5rem;
}

.product-price {
  font-size: 1.75rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-count {
  color: #718096;
  font-size: 0.875rem;
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  color: #718096;
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
  color: #2d3748;
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
  font-weight: 500;
  color: #4a5568;
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
}
</style>