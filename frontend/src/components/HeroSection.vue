<script>
export default {
  name: "HeroSection",
  methods: {
    goToGamingDeals() {
      this.$router.push({ name: "gamingSpecials" });
    },
    goToWorkDeals() {
      this.$router.push({ name: "workDeskSpecials" });
    },
  },
};
</script>

<template>
  <section class="hero-wrap">
    <div class="hero-section">
      <button
        type="button"
        class="hero-pane pane-left"
        aria-label="Best Buys for Gaming PC Desks"
        @click="goToGamingDeals"
      >
        <div class="pane-content mobile-pane-content">
          <span class="pane-badge">Pro Gaming Series</span>
          <h2 class="pane-title">Forge Your Command Center</h2>
          <p class="pane-copy">Engineered for endurance. Integrated power for zero lag.</p>
          <span class="pane-cta">
            Shop Gaming
            <i class="pi pi-arrow-right"></i>
          </span>
        </div>
        <div class="desktop-caption desktop-caption-left">
          <span class="desktop-badge">Pro Gaming Series</span>
          <p>Engineered for endurance. Integrated power for zero lag.</p>
        </div>
      </button>

      <button
        type="button"
        class="hero-pane pane-right"
        aria-label="Work Desk Specials"
        @click="goToWorkDeals"
      >
        <div class="pane-content mobile-pane-content">
          <span class="pane-badge">The Heritage Collection</span>
          <h2 class="pane-title">One of a Kind</h2>
          <p class="pane-copy">Timeless craftsmanship. 100% recycled premium hardwoods.</p>
          <span class="pane-cta">
            Design Your Desk
            <i class="pi pi-arrow-right"></i>
          </span>
        </div>
        <div class="desktop-caption desktop-caption-right">
          <span class="desktop-badge">The Heritage Collection</span>
          <p>Timeless craftsmanship. 100% recycled premium hardwoods.</p>
        </div>
      </button>

      <div class="hero-overlay"></div>
    </div>
  </section>
</template>

<style scoped>
.hero-wrap {
  padding: 0;
}

.hero-section {
  --split-gap: 6px;
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  background: #1f1812;
}

.hero-pane {
  position: absolute;
  inset: 0 auto 0 0;
  width: calc(50% - (var(--split-gap) / 2));
  border: 0;
  margin: 0;
  padding: 0;
  cursor: pointer;
  color: #f9f2e7;
  text-align: left;
  display: flex;
  align-items: flex-end;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  background-size: cover;
  background-position: center;
  transform: scale(1);
  will-change: transform, filter;
  transition:
    transform 0.5s ease,
    filter 0.4s ease;
}

.hero-pane::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.58));
  opacity: 1;
  transition: opacity 0.35s ease;
}

.pane-left {
  left: 0;
  background-image: url("https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1640&q=80");
}

.pane-right {
  left: calc(50% + (var(--split-gap) / 2));
  background-image: url("https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1640&q=80");
}

.hero-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(20, 16, 12, 0.36) 0%,
    rgba(20, 16, 12, 0.08) 48%,
    rgba(20, 16, 12, 0.32) 100%
  );
}

.mobile-pane-content {
  display: none;
}

.desktop-caption {
  position: absolute;
  z-index: 3;
  bottom: 1.6rem;
  max-width: 310px;
}

.desktop-caption-left {
  left: 1.7rem;
  text-align: left;
}

.desktop-caption-right {
  right: 1.7rem;
  text-align: right;
}

.desktop-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  font-size: 0.7rem;
  font-weight: 700;
  background: #d08a40;
  color: #fff;
}

.desktop-caption p {
  margin: 0.55rem 0 0;
  font-size: 0.95rem;
  line-height: 1.35;
  color: rgba(242, 236, 228, 0.96);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.pane-right .desktop-caption p {
  color: rgba(245, 241, 236, 0.92);
}

.pane-content {
  position: relative;
  z-index: 2;
  max-width: 470px;
  padding: 1.6rem 1.65rem 1.8rem;
}

.pane-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
  background: #ce8537;
  color: #fff;
}

.pane-title {
  margin: 0.85rem 0 0.55rem;
  font-size: clamp(1.7rem, 3.4vw, 3.1rem);
  line-height: 1.05;
  font-weight: 700;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
}

.pane-copy {
  margin: 0;
  max-width: 520px;
  font-size: clamp(1rem, 1.35vw, 1.45rem);
  line-height: 1.35;
  color: #ece8e3;
}

.pane-cta {
  margin-top: 1.15rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 12px;
  padding: 0.58rem 0.9rem;
  font-size: 0.88rem;
  font-weight: 700;
  border: 1px solid rgba(242, 230, 215, 0.58);
  background: rgba(25, 19, 14, 0.42);
  color: #f8f3ea;
}

@media (hover: hover) and (pointer: fine) {
  .hero-pane:hover {
    transform: scale(1.012);
    filter: saturate(1.1) brightness(1.04);
  }

  .hero-pane:hover::before {
    opacity: 0.84;
  }
}

@media (hover: none), (pointer: coarse) {
  .hero-pane:active {
    transform: scale(1.008);
    filter: saturate(1.08) brightness(1.03);
  }

  .hero-pane:active::before {
    opacity: 0.82;
  }
}

@media (max-width: 960px) {
  .hero-wrap {
    padding: 0.8rem 0.8rem 1rem;
    background: #f4f1ec;
  }

  .hero-section {
    min-height: auto;
    overflow: visible;
    background: transparent;
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
  }

  .hero-pane {
    position: relative;
    inset: auto;
    width: 100%;
    min-height: 290px;
    border-radius: 22px;
    overflow: hidden;
    align-items: flex-end;
    transform: none;
  }

  .mobile-pane-content {
    display: block;
  }

  .desktop-caption {
    display: none;
  }

  .pane-right {
    left: auto;
    min-height: 255px;
  }

  .pane-right::before {
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.64));
  }

  .pane-right .pane-content {
    color: #1e1b18;
  }

  .pane-right .pane-title {
    text-shadow: none;
  }

  .pane-right .pane-copy {
    color: #45403a;
  }

  .pane-right .pane-cta {
    border-color: rgba(206, 133, 55, 0.72);
    color: #c67c32;
    background: rgba(255, 255, 255, 0.85);
  }

  .hero-overlay {
    display: none;
  }

  .pane-content {
    max-width: 95%;
    padding: 1.3rem 1.3rem 1.35rem;
  }

  .pane-title {
    font-size: clamp(2.05rem, 8.5vw, 2.85rem);
  }

  .pane-copy {
    font-size: clamp(1rem, 4vw, 1.5rem);
    line-height: 1.35;
  }

  .pane-cta {
    margin-top: 0.95rem;
    font-size: 1rem;
    padding: 0.66rem 1rem;
  }
}
</style>
