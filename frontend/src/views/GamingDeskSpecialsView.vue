<script>
import Button from 'primevue/button'

export default {
  name: 'GamingDeskSpecialsView',
  components: {
    Button
  },
  data() {
    return {
      deals: [
        {
          title: 'Edge Pro RGB Oak Desk',
          details: 'Cable-managed oak desktop with hidden LED channel and headset dock.',
          discount: '25% Off',
          image: 'https://oakodenmark.dk/cdn/shop/files/OakoDenkamrk__VictorLiska-7.jpg?v=1771448489&width=2048'
        },
        {
          title: 'BattleStation L-Frame Walnut',
          details: 'Deep ergonomic curve with reinforced steel legs and matte walnut finish.',
          discount: '18% Off',
          image: 'https://i.pinimg.com/originals/74/6d/cf/746dcf0c7739b1568dcdbedf33363c2d.jpg'
        },
        {
          title: 'Compact Streamer Desk',
          details: 'Space-saving setup with microphone arm cutout and monitor riser.',
          discount: 'Bundle Deal',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaIStslwDc20VMIAy1OIMlumLGhDVc7LznkA&s'
        },
        {
          title: 'NeuroCore Fusion Desk',
          details: 'Carbon-steel frame infused into kiln-dried oak with reactive RGB edge veins.',
          discount: '30% Off',
          image: 'https://images.thdstatic.com/productImages/7e908711-fecf-4c2c-ab99-e011c5439062/svn/black-carbon-fiber-bestier-gaming-desks-usthdczus-g200313c-bdcfbt-m-64_600.jpg'
        },
        {
          title: 'Titan Circuitwood X',
          details: 'Embedded cable grid channels and brushed alloy spine bonded to walnut slab.',
          discount: 'Limited Drop',
          image: 'https://thumbs.dreamstime.com/b/high-tech-gaming-desks-futuristic-lighting-collection-cutting-edge-gaming-desks-designed-immersive-setups-featuring-359217319.jpg'
        },
        {
          title: 'MechaGrain Elite Station',
          details: 'Layered hardwood over reinforced chassis with underglow pulse sync system.',
          discount: 'New Release',
          image: 'https://m.media-amazon.com/images/I/61v9j6vFRML.jpg'
        },
        {
          title: 'Quantum GlassFrame Desk',
          details: 'Tempered glass inlay with triple-zone RGB diffusion and hidden wire tunnels.',
          discount: 'Hot Deal',
          image: 'https://m.media-amazon.com/images/I/71Bqmke1rcL._AC_UF1000,1000_QL80_.jpg'
        },
        {
          title: 'Nebula Core Command Desk',
          details: 'Floating steel architecture with spectrum-reactive light strips.',
          discount: 'Exclusive',
          image: 'https://thumbs.dreamstime.com/b/high-tech-gaming-desk-sleek-stylish-design-featuring-touch-screen-monitor-futuristic-keyboard-high-tech-gaming-desk-274191586.jpg'
        }
      ]
    }
  }
}
</script>

<template>
  <section class="specials-page">

    <div class="hero-split">
      <div class="hero-left">
        <p class="eyebrow">Elite Builds</p>
        <h1>Next-Gen RGB Gaming Desk Systems</h1>
        <p class="hero-desc">
          Designed for high-performance battlestations. Engineered hardwood meets
          reactive RGB architecture to create immersive competitive environments.
        </p>

        <div class="hero-buttons">
          <Button label="Browse Collection" icon="pi pi-arrow-right" @click="$router.push('/products')" />
          <Button label="Limited Drops" severity="secondary" />
        </div>
      </div>

      <div class="hero-right">
        <div class="hero-visual-card">
          <h3>Pro Setup Ready</h3>
          <p>Integrated cable channels, underglow sync, reinforced frames.</p>
        </div>
      </div>
    </div>

    <div class="feature-strip">
      <div>
        <h3>Built for Streamers</h3>
        <p>Optimized layouts for multi-monitor, mic arms & LED ambience control.</p>
      </div>
      <div>
        <h3>Engineered Stability</h3>
        <p>Steel-reinforced architecture eliminates flex during high-intensity sessions.</p>
      </div>
      <div>
        <h3>Smart Cable Grid</h3>
        <p>Hidden routing systems for ultra-clean professional setups.</p>
      </div>
    </div>

    <div class="section-header">
      <h2>Special Drops</h2>
      <p>Limited-time builds infused with RGB reactive edge technology.</p>
    </div>

    <div class="deals-grid">
      <article
        v-for="deal in deals"
        :key="deal.title"
        class="deal-card"
        :style="{ backgroundImage: `url(${deal.image})` }"
      >
        <div class="deal-overlay">
          <span class="deal-badge">{{ deal.discount }}</span>
          <h3>{{ deal.title }}</h3>
          <p>{{ deal.details }}</p>
        </div>
      </article>
    </div>

    <div class="ad-banner">
      <div class="ad-content">
        <h2>Upgrade Your Entire Setup</h2>
        <p>
          Pair your desk with RGB wall panels, cable kits, and performance lighting bundles.
          Save up to 35% when bundled with accessories.
        </p>
        <Button label="Shop Accessories" />
      </div>
    </div>

  </section>
