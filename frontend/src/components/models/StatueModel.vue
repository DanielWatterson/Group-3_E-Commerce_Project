<template>
  <TresGroup :position="[xOffset, yOffset, zOffset]">
    <!-- Base -->
    <TresMesh :position="[0, baseHeight/200, 0]" cast-shadow receive-shadow>
      <TresCylinderGeometry :args="[baseRadius, baseRadius, baseHeight/100, 16]" />
      <TresMeshStandardMaterial :color="materialColor" :roughness="0.5" />
    </TresMesh>
    
    <!-- Body -->
    <TresMesh :position="[0, baseHeight/100 + bodyHeight/200, 0]" cast-shadow receive-shadow>
      <TresCylinderGeometry :args="[bodyRadius, bodyRadius, bodyHeight/100, 8]" />
      <TresMeshStandardMaterial :color="materialColor" :roughness="0.6" />
    </TresMesh>
    
    <!-- Head -->
    <TresMesh :position="[0, baseHeight/100 + bodyHeight/100 + headRadius/100, 0]" cast-shadow receive-shadow>
      <TresSphereGeometry :args="[headRadius/100, 16]" />
      <TresMeshStandardMaterial :color="materialColor" :roughness="0.4" />
    </TresMesh>

    <!-- Features -->
    <TresMesh v-if="features.includes('Base Plinth')" :position="[0, -0.02, 0]" cast-shadow>
      <TresBoxGeometry :args="[baseRadius * 2.2, 0.03, baseRadius * 2.2]" />
      <TresMeshStandardMaterial :color="materialColor" />
    </TresMesh>

    <TresMesh v-if="features.includes('Gold Leaf Accents')" :position="[0, baseHeight/100 + bodyHeight/100 + headRadius/50, 0]" cast-shadow>
      <TresTorusGeometry :args="[headRadius/100 + 0.02, 0.01, 16, 32]" />
      <TresMeshStandardMaterial color="#FFD700" :emissive="'#FFD700'" :emissiveIntensity="0.2" />
    </TresMesh>

    <TresMesh v-if="features.includes('RGB Lighting')" :position="[0, baseHeight/100 + bodyHeight/100 + headRadius/50 + 0.05, 0]" cast-shadow>
      <TresSphereGeometry :args="[0.02, 8]" />
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

// Dimensions with defaults - using your slider values
const baseHeight = computed(() => props.dimensions?.baseHeight || 15)
const bodyHeight = computed(() => props.dimensions?.bodyHeight || 60)
const headSize = computed(() => props.dimensions?.headSize || 15)
const width = computed(() => props.dimensions?.width || 50)

// Calculate radii based on width
const baseRadius = computed(() => width.value / 200)
const bodyRadius = computed(() => width.value / 250)
const headRadius = computed(() => headSize.value / 100)

// Position offsets
const xOffset = computed(() => (props.dimensions?.xOffset || 0) / 100)
const yOffset = computed(() => (props.dimensions?.yOffset || 0) / 100)
const zOffset = computed(() => (props.dimensions?.zOffset || 0) / 100)
</script>