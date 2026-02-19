<script>
export default {
  name: "HomeView",
};
</script>

<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>Welcome to Our Store</h1>
      <p>Your one-stop shop for amazing products</p>
      <router-link to="/customers" class="cta-button">View Customers</router-link>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <h3>🛍️ Quality Products</h3>
        <p>We offer the best products at competitive prices</p>
      </div>
      <div class="feature-card">
        <h3>🚀 Fast Delivery</h3>
        <p>Get your orders delivered quickly and safely</p>
      </div>
      <div class="feature-card">
        <h3>💬 24/7 Support</h3>
        <p>Our customer support is always here to help</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  text-align: center;
}

.hero-section {
  background: white;
  padding: 4rem 2rem;
  border-radius: 20px;
  margin-bottom: 3rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.hero-section h1 {
  font-size: 3rem;
  color: #333;
  margin-bottom: 1rem;
}

.hero-section p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.05);
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}
</style>