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
      <TresMeshStandardMaterial color="#333333" />
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
const topWidth = computed(() => ((props.dimensions?.width || 180) / 100))
const topDepth = computed(() => ((props.dimensions?.depth || 100) / 100))
const topHeight = computed(() => ((props.dimensions?.height || 75) / 100))
const topThickness = computed(() => ((props.dimensions?.topThickness || 5) / 100))

const legWidth = computed(() => ((props.dimensions?.legWidth || 8) / 100))
const legHeight = computed(() => ((props.dimensions?.height || 75) / 100))
const legOffset = computed(() => ((props.dimensions?.legOffset || 15) / 100))

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