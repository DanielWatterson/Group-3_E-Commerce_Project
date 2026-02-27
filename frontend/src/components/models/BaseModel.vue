<template>
  <TresGroup :position="position" :scale="scale">
    <slot />
    
    <!-- Simple selection indicator -->
    <TresMesh v-if="selected" :position="[0, 0, 0]" :scale="[1.1, 1.1, 1.1]">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial color="#ffd700" :transparent="true" :opacity="0.3" />
    </TresMesh>
  </TresGroup>
</template>

<script setup>
defineProps({
  position: { type: Array, default: () => [0, 0, 0] },
  scale: { type: [Number, Array], default: 1 },
  selected: { type: Boolean, default: false },
  type: { type: String, default: 'box' },
  size: { type: Array, default: () => [1, 1, 1] },
  showGrid: { type: Boolean, default: false }
})
</script>
