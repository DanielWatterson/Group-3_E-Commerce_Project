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
    const selectedCategory = ref('all');
    
    const categories = ref([
      { name: 'All Products', value: 'all' },
      { name: 'Desks', value: 'desk' },
      { name: 'Chairs', value: 'chair' },
      { name: 'Tables', value: 'table' },
      { name: 'Benches', value: 'bench' },
      { name: 'Statues', value: 'statuette' },
      { name: 'Kitchen', value: 'kitchen' },
      { name: 'Accessories', value: 'accessories' },
      { name: 'Decor', value: 'decor' }
    ]);

    const sortOptions = ref([
      { name: 'Name (A-Z)', value: 'name_asc' },
      { name: 'Name (Z-A)', value: 'name_desc' },
      { name: 'Price (Low to High)', value: 'price_asc' },
      { name: 'Price (High to Low)', value: 'price_desc' },
      { name: 'Stock (Low to High)', value: 'stock_asc' }
    ]);
    
    const selectedSort = ref('name_asc');

    const filteredProducts = computed(() => {
      let filtered = products.value;
      
      if (selectedCategory.value && selectedCategory.value !== 'all') {
        filtered = filtered.filter(p => 
          p.product_name && p.product_name.toLowerCase().includes(selectedCategory.value.toLowerCase())
        );
      }
      
      if (searchQuery.value) {
        filtered = filtered.filter(p => 
          p.product_name && p.product_name.toLowerCase().includes(searchQuery.value.toLowerCase())
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

    const addToCart = (product) => {
      if (!isAuthenticated.value) {
        toast.add({ 
          severity: 'warn', 
          summary: 'Login Required', 
          detail: 'Please login to add items to cart', 
          life: 3000 
        });
        sessionStorage.setItem('redirectAfterLogin', '/cart');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }
      
      if (product.quantity <= 0) {
        toast.add({ 
          severity: 'error', 
          summary: 'Out of Stock', 
          detail: `${product.product_name} is out of stock`, 
          life: 3000 
        });
        return;
      }
      
      store.dispatch('addToCart', product);
      toast.add({ 
        severity: 'success', 
        summary: 'Added to Cart', 
        detail: `${product.product_name} added to cart`, 
        life: 2000 
      });
    };

    const goToCart = () => router.push('/cart');

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

    onMounted(() => {
      loadProducts();
    });

    return {
      filteredProducts,
      isAuthenticated,
      cartCount,
      loading,
      searchQuery,
      selectedCategory,
      categories,
      sortOptions,
      selectedSort,
      addToCart,
      goToCart,
      getStockStatus,
      getStockSeverity,
      formatPrice,
      continueShopping: () => router.push('/')
    };
  }
};
</script>

<template>
  <div class="products-view">
    <Toast position="top-center" />
    
    <div class="page-header">
      <div class="header-top">
        <h1>Our Products</h1>
        <div class="cart-icon-container" @click="goToCart">
          <i class="pi pi-shopping-cart"></i>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </div>
      </div>
      <p>Discover our collection of handcrafted wooden furniture</p>
    </div>

    <div class="content-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <span class="search-wrapper">
            <i class="pi pi-search" />
            <input 
              v-model="searchQuery" 
              placeholder="Search products..." 
              class="search-input"
            />
          </span>
          
          <select v-model="selectedCategory" class="category-select">
            <option v-for="cat in categories" :key="cat.value" :value="cat.value">
              {{ cat.name }}
            </option>
          </select>
          
          <select v-model="selectedSort" class="sort-select">
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.name }}
            </option>
          </select>
        </div>
        
        <div class="toolbar-right">
          <button class="cart-btn-mobile" @click="goToCart">
            <i class="pi pi-shopping-cart"></i>
            <span v-if="cartCount > 0" class="cart-badge-mobile">{{ cartCount }}</span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Loading products...</p>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="empty-state">
        <i class="pi pi-box"></i>
        <h3>No Products Found</h3>
        <p v-if="searchQuery">No products match your search "{{ searchQuery }}"</p>
        <p v-else>No products available at the moment.</p>
        <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
          Clear Search
        </button>
      </div>

      <div v-else class="products-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.product_id" 
          class="product-card"
          :class="{ 'out-of-stock': product.quantity <= 0 }"
        >
          <div class="product-badge" v-if="product.quantity <= 0">Out of Stock</div>
          <div class="product-badge low-stock" v-else-if="product.quantity < 10">Low Stock</div>
          
          <div class="product-image">
            <i class="pi pi-image"></i>
          </div>
          
          <div class="product-info">
            <h3 class="product-name">{{ product.product_name }}</h3>
            <p class="product-id">#{{ product.product_id }}</p>
            
            <div class="product-price">{{ formatPrice(product.product_price) }}</div>
            
            <div class="product-stock">
              <Tag 
                :value="getStockStatus(product.quantity)" 
                :severity="getStockSeverity(getStockStatus(product.quantity))"
              />
              <span class="stock-count">{{ product.quantity }} available</span>
            </div>
            
            <button 
              @click="addToCart(product)" 
              :disabled="product.quantity === 0"
              class="add-to-cart-btn"
            >
              <i class="pi pi-shopping-cart"></i>
              {{ product.quantity > 0 ? 'Add to Cart' : 'Out of Stock' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.products-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.header-top h1 {
  font-size: 2.5rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.cart-icon-container {
  position: relative;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 50%;
  background: #8b4513;
  color: white;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.cart-icon-container:hover {
  background: #a0522d;
  transform: scale(1.05);
}

.cart-icon-container i {
  font-size: 1.5rem;
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  border: 2px solid white;
}

.page-header p {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
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

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-wrapper i {
  position: absolute;
  left: 1rem;
  color: #a0aec0;
}

.search-input {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  width: 250px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #8b4513;
}

.category-select, .sort-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  min-width: 150px;
}

.category-select:focus, .sort-select:focus {
  outline: none;
  border-color: #8b4513;
}

.toolbar-right {
  display: flex;
  gap: 1rem;
}

.cart-btn-mobile {
  display: none;
  position: relative;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cart-btn-mobile i {
  font-size: 1.25rem;
}

.cart-badge-mobile {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  position: relative;
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
  top: 10px;
  left: 10px;
  background: #e53e3e;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: bold;
  border-radius: 4px;
  z-index: 5;
}

.product-badge.low-stock {
  background: #dd6b20;
}

.product-image {
  height: 200px;
  background: #f7fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e2e8f0;
}

.product-image i {
  font-size: 3rem;
  color: #cbd5e0;
}

.product-info {
  padding: 1.5rem;
}

.product-name {
  margin: 0 0 0.25rem;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
}

.product-id {
  color: #a0aec0;
  font-size: 0.75rem;
  margin: 0 0 0.5rem;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #8b4513;
  margin-bottom: 0.75rem;
}

.product-stock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stock-count {
  color: #718096;
  font-size: 0.8rem;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.75rem;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #a0522d;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
}

.add-to-cart-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
}

.loading-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #8b4513;
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

.clear-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: #a0522d;
}

@media (max-width: 768px) {
  .products-view {
    padding: 1rem;
  }
  
  .header-top h1 {
    font-size: 2rem;
  }
  
  .cart-icon-container {
    display: none;
  }
  
  .cart-btn-mobile {
    display: flex;
  }
  
  .toolbar-left {
    flex-direction: column;
    width: 100%;
  }
  
  .search-wrapper {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .category-select,
  .sort-select {
    width: 100%;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>