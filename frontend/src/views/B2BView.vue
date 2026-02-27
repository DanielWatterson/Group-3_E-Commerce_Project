<template>
  <div class="b2b-container">

    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="badge">Enterprise Solutions</span>
        <h1>Architectural Woodwork & <br/>Precision Carpentry Systems</h1>
        <p>
          Delivering high-capacity joinery and digital-first woodcraft for 
          tier-one construction firms, retail developers, and commercial interior specialists.
        </p>
        <div class="hero-actions">
          <button class="cta-btn primary" @click="openFormModal">
            <i class="pi pi-star"></i> Partner With Us
          </button>
          <button class="cta-btn outline">
            <i class="pi pi-file-pdf"></i> View Technical Specs
          </button>
        </div>
      </div>
    </section>

    <section class="market-insight">
      <div class="container">
        <div class="insight-grid">
          <div class="insight-text">
            <h2>Capitalize on a Growing Sector</h2>
            <p>
              The global joinery market is projected to reach <strong>$2.22B by 2032</strong>. 
              We position our partners at the forefront of this 37% growth trajectory through 
              sustainable sourcing and advanced CAD/CAM integration.
            </p>
          </div>
          <div class="insight-stat">
            <div class="stat-box">
              <span class="stat-number">+37%</span>
              <span class="stat-label">Projected Market Growth</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2><i class="pi pi-cog"></i> Core B2B Capabilities</h2>
          <p>Scalable infrastructure designed for commercial rigor.</p>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-icon"><i class="pi pi-box"></i></div>
            <h3>High-Volume Manufacturing</h3>
            <p>Automated production lines for furniture, decor, and structural elements with rigorous quality control for retail and hospitality.</p>
          </div>

          <div class="card">
            <div class="card-icon"><i class="pi pi-building"></i></div>
            <h3>Structural Contracting</h3>
            <p>Comprehensive on-site carpentry management for large-scale developments, ensuring code compliance and structural integrity.</p>
          </div>

          <div class="card">
            <div class="card-icon"><i class="pi pi-pencil"></i></div>
            <h3>Bespoke Joinery Systems</h3>
            <p>Custom-engineered architectural woodwork tailored to specific brand identities and premium residential requirements.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section dark-accent">
      <div class="container">
        <div class="section-header">
          <h2 class="white-text"><i class="pi pi-chart-line"></i> The Competitive Advantage</h2>
        </div>
        <div class="grid">
          <div class="feature-item">
            <h4><i class="pi pi-chart-line feature-icon"></i> Fixed-Cost Modeling</h4>
            <p>Standardized pricing structures that safeguard your margins and eliminate the volatility of traditional carpentry quotes.</p>
          </div>
          <div class="feature-item">
            <h4><i class="pi pi-chart-bar feature-icon"></i> Efficiency-Driven ROI</h4>
            <p>Digital workflows achieve 15% faster turnaround times and a 20% reduction in material waste, direct to your bottom line.</p>
          </div>
          <div class="feature-item">
            <h4><i class="pi pi-globe feature-icon"></i> ESG-Compliant Sourcing</h4>
            <p>Leveraging local, refurbished, and certified timber to meet modern sustainability mandates and reduce carbon footprints.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="tech-showcase">
          <div class="tech-content">
            <h2><i class="pi pi-microchip"></i> Digital-First Innovation</h2>
            <div class="tech-list">
              <div class="tech-item">
                <strong><i class="pi pi-desktop"></i> Immersive Virtual Showrooms</strong>
                <p>Allow stakeholders to walkthrough projects digitally before the first cut is made.</p>
              </div>
              <div class="tech-item">
                <strong><i class="pi pi-eye"></i> AR Spatial Projection</strong>
                <p>Reduce site errors by 40% using Augmented Reality to project life-size specs onto physical spaces.</p>
              </div>
            </div>
          </div>
          <div class="tech-visual">
            <div class="glass-card">
              <code><i class="pi pi-code"></i> // Precision CAD/CAM Export<br>Ref: Project_772_B2B<br>Status: Ready for Production</code>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Contact Overlay - ENLARGED -->
    <div v-if="showFormOverlay" class="form-overlay" @click="closeFormModal">
      <div class="overlay-content" @click.stop>
        <button class="close-overlay" @click="closeFormModal">
          <i class="pi pi-times"></i>
        </button>
        <div class="form-wrapper">
          <PartnershipForm modal @submitted="handleFormSubmitted" @closed="closeFormModal" />
        </div>
      </div>
    </div>

    <!-- Contact Info Section -->
    <section class="contact-info-section">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-card" @click="openFormModal">
            <div class="contact-icon"><i class="pi pi-phone"></i></div>
            <h3>Enterprise Sales</h3>
            <p class="contact-detail">+27 (0) 11 234 5678</p>
            <p class="contact-detail">enterprise@woodcraft.co.za</p>
            <p class="contact-note"><i class="pi pi-clock"></i> Mon-Fri, 8am - 5pm SAST</p>
            <button class="contact-action">
              <i class="pi pi-send"></i> Contact Sales
            </button>
          </div>

          <div class="contact-card">
            <div class="contact-icon"><i class="pi pi-map-marker"></i></div>
            <h3>Head Office</h3>
            <p class="contact-detail">12 Industrial Road</p>
            <p class="contact-detail">Johannesburg, 2000</p>
            <p class="contact-detail">South Africa</p>
            <a href="https://maps.google.com" target="_blank" class="contact-action">
              <i class="pi pi-map"></i> View on Map
            </a>
          </div>

          <div class="contact-card">
            <div class="contact-icon"><i class="pi pi-clock"></i></div>
            <h3>Quick Response</h3>
            <p class="contact-detail">24h response time</p>
            <p class="contact-detail">Dedicated account managers</p>
            <p class="contact-detail">Site visits available</p>
            <button class="contact-action" @click="openFormModal">
              <i class="pi pi-calendar"></i> Schedule Meeting
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="final-cta">
      <div class="container">
        <h2><i class="pi pi-chart-line"></i> Scale Your Project Capacity</h2>
        <p>Join our network of industry leaders delivering the next generation of South African craftsmanship.</p>
        <button class="cta-btn primary large" @click="openFormModal">
          <i class="pi pi-star"></i> Initiate Partnership
        </button>
      </div>
    </section>

  </div>
</template>

<script>
import { onBeforeUnmount, ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import PartnershipForm from '@/components/PartnershipForm.vue';

export default {
  name: 'B2BView',
  components: {
    PartnershipForm
  },
  setup() {
    const toast = useToast();
    const showFormOverlay = ref(false);
    let previousBodyOverflow = '';

    const restoreBodyOverflow = () => {
      document.body.style.overflow = previousBodyOverflow;
    };

    const openFormModal = () => {
      if (!showFormOverlay.value) {
        previousBodyOverflow = document.body.style.overflow;
      }
      showFormOverlay.value = true;
      document.body.style.overflow = 'hidden';
    };

    const closeFormModal = () => {
      showFormOverlay.value = false;
      restoreBodyOverflow();
    };

    const handleFormSubmitted = (formData) => {
      console.log('Form submitted:', formData);
      setTimeout(() => {
        closeFormModal();
      }, 3000);
    };

    onBeforeUnmount(() => {
      restoreBodyOverflow();
    });

    return {
      showFormOverlay,
      openFormModal,
      closeFormModal,
      handleFormSubmitted
    };
  }
};
</script>

<style scoped>
:root {
  --primary: #1E3A5F;     
  --accent: #8B5E3C;      
  --success: #2E7D32;     
  --background: #FAF9F6;  
  --text-main: #2C3E50;
  --white: #ffffff;
}

.b2b-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #FAF9F6;
  color: #2C3E50;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('https://images.squarespace-cdn.com/content/v1/571def984d088eb303dd0f0b/00050643-f618-4749-8b4c-c1ed5e928adf/A+Beginners+Guide+To+Woodworking+Projects.jpg') center/cover no-repeat;
  color: white;
  text-align: center;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(30, 58, 95, 0.95) 0%, rgba(30, 58, 95, 0.7) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
}

.badge {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 12px;
  background: rgba(255,255,255,0.1);
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
  margin-bottom: 20px;
  display: inline-block;
}

.hero h1 {
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.1;
  font-weight: 800;
  margin-bottom: 24px;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 650px;
  margin: 0 auto 40px;
}

.hero-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.cta-btn {
  padding: 16px 32px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.cta-btn.primary {
  background-color: #8B5E3C;
  color: white;
}

.cta-btn.primary:hover {
  background-color: #A67B5B;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.cta-btn.outline {
  background: transparent;
  border: 1px solid white;
  color: white;
}

.cta-btn.outline:hover {
  background: white;
  color: #1E3A5F;
}

.section {
  padding: 100px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 36px;
  color: #1E3A5F;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.dark-accent {
  background-color: #1E3A5F;
  color: rgba(255,255,255,0.8);
}

.white-text { color: white !important; }

.market-insight {
  padding: 80px 0;
  background: white;
  border-bottom: 1px solid #eee;
}

.insight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 60px;
}

.stat-box {
  background: #f8f9fa;
  padding: 40px;
  border-left: 5px solid #8B5E3C;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 48px;
  font-weight: 800;
  color: #1E3A5F;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  transition: transform 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
}

.card:hover {
  transform: translateY(-10px);
}

.card-icon {
  font-size: 40px;
  margin-bottom: 20px;
  color: #8B5E3C;
}

.card h3 {
  color: #1E3A5F;
  margin-bottom: 15px;
  font-size: 22px;
}

.feature-item {
  background: rgba(255,255,255,0.1);
  padding: 30px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
}

.feature-item h4 {
  color: #8B5E3C;
  font-size: 20px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-icon {
  color: #8B5E3C;
}

.tech-showcase {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.tech-item {
  margin-bottom: 30px;
}

.tech-item strong {
  display: block;
  font-size: 18px;
  color: #1E3A5F;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.glass-card {
  background: #1e3a5f;
  color: #4ed9ff;
  padding: 30px;
  border-radius: 8px;
  font-family: monospace;
  box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
}

.glass-card i {
  margin-right: 8px;
}

/* ENLARGED FORM OVERLAY STYLES */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 30px;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(5px);
}

.overlay-content {
  position: relative;
  max-width: 1100px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: transparent;
  animation: slideUp 0.4s ease;
}

.form-wrapper {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

.close-overlay {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: none;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 20;
  font-size: 1.5rem;
  color: #1E3A5F;
}

.close-overlay:hover {
  transform: rotate(90deg) scale(1.1);
  background: #f0f0f0;
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
}

/* Make the form inside larger */
:deep(.partnership-form-component .form-container) {
  padding: 0;
  box-shadow: none;
}

:deep(.partnership-form-component .form-header h2) {
  font-size: 2.5rem;
}

:deep(.partnership-form-component .form-group input),
:deep(.partnership-form-component .form-group select),
:deep(.partnership-form-component .form-group textarea) {
  padding: 14px;
  font-size: 1.1rem;
}

:deep(.partnership-form-component .submit-btn) {
  padding: 18px 50px;
  font-size: 1.2rem;
}

.contact-info-section {
  padding: 80px 0;
  background: white;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.contact-card {
  text-align: center;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.contact-icon {
  font-size: 32px;
  color: #8B5E3C;
  margin-bottom: 20px;
}

.contact-card h3 {
  color: #1E3A5F;
  margin-bottom: 15px;
  font-size: 20px;
}

.contact-detail {
  margin: 5px 0;
  color: #666;
}

.contact-note {
  margin-top: 10px;
  color: #999;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.contact-action {
  margin-top: 20px;
  padding: 10px 20px;
  background: #8B5E3C;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  font-size: 0.9rem;
}

.contact-action:hover {
  background: #A67B5B;
  transform: translateY(-2px);
}

.final-cta {
  background-color: #12263F;
  color: white;
  text-align: center;
  padding: 120px 0;
}

.final-cta h2 { 
  font-size: 42px; 
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.final-cta p { 
  font-size: 1.2rem; 
  margin-bottom: 40px; 
  opacity: 0.8; 
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .insight-grid, 
  .tech-showcase,
  .contact-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-actions {
    flex-direction: column;
  }
  
  .section {
    padding: 60px 0;
  }
  
  .overlay-content {
    max-width: 100%;
    padding: 10px;
  }
  
  .form-wrapper {
    padding: 20px;
  }
  
  .close-overlay {
    top: -15px;
    right: -15px;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  :deep(.partnership-form-component .form-header h2) {
    font-size: 1.8rem;
  }
}
</style>