</template>

<style scoped>
.specials-page {
  padding: 3rem 1.5rem 4rem;
  background:
    radial-gradient(circle at 10% 20%, rgba(0,255,255,0.15), transparent 40%),
    radial-gradient(circle at 85% 30%, rgba(255,0,200,0.15), transparent 40%),
    linear-gradient(135deg, #05070d, #0b1020 60%, #12091a);
  color: white;
}

.hero-split {
  max-width: 1200px;
  margin: auto;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
  align-items: center;
  margin-bottom: 4rem;
}

.hero-left h1 {
  font-size: clamp(2.5rem, 4vw, 3.5rem);
  background: linear-gradient(90deg, #00f0ff, #ff00c8, #7a5cff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  color: #b8c6ff;
  margin: 1rem 0 1.8rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.hero-visual-card {
  padding: 2rem;
  border-radius: 20px;
  background: rgba(18,22,38,0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0,255,255,0.25);
  box-shadow: 0 0 40px rgba(0,255,255,0.15);
}

.feature-strip {
  max-width: 1100px;
  margin: 0 auto 4rem;
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(240px,1fr));
  gap: 2rem;
  text-align: center;
}

.feature-strip h3 {
  color: #00f0ff;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header p {
  color: #b8c6ff;
}


.deals-grid {
  max-width: 1200px;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 180px;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.deal-card {
  border-radius: 20px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  transition: 0.4s ease;
  display: flex;
  align-items: flex-end;
  padding: 0;
  color: #fff;
  box-shadow:
    0 0 15px rgba(0,0,0,0.3),
    inset 0 0 15px rgba(0,0,0,0.3);
}

.deal-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 0 40px rgba(255,0,200,0.25);
}


.deal-card:nth-child(4n + 1) {
  grid-column: span 2;
  grid-row: span 2;
}


.deal-card:nth-child(3n + 2) {
  grid-column: span 2;
}


.deal-overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  background: rgba(0,0,0,0.35);
  padding: 1rem;
  border-radius: 0 0 20px 20px;
}


.deal-badge {
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: linear-gradient(90deg,#00f0ff,#ff00c8);
  color: #05070d;
  display: inline-block;
  margin-bottom: 0.6rem;
}

.deal-card h3 {
  margin: 0.5rem 0;
}

.deal-card p {
  color: #c2d0ff;
  line-height: 1.4;
  font-size: 0.9rem;
}

.ad-banner {
  max-width: 1100px;
  margin: auto;
  padding: 3rem;
  border-radius: 24px;
  text-align: center;
  background: linear-gradient(120deg,#0f1328,#1b1040);
  border: 1px solid rgba(255,0,200,0.3);
  box-shadow: 0 0 60px rgba(255,0,200,0.15);
}

.ad-banner h2 {
  margin-bottom: 1rem;
  background: linear-gradient(90deg,#ff00c8,#00f0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ad-banner p {
  color: #b8c6ff;
  margin-bottom: 1.5rem;
}


@media (max-width: 1000px) {
  .hero-split {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-buttons {
    justify-content: center;
  }

  .deals-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 160px;
  }

  .deal-card:nth-child(4n + 1),
  .deal-card:nth-child(3n + 2) {
    grid-column: span 2;
    grid-row: span 1;
  }
}

@media (max-width: 600px) {
  .deals-grid {
    grid-template-columns: 1fr;
  }

  .deal-card {
    grid-column: span 1 !important;
    grid-row: span 1 !important;
  }
}
</style>