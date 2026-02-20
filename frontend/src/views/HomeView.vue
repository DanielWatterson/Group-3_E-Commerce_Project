<script setup>
import Button from 'primevue/button'
import Card from 'primevue/card'

const features = [
  {
    icon: 'pi pi-star-fill',
    title: 'Premium Quality',
    description: 'Hand-crafted desks using sustainable wood materials',
    color: '#8B4513'
  },
  {
    icon: 'pi pi-truck',
    title: 'Fast Delivery',
    description: 'Free shipping on orders over $500',
    color: '#2c5282'
  },
  {
    icon: 'pi pi-shield',
    title: '5 Year Warranty',
    description: 'All products come with comprehensive warranty coverage',
    color: '#276749'
  }
]

const featuredProducts = [
  {
    name: 'Executive Wood Desk',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164d8b7c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    badge: 'Best Seller'
  },
  {
    name: 'Standing Desk Converter',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    badge: 'New'
  },
  {
    name: 'Minimalist L-shaped Desk',
    price: 699.99,
    image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    badge: 'Sale'
  }
]
</script>

<template>
  <div class="home-container">
    <!-- Hero Section with dark overlay for contrast -->
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">Workspaces Redefined.</h1>
        <p class="hero-subtitle">
          Sustainable wood meets high-performance tech. Custom built for your home, office, or battle station.
        </p>
        <div class="hero-buttons">
          <Button 
            label="Shop Now" 
            icon="pi pi-shopping-bag"
            class="shop-btn" 
            @click="$router.push('/products')"
          />
          <Button 
            label="View Services" 
            icon="pi pi-cog"
            class="services-btn p-button-outlined" 
            @click="$router.push('/services')"
          />
        </div>
      </div>
    </div>

    <!-- Features Section with outlined cards -->
    <div class="features-section">
      <h2 class="section-title">Why Choose LumberLink</h2>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card-wrapper">
          <Card class="feature-card">
            <template #header>
              <div class="feature-icon-wrapper">
                <div class="feature-icon" :style="{ background: feature.color }">
                  <i :class="feature.icon"></i>
                </div>
              </div>
            </template>
            <template #title>
              <h3>{{ feature.title }}</h3>
            </template>
            <template #content>
              <p>{{ feature.description }}</p>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- Featured Products -->
    <div class="featured-section">
      <h2 class="section-title">Featured Products</h2>
      <div class="featured-grid">
        <div v-for="product in featuredProducts" :key="product.name" class="featured-product-card">
          <div class="product-image-wrapper">
            <img :src="product.image" :alt="product.name">
            <span v-if="product.badge" class="product-badge">{{ product.badge }}</span>
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="product-price">${{ product.price.toFixed(2) }}</p>
            <Button 
              label="View Details" 
              icon="pi pi-arrow-right" 
              iconPos="right"
              class="p-button-outlined view-btn"
              @click="$router.push('/products')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- CTA Section with outline -->
    <div class="cta-section">
      <div class="cta-content">
        <h2>Ready to transform your workspace?</h2>
        <p>Browse our collection of premium desks and accessories</p>
        <Button 
          label="Browse All Products" 
          icon="pi pi-arrow-right"
          iconPos="right"
          class="cta-btn"
          @click="$router.push('/products')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Hero Section */
.hero-section {
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1611485988300-b7aa6810d997?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80');
  background-size: cover;
  background-position: center;
  border-radius: 30px;
  margin-bottom: 4rem;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 2px solid #8B4513;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(139,69,19,0.5) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding: 2rem;
  max-width: 800px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.shop-btn {
  background: #8B4513;
  border: 2px solid #8B4513;
  padding: 0.75rem 2rem;
  font-weight: 600;
}

.shop-btn:hover {
  background: #6B3410;
  border-color: #6B3410;
  transform: translateY(-2px);
}

.services-btn {
  color: white;
  border: 2px solid white;
  padding: 0.75rem 2rem;
  font-weight: 600;
}

.services-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
  transform: translateY(-2px);
}

/* Section Titles */
.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 3rem;
  text-align: center;
  position: relative;
}

.section-title:after {
  content: '';
  display: block;
  width: 100px;
  height: 4px;
  background: #8B4513;
  margin: 1rem auto 0;
  border-radius: 2px;
}

/* Features Section */
.features-section {
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card-wrapper {
  transition: transform 0.3s ease;
}

.feature-card-wrapper:hover {
  transform: translateY(-5px);
}

.feature-card {
  text-align: center;
  border: 2px solid #8B4513;
  border-radius: 16px;
  overflow: hidden;
}

.feature-card :deep(.p-card-body) {
  padding: 0;
}

.feature-card :deep(.p-card-content) {
  padding: 1.5rem;
}

.feature-icon-wrapper {
  padding: 2rem 0 0;
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 2rem;
  color: white;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.feature-card h3 {
  color: #2d3748;
  font-size: 1.5rem;
  margin: 1rem 0 0.5rem;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
  margin: 0;
}

/* Featured Products */
.featured-section {
  margin-bottom: 4rem;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.featured-product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.featured-product-card:hover {
  transform: translateY(-5px);
  border-color: #8B4513;
  box-shadow: 0 10px 25px rgba(139, 69, 19, 0.2);
}

.product-image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.featured-product-card:hover .product-image-wrapper img {
  transform: scale(1.1);
}

.product-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #8B4513;
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid white;
}

.product-info {
  padding: 1.5rem;
}

.product-info h3 {
  color: #2d3748;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.product-price {
  color: #8B4513;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.view-btn {
  width: 100%;
  border-color: #8B4513;
  color: #8B4513;
}

.view-btn:hover {
  background: #8B4513;
  color: white;
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border-radius: 30px;
  padding: 4rem 2rem;
  text-align: center;
  border: 2px solid #8B4513;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-content h2 {
  color: white;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.cta-content p {
  color: #cbd5e0;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.cta-btn {
  background: #8B4513;
  border: 2px solid #8B4513;
  padding: 0.75rem 2rem;
  font-weight: 600;
}

.cta-btn:hover {
  background: #6B3410;
  border-color: #6B3410;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 768px) {
  .home-container {
    padding: 1rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-buttons {
    flex-direction: column;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-content h2 {
    font-size: 2rem;
  }
}
</style>