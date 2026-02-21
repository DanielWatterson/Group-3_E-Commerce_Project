<script>
import HeroSection from '@/components/HeroSection.vue'
import Button from 'primevue/button'

export default {
  name: 'HomeView',
  components: {
    HeroSection,
    Button
  },
  data() {
    return {
      craftsmanshipPoints: [
        {
          icon: 'pi pi-star-fill',
          title: '100% Sustainable Wood',
          text: 'Certified lumber, low-VOC finish, and durable joinery built to last.'
        },
        {
          icon: 'pi pi-bolt',
          title: 'Modular DeskTech',
          text: 'Power, cable, and lighting modules integrated cleanly into your build.'
        },
        {
          icon: 'pi pi-truck',
          title: 'Fast Craft + Delivery',
          text: 'Design, build, and install timeline optimized for homes and offices.'
        }
      ],
      featureChips: [
        {
          icon: 'pi pi-shield',
          title: '5-Year Warranty',
          sub: 'Structural + hardware coverage'
        },
        {
          icon: 'pi pi-sliders-h',
          title: 'Ergo-Grade',
          sub: 'Built around posture and comfort'
        },
        {
          icon: 'pi pi-desktop',
          title: 'Cable-Smart',
          sub: 'Hidden routing and power channels'
        },
        {
          icon: 'pi pi-check-circle',
          title: 'Craft Certified',
          sub: 'Each desk is quality checked'
        },
        {
          icon: 'pi pi-globe',
          title: 'Nationwide Setup',
          sub: 'Delivery and install support'
        }
      ],
      techHighlights: [
        {
          icon: 'pi pi-wifi',
          title: 'Smart Control Ready',
          text: 'Desk presets, lighting scenes, and reminders with a single touch.'
        },
        {
          icon: 'pi pi-bolt',
          title: 'Power + Cable Discipline',
          text: 'High-load power access, hidden cable raceways, and rear service panel.'
        }
      ]
    }
  },
  methods: {
    goToProducts() {
      this.$router.push('/products')
    },
    goToBuilder() {
      this.$router.push('/custom-builder')
    },
    goToShowroom() {
      this.$router.push('/virtual-showrooms')
    }
  }
}
</script>

<template>
  <div class="home-view">
    <HeroSection />

    <section class="chip-strip shell">
      <article v-for="chip in featureChips" :key="chip.title" class="chip-card">
        <span class="chip-icon"><i :class="chip.icon"></i></span>
        <div>
          <h3>{{ chip.title }}</h3>
          <p>{{ chip.sub }}</p>
        </div>
      </article>
    </section>

    <section class="craft-grid shell">
      <article v-for="point in craftsmanshipPoints" :key="point.title" class="craft-card">
        <span class="craft-icon"><i :class="point.icon"></i></span>
        <h3>{{ point.title }}</h3>
        <p>{{ point.text }}</p>
      </article>
    </section>
    <section class="tech-section shell">
      <div class="tech-copy">
        <p class="kicker">Performance Engineering</p>
        <h2>Technology that lives <span>under the hood</span>.</h2>
        <p class="lead">
          Every desk combines precision woodworking with hidden technical integrations designed for
          creators, gamers, and professionals.
        </p>
        <div class="tech-points">
          <article v-for="item in techHighlights" :key="item.title">
            <i :class="item.icon"></i>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </article>
        </div>
        <Button label="Explore Workstations" @click="goToProducts" />
      </div>
      <div class="tech-media">
        <img
          src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1000&q=80"
          alt="Woodworking and electronics integration"
        />
      </div>
    </section>

    <section class="showroom">
      <div class="shell showroom-content">
        <p class="kicker">Visualize Before You Buy</p>
        <h2>See it in your space.</h2>
        <p>
          Use our virtual showroom to preview desk proportions, materials, and configurations with your
          room dimensions before checkout.
        </p>
        <div class="showroom-media">
         
          <span class="preview-chip">AR-ready room preview</span>
        </div>
        <div class="showroom-actions">
          <Button label="Open Virtual Showroom" icon="pi pi-desktop" @click="goToShowroom" />
          <Button label="Design Consultation" icon="pi pi-calendar" outlined @click="goToBuilder" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  background: linear-gradient(180deg, #f4f1ec 0%, #ede7dc 54%, #f4f1ec 100%);
  color: #2b2119;
}

.shell {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 1rem;
}

.kicker {
  margin: 0;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  color: #9a6534;
  font-weight: 600;
}

h2 {
  margin: 0.5rem 0 0.9rem;
  font-size: clamp(1.7rem, 3.2vw, 2.45rem);
  line-height: 1.14;
}

.chip-strip {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.55rem;
}

.chip-card {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(131, 101, 69, 0.22);
  border-radius: 999px;
  padding: 0.5rem 0.7rem;
}

.chip-icon {
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(196, 134, 76, 0.18);
  color: #9a6534;
}

.chip-card h3 {
  margin: 0;
  font-size: 0.8rem;
}

.chip-card p {
  margin: 0.05rem 0 0;
  font-size: 0.68rem;
  color: #6d5a48;
}

.craft-grid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.craft-card {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(141, 111, 79, 0.2);
  border-radius: 14px;
  padding: 1.1rem 1rem;
  box-shadow: 0 9px 22px rgba(44, 30, 16, 0.07);
}

.craft-icon {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(188, 126, 67, 0.18);
  color: #8c5f35;
}

.craft-card h3 {
  margin: 0.7rem 0 0.4rem;
  font-size: 1rem;
}

.craft-card p {
  margin: 0;
  color: #5f4c3b;
  line-height: 1.5;
  font-size: 0.88rem;
}

.tech-section {
  margin-top: 2.4rem;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 1.2rem;
  align-items: center;
  padding-top: 1.2rem;
}

.tech-copy .lead {
  color: #59493d;
  line-height: 1.6;
  margin: 0 0 1rem;
}

.tech-copy h2 span {
  color: #b47336;
  font-style: italic;
}

.tech-points {
  display: grid;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.tech-points article {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.7rem;
  align-items: start;
}

.tech-points i {
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(188, 126, 67, 0.2);
  color: #a16634;
}

.tech-points h3 {
  margin: 0;
  font-size: 0.95rem;
}

.tech-points p {
  margin: 0.25rem 0 0;
  color: #624f40;
  font-size: 0.87rem;
  line-height: 1.4;
}

.tech-media {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  min-height: 320px;
  box-shadow: 0 16px 34px rgba(35, 24, 15, 0.15);
}

.tech-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-badge {
  position: absolute;
  bottom: 0.85rem;
  left: 0.85rem;
  border-radius: 10px;
  padding: 0.55rem 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  background: rgba(18, 14, 10, 0.68);
  color: #f4e7d8;
}

.media-badge strong {
  font-size: 1.1rem;
}

.media-badge span {
  font-size: 0.7rem;
}

.showroom {
  margin-top: 2.8rem;
  background: #19140f;
  color: #f6ede2;
  padding: 2.6rem 0 2.8rem;
}

.showroom-content {
  text-align: center;
}

.showroom .kicker {
  color: #e3b074;
}

.showroom p {
  margin: 0 auto 1rem;
  max-width: 760px;
  color: #dac8b4;
  line-height: 1.6;
}

.showroom-media {
  max-width: 920px;
  margin: 0.8rem auto 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(242, 229, 211, 0.22);
  position: relative;
}

.showroom-media img {
  width: 100%;
  display: block;
}

.preview-chip {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  font-size: 0.7rem;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  background: rgba(17, 14, 10, 0.62);
  border: 1px solid rgba(238, 224, 206, 0.32);
}

.showroom-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

@media (max-width: 1100px) {
  .chip-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .chip-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .craft-grid {
    grid-template-columns: 1fr;
  }

  .tech-section {
    grid-template-columns: 1fr;
  }

  .showroom {
    margin-top: 2.1rem;
  }
}

@media (max-width: 520px) {
  .chip-strip {
    grid-template-columns: 1fr;
  }
}
</style>
