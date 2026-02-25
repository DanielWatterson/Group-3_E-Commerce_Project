<template>
  <TresGroup :position="[xOffset, yOffset, zOffset]">
    <!-- Table Top -->
    <TresMesh :position="[0, topHeight, 0]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="[topWidth, topThickness, topDepth]" />
      <TresMeshStandardMaterial :color="materialColor" :roughness="0.6" />
    </TresMesh>
    
    <!-- Legs -->
    <TresMesh 
      v-for="(pos, index) in legPositions" 
      :key="'leg-' + index" 
      :position="pos" 
      cast-shadow 
      receive-shadow
    >
      <TresBoxGeometry :args="[legWidth, legHeight, legWidth]" />
      <TresMeshStandardMaterial :color="legColor" />
    </TresMesh>

    <!-- Features -->
    <TresMesh v-if="features.includes('Cable Management')" :position="[0, topHeight - 0.02, topDepth/2 - 0.15]" cast-shadow>
      <TresBoxGeometry :args="[topWidth - 0.2, 0.02, 0.15]" />
      <TresMeshStandardMaterial color="#666666" />
    </TresMesh>
    
    <TresMesh v-if="features.includes('Drawer')" :position="[topWidth/4, 0.15, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.4, 0.15, 0.3]" />
      <TresMeshStandardMaterial :color="materialColor" />
    </TresMesh>

    <TresMesh v-if="features.includes('RGB Lighting')" :position="[0, topHeight + 0.01, 0]" cast-shadow>
      <TresBoxGeometry :args="[topWidth - 0.1, 0.005, 0.01]" />
      <TresMeshStandardMaterial :color="0x00ff00" :emissive="0x00ff00" />
    </TresMesh>
  </TresGroup>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  dimensions: { type: Object, required: true },
  materialColor: { type: String, required: true },
  features: { type: Array, default: () => [] }
})

// Dimensions with defaults
const topWidth = computed(() => ((props.dimensions?.topWidth || props.dimensions?.width || 150) / 100))
const topDepth = computed(() => ((props.dimensions?.topDepth || props.dimensions?.depth || 80) / 100))
const topHeight = computed(() => ((props.dimensions?.height || 75) / 100))
const topThickness = computed(() => ((props.dimensions?.topThickness || 3) / 100))

const legWidth = computed(() => ((props.dimensions?.legWidth || 5) / 100))
const legHeight = computed(() => ((props.dimensions?.legHeight || props.dimensions?.height || 75) / 100))
const legOffset = computed(() => ((props.dimensions?.legOffset || 10) / 100))
const legColor = '#333333'

const xOffset = computed(() => ((props.dimensions?.xOffset || 0) / 100))
const yOffset = computed(() => ((props.dimensions?.yOffset || 0) / 100))
const zOffset = computed(() => ((props.dimensions?.zOffset || 0) / 100))

// Leg positions
const legPositions = computed(() => {
  return [
    [-topWidth.value/2 + legOffset.value, legHeight.value/2, -topDepth.value/2 + legOffset.value],
    [topWidth.value/2 - legOffset.value, legHeight.value/2, -topDepth.value/2 + legOffset.value],
    [-topWidth.value/2 + legOffset.value, legHeight.value/2, topDepth.value/2 - legOffset.value],
    [topWidth.value/2 - legOffset.value, legHeight.value/2, topDepth.value/2 - legOffset.value]
  ]
})
</script>