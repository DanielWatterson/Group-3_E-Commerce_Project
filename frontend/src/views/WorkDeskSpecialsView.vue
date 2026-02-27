<script>
import Button from 'primevue/button'

export default {
  name: 'WorkDeskSpecialsView',
  components: {
    Button
  },
  data() {
    return {
      deals: [
        {
          title: 'AeroLift Sit-Stand Desk',
          details: 'Quiet dual motors, hidden cable tray, and rounded maple edge profile.',
          perk: 'Limited Run',
          image: 'https://thumbs.dreamstime.com/b/modern-home-office-setup-ocean-view-desktop-wallpaper-serene-productive-featuring-wooden-desk-imac-stunning-comfortable-398629844.jpg'
        },
        {
          title: 'Focus Frame Executive Desk',
          details: 'Spacious ash wood top with ergonomic depth and integrated power dock.',
          perk: 'Office Favorite',
          image: 'https://img.pikbest.com/wp/202408/contemporary-office-3d-render-of-home-with-pc-stationery-and-wooden-desk-in-overhead-view_9773732.jpg!w700wp'
        },
        {
          title: 'Compact Team Pod Desk',
          details: 'Modular work desk with privacy panel and soft-close accessory rail.',
          perk: 'Bundle Savings',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIJXVIsBaQeSj-zave0lkUseVFOiKklBqU8g&s'
        },
        {
          title: 'OakCore Minimal Desk',
          details: 'Solid oak surface with concealed drawer and cable grommet system.',
          perk: 'New Arrival',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSc2ACTpQbWSVUf6l1zWTPk7O_6Ts1QeMAlbg&s'
        },
        {
          title: 'Nordic Edge Workstation',
          details: 'Clean Scandinavian oak finish with matte black steel legs.',
          perk: 'Top Rated',
          image: 'https://www.makerstations.io/content/images/2024/05/jake-desk-setup-03.jpg'
        },
        {
          title: 'Heritage Pro Desk',
          details: 'Premium oak veneer top with built-in wireless charging pad.',
          perk: 'Premium Pick',
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwrr1g-7M55n5gFPfyy_0-Wg63mYs5cDEyfw&s'
        },
        {
          title: 'StudioLine Compact Desk',
          details: 'Minimal oak desk with floating shelf and slim profile frame.',
          perk: 'Space Saver',
          image: 'https://oakywood.shop/cdn/shop/products/220810_Oakywood_D3_3153_ca0ebdb8-fb58-4492-9bf6-cb42121251d3.jpg?crop=center&height=400&v=1749478772&width=530'
        },
        {
          title: 'Executive Oak Command Desk',
          details: 'Thick oak slab top with integrated power strip and soft-close drawer.',
          perk: 'Best Seller',
          image: 'https://www.makerstations.io/content/images/size/w1200/2023/08/edcmania-desk-setup-01.jpg'
        }
      ]
    }
  }
}
</script>

<template>
  <section class="specials-page">
    <div class="page-hero">
      <p class="eyebrow">The Artisan Collection</p>
      <h1>Precision Crafted. Nature Inspired.</h1>
      <p>Elevate your workflow with desks that blend high-performance engineering with the organic warmth of sustainably sourced hardwoods.</p>
      <Button label="Start Your Build" icon="pi pi-hammer" class="cta-button" @click="$router.push('/custom-builder')" />
    </div>

    <div class="quality-highlights">
      <div class="highlight-item">
        <i class="pi pi-verified"></i>
        <h3>Premium Grade Wood</h3>
        <p>We use FAS-rated North American Oak and Walnut, hand-selected for grain consistency and structural integrity.</p>
      </div>
      <div class="highlight-item">
        <i class="pi pi-shield"></i>
        <h3>Industrial Durability</h3>
        <p>Our matte black steel frames are powder-coated for a scratch-resistant finish that complements the wood’s natural oil rub.</p>
      </div>
      <div class="highlight-item">
        <i class="pi pi-leaf"></i>
        <h3>Eco-Conscious</h3>
        <p>For every desk built, we plant two trees. Our finishes are 100% VOC-free and safe for any indoor environment.</p>
      </div>
    </div>

    <div class="deals-grid">
      <article
        v-for="deal in deals"
        :key="deal.title"
        class="deal-card"
        :style="{ backgroundImage: `url(${deal.image})` }"
      >
        <div class="deal-overlay">
          <span class="deal-badge">{{ deal.perk }}</span>
          <h2>{{ deal.title }}</h2>
          <p>{{ deal.details }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>

.specials-page {
  min-height: calc(100vh - 72px);
  padding: 4rem 1.5rem;
  background-color: #121212; 
  color: #e0e0e0;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}


.page-hero {
  max-width: 850px;
  margin: 0 auto 4rem;
  text-align: center;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  color: #d4a373; 
  font-weight: 700;
}

h1 {
  margin: 1rem 0 1.5rem;
  font-size: clamp(2.2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.page-hero p {
  margin: 0 0 2rem;
  line-height: 1.6;
  font-size: 1.15rem;
  color: #a8a8a8;
}

.cta-button {
  background: #d4a373 !important;
  border: none !important;
  padding: 0.8rem 2rem !important;
  font-weight: 600 !important;
}


.quality-highlights {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1020px;
  margin: 0 auto 5rem;
  padding-bottom: 3rem;
  border-bottom: 1px solid rgba(212, 163, 115, 0.2);
}

.highlight-item {
  text-align: center;
}

.highlight-item i {
  font-size: 1.5rem;
  color: #d4a373;
  margin-bottom: 1rem;
}

.highlight-item h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
}

.highlight-item p {
  font-size: 0.85rem;
  line-height: 1.5;
  color: #888;
}


.deals-grid {
  max-width: 1020px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 220px;
  gap: 1.25rem;
}


.deal-card {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.deal-card:hover {
  transform: scale(1.02);
  border-color: rgba(212, 163, 115, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  z-index: 2;
}


.deal-card:nth-child(4n + 1) {
  grid-column: span 2;
  grid-row: span 2;
}
.deal-card:nth-child(3n + 2) {
  grid-column: span 2;
}


.deal-overlay {
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(18, 18, 18, 0.95) 10%, rgba(18, 18, 18, 0.2) 60%);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: 0.9;
  transition: opacity 0.3s;
}

.deal-card:hover .deal-overlay {
    opacity: 1;
}


.deal-badge {
  align-self: flex-start;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  color: #121212;
  background: #d4a373; 
  margin-bottom: 0.75rem;
}


.deal-overlay h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
}

.deal-overlay p {
  margin: 0;
  color: #a8a8a8;
  line-height: 1.4;
  font-size: 0.9rem;
  max-width: 90%;
}


@media (max-width: 1000px) {
  .quality-highlights {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .deals-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 200px;
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