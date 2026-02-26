<template>
  <TresGroup :position="[xOffset, yOffset, zOffset]">
    <!-- Seat -->
    <TresMesh :position="[0, seatHeight, 0]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="[seatWidth, seatThickness, seatDepth]" />
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
      <TresMeshStandardMaterial color="#333333" />
    </TresMesh>

    <!-- Cushion -->
    <TresMesh v-if="features.includes('Cushion')" :position="[0, seatHeight + 0.03, 0]" cast-shadow>
      <TresBoxGeometry :args="[seatWidth - 0.02, 0.03, seatDepth - 0.02]" />
      <TresMeshStandardMaterial color="#8B4513" :roughness="0.8" />
    </TresMesh>

    <!-- RGB Lighting -->
    <TresMesh v-if="features.includes('RGB Lighting')" :position="[0, seatHeight + 0.04, 0]" cast-shadow>
      <TresBoxGeometry :args="[seatWidth - 0.1, 0.005, 0.01]" />
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
const seatWidth = computed(() => ((props.dimensions?.width || 150) / 100))
const seatDepth = computed(() => ((props.dimensions?.depth || 45) / 100))
const seatHeight = computed(() => ((props.dimensions?.height || 45) * 0.5 / 100))
const seatThickness = 0.08

const legWidth = computed(() => ((props.dimensions?.legWidth || 8) / 100))
const legHeight = computed(() => ((props.dimensions?.height || 45) * 0.5 / 100))
const legOffset = computed(() => ((props.dimensions?.legOffset || 15) / 100))

const xOffset = computed(() => ((props.dimensions?.xOffset || 0) / 100))
const yOffset = computed(() => ((props.dimensions?.yOffset || 0) / 100))
const zOffset = computed(() => ((props.dimensions?.zOffset || 0) / 100))

// Leg positions
const legPositions = computed(() => {
  return [
    [-seatWidth.value/2 + legOffset.value, legHeight.value/2, -seatDepth.value/2 + legOffset.value],
    [seatWidth.value/2 - legOffset.value, legHeight.value/2, -seatDepth.value/2 + legOffset.value],
    [-seatWidth.value/2 + legOffset.value, legHeight.value/2, seatDepth.value/2 - legOffset.value],
    [seatWidth.value/2 - legOffset.value, legHeight.value/2, seatDepth.value/2 - legOffset.value]
  ]
})
</script>