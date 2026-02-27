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
          <button class="cta-btn primary">Partner With Us</button>
          <button class="cta-btn outline">View Technical Specs</button>
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
          <h2>Core B2B Capabilities</h2>
          <p>Scalable infrastructure designed for commercial rigor.</p>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-icon">📦</div>
            <h3>High-Volume Manufacturing</h3>
            <p>Automated production lines for furniture, decor, and structural elements with rigorous quality control for retail and hospitality.</p>
          </div>

          <div class="card">
            <div class="card-icon">🏗️</div>
            <h3>Structural Contracting</h3>
            <p>Comprehensive on-site carpentry management for large-scale developments, ensuring code compliance and structural integrity.</p>
          </div>

          <div class="card">
            <div class="card-icon">📐</div>
            <h3>Bespoke Joinery Systems</h3>
            <p>Custom-engineered architectural woodwork tailored to specific brand identities and premium residential requirements.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section dark-accent">
      <div class="container">
        <div class="section-header">
          <h2 class="white-text">The Competitive Advantage</h2>
        </div>
        <div class="grid">
          <div class="feature-item">
            <h4>Fixed-Cost Modeling</h4>
            <p>Standardized pricing structures that safeguard your margins and eliminate the volatility of traditional carpentry quotes.</p>
          </div>
          <div class="feature-item">
            <h4>Efficiency-Driven ROI</h4>
            <p>Digital workflows achieve 15% faster turnaround times and a 20% reduction in material waste, direct to your bottom line.</p>
          </div>
          <div class="feature-item">
            <h4>ESG-Compliant Sourcing</h4>
            <p>Leveraging local, refurbished, and certified timber to meet modern sustainability mandates and reduce carbon footprints.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="tech-showcase">
          <div class="tech-content">
            <h2>Digital-First Innovation</h2>
            <div class="tech-list">
              <div class="tech-item">
                <strong>Immersive Virtual Showrooms</strong>
                <p>Allow stakeholders to walkthrough projects digitally before the first cut is made.</p>
              </div>
              <div class="tech-item">
                <strong>AR Spatial Projection</strong>
                <p>Reduce site errors by 40% using Augmented Reality to project life-size specs onto physical spaces.</p>
              </div>
            </div>
          </div>
          <div class="tech-visual">
            <div class="glass-card">
              <code>// Precision CAD/CAM Export<br>Ref: Project_772_B2B<br>Status: Ready for Production</code>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="final-cta">
      <div class="container">
        <h2>Scale Your Project Capacity</h2>
        <p>Join our network of industry leaders delivering the next generation of South African craftsmanship.</p>
        <button class="cta-btn primary large">Initiate Partnership</button>
      </div>
    </section>

  </div>
</template>

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
}

.card h3 {
  color: #1E3A5F;
  margin-bottom: 15px;
  font-size: 22px;
}

.feature-item h4 {
  color: #8B5E3C;
  font-size: 20px;
  margin-bottom: 12px;
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
}

.glass-card {
  background: #1e3a5f;
  color: #4ed9ff;
  padding: 30px;
  border-radius: 8px;
  font-family: monospace;
  box-shadow: 20px 20px 60px #d9d9d9, -20px -20px 60px #ffffff;
}


.final-cta {
  background-color: #12263F;
  color: white;
  text-align: center;
  padding: 120px 0;
}

.final-cta h2 { font-size: 42px; margin-bottom: 20px; }
.final-cta p { font-size: 1.2rem; margin-bottom: 40px; opacity: 0.8; }

@media (max-width: 768px) {
  .insight-grid, .tech-showcase { grid-template-columns: 1fr; }
  .hero-actions { flex-direction: column; }
}
</style>