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
          perk: 'Limited Run'
        },
        {
          title: 'Focus Frame Executive Desk',
          details: 'Spacious ash wood top with ergonomic depth and integrated power dock.',
          perk: 'Office Favorite'
        },
        {
          title: 'Compact Team Pod Desk',
          details: 'Modular work desk with privacy panel and soft-close accessory rail.',
          perk: 'Bundle Savings'
        }
      ]
    }
  }
}
</script>

<template>
  <section class="specials-page">
    <div class="page-hero">
      <p class="eyebrow">Work Desk Specials</p>
      <h1>Ergonomic Workspaces That Last</h1>
      <p>Professional-grade desks designed for comfort, posture, and all-day productivity.</p>
      <Button label="Design Your Desk" icon="pi pi-compass" @click="$router.push('/custom-builder')" />
    </div>

    <div class="deals-grid">
      <article v-for="deal in deals" :key="deal.title" class="deal-card">
        <span class="deal-badge">{{ deal.perk }}</span>
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
    radial-gradient(circle at top, rgba(106, 149, 146, 0.22), transparent 58%),
    linear-gradient(180deg, #132524 0%, #153230 58%, #edf3f2 58%, #edf3f2 100%);
}

.page-hero {
  max-width: 780px;
  margin: 0 auto 2.1rem;
  text-align: center;
  color: #e9f4f3;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.82rem;
  opacity: 0.86;
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
  border: 1px solid rgba(63, 120, 116, 0.24);
  box-shadow: 0 8px 28px rgba(17, 45, 42, 0.08);
}

.deal-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  color: #fff;
  background: #2d8079;
}

h2 {
  margin: 0.75rem 0 0.45rem;
  font-size: 1.1rem;
  color: #1f4542;
}

.deal-card p {
  margin: 0;
  color: #4f6b69;
  line-height: 1.45;
}
</style>
