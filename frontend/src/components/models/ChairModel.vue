<template>
  <TresGroup :position="[xOffset, yOffset, zOffset]">
    <!-- Seat -->
    <TresMesh :position="[0, seatHeight, 0]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="[seatWidth, seatThickness, seatDepth]" />
      <TresMeshStandardMaterial :color="materialColor" :roughness="0.6" />
    </TresMesh>
    
    <!-- Backrest -->
    <TresMesh :position="[0, backHeight, -seatDepth/2]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="[backWidth, backHeight, backDepth]" />
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

    <!-- Armrests -->
    <template v-if="features.includes('Armrests')">
      <TresMesh :position="[-seatWidth/2 - 0.03, armHeight, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.03, armHeight, armDepth]" />
        <TresMeshStandardMaterial :color="materialColor" />
      </TresMesh>
      <TresMesh :position="[seatWidth/2 + 0.03, armHeight, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.03, armHeight, armDepth]" />
        <TresMeshStandardMaterial :color="materialColor" />
      </TresMesh>
    </template>

    <!-- Cushion -->
    <TresMesh v-if="features.includes('Cushion')" :position="[0, seatHeight + 0.02, 0]" cast-shadow>
      <TresBoxGeometry :args="[seatWidth - 0.02, 0.02, seatDepth - 0.02]" />
      <TresMeshStandardMaterial color="#8B4513" :roughness="0.8" />
    </TresMesh>

    <!-- RGB Lighting -->
    <TresMesh v-if="features.includes('RGB Lighting')" :position="[0, backHeight * 2, -seatDepth/2]" cast-shadow>
      <TresBoxGeometry :args="[backWidth - 0.1, 0.005, 0.01]" />
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
const seatWidth = computed(() => ((props.dimensions?.width || 55) / 100))
const seatDepth = computed(() => ((props.dimensions?.depth || 55) / 100))
const seatHeight = computed(() => ((props.dimensions?.height || 45) * 0.4 / 100))
const seatThickness = 0.05

const backWidth = computed(() => ((props.dimensions?.width || 55) / 100))
const backDepth = 0.05
const backHeight = computed(() => ((props.dimensions?.height || 45) * 0.6 / 100))

const legWidth = 0.03
const legHeight = computed(() => ((props.dimensions?.height || 45) * 0.4 / 100))

const armHeight = computed(() => ((props.dimensions?.height || 45) * 0.3 / 100))
const armDepth = computed(() => ((props.dimensions?.depth || 55) * 0.3 / 100))

const xOffset = computed(() => ((props.dimensions?.xOffset || 0) / 100))
const yOffset = computed(() => ((props.dimensions?.yOffset || 0) / 100))
const zOffset = computed(() => ((props.dimensions?.zOffset || 0) / 100))

// Leg positions
const legPositions = computed(() => {
  return [
    [-seatWidth.value/2 + 0.03, legHeight.value/2, -seatDepth.value/2 + 0.03],
    [seatWidth.value/2 - 0.03, legHeight.value/2, -seatDepth.value/2 + 0.03],
    [-seatWidth.value/2 + 0.03, legHeight.value/2, seatDepth.value/2 - 0.03],
    [seatWidth.value/2 - 0.03, legHeight.value/2, seatDepth.value/2 - 0.03]
  ]
})
</script>
