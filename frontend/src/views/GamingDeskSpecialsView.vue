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
          discount: '25% Off'
        },
        {
          title: 'BattleStation L-Frame Walnut',
          details: 'Deep ergonomic curve with reinforced steel legs and matte walnut finish.',
          discount: '18% Off'
        },
        {
          title: 'Compact Streamer Desk',
          details: 'Space-saving setup with microphone arm cutout and monitor riser.',
          discount: 'Bundle Deal'
        }
      ]
    }
  }
}
</script>

<template>
  <section class="specials-page">
    <div class="page-hero">
      <p class="eyebrow">Specials</p>
      <h1>Best Buys for Gaming PC Desks</h1>
      <p>Built from responsibly sourced hardwood and tuned for high-performance setups.</p>
      <Button label="Browse Full Shop" icon="pi pi-arrow-right" @click="$router.push('/products')" />
    </div>

    <div class="deals-grid">
      <article v-for="deal in deals" :key="deal.title" class="deal-card">
        <span class="deal-badge">{{ deal.discount }}</span>
        <h2>{{ deal.title }}</h2>
        <p>{{ deal.details }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.specials-page {
  min-height: calc(100vh - 72px);
  padding: 2.2rem 1.3rem 3rem;
  background:
    radial-gradient(circle at top, rgba(179, 118, 59, 0.2), transparent 55%),
    linear-gradient(180deg, #1c1611 0%, #2a2119 58%, #f1ede7 58%, #f1ede7 100%);
}

.page-hero {
  max-width: 780px;
  margin: 0 auto 2.1rem;
  text-align: center;
  color: #f5efe6;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.82rem;
  opacity: 0.84;
}

h1 {
  margin: 0.5rem 0 0.65rem;
  font-size: clamp(1.9rem, 4.2vw, 3.1rem);
}

.page-hero p {
  margin: 0 0 1.2rem;
  line-height: 1.5;
}

.deals-grid {
  max-width: 1020px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.deal-card {
  background: #fff;
  border-radius: 14px;
  padding: 1.05rem 1rem 1.2rem;
  border: 1px solid rgba(139, 104, 68, 0.22);
  box-shadow: 0 8px 28px rgba(32, 23, 15, 0.08);
}

.deal-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  color: #fff;
  background: #94653a;
}

h2 {
  margin: 0.75rem 0 0.45rem;
  font-size: 1.1rem;
  color: #38281d;
}

.deal-card p {
  margin: 0;
  color: #6f5a47;
  line-height: 1.45;
}
</style>
