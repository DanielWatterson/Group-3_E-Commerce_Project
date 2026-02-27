<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  dimensions: { type: Object, required: true },
  materialColor: { type: String, required: true },
  features: { type: Array, default: () => [] }
})

// Create a ref for the root group
const groupRef = ref(null)

// Dimensions with defaults
const topWidth = computed(() => ((props.dimensions?.topWidth || props.dimensions?.width || 150) / 100))
const topDepth = computed(() => ((props.dimensions?.topDepth || props.dimensions?.depth || 80) / 100))
const topHeight = computed(() => ((props.dimensions?.height || 75) / 100))
const topThickness = computed(() => ((props.dimensions?.topThickness || 3) / 100))

const legWidth = computed(() => ((props.dimensions?.legWidth || 5) / 100))
const legHeight = computed(() => ((props.dimensions?.legHeight || props.dimensions?.height || 75) / 100))
const legOffset = computed(() => ((props.dimensions?.legOffset || 10) / 100))

const xOffset = computed(() => ((props.dimensions?.xOffset || 0) / 100))
const yOffset = computed(() => ((props.dimensions?.yOffset || 0) / 100))
const zOffset = computed(() => ((props.dimensions?.zOffset || 0) / 100))

// Advanced material properties for realistic rendering
const woodMaterial = computed(() => ({
  color: props.materialColor,
  roughness: 0.35,
  metalness: 0.02,
  envMapIntensity: 0.8
}))

const metalMaterial = {
  color: '#2a2a2a',
  roughness: 0.25,
  metalness: 0.9,
  envMapIntensity: 1.2
}

const accentMetal = {
  color: '#404040',
  roughness: 0.15,
  metalness: 0.95,
  envMapIntensity: 1.5
}

// Generate wood grain pattern using noise
const woodGrainLines = computed(() => {
  const lines = []
  const count = Math.floor(topWidth.value * 15)
  for (let i = 0; i < count; i++) {
    const x = -topWidth.value/2 + (i / count) * topWidth.value
    const offset = (Math.sin(i * 0.3) * 0.005)
    lines.push({
      position: [x + offset, topHeight.value + topThickness.value/2 + 0.0005, 0],
      width: 0.001 + Math.random() * 0.001,
      opacity: 0.15 + Math.random() * 0.1
    })
  }
  return lines
})

// Leg positions
const legPositions = computed(() => [
  [-topWidth.value/2 + legOffset.value, legHeight.value/2, -topDepth.value/2 + legOffset.value],
  [topWidth.value/2 - legOffset.value, legHeight.value/2, -topDepth.value/2 + legOffset.value],
  [-topWidth.value/2 + legOffset.value, legHeight.value/2, topDepth.value/2 - legOffset.value],
  [topWidth.value/2 - legOffset.value, legHeight.value/2, topDepth.value/2 - legOffset.value]
])

// Expose the group ref so the parent can access the Three.js object
defineExpose({ group: groupRef })
</script>

<template>
  <TresGroup ref="groupRef" :position="[xOffset, yOffset, zOffset]">
    <!-- DESK TOP ASSEMBLY -->
    
    <!-- Main desktop surface with rounded corners -->
    <TresMesh :position="[0, topHeight, 0]" cast-shadow receive-shadow>
      <TresBoxGeometry :args="[topWidth, topThickness, topDepth, 8, 1, 8]" />
      <TresMeshStandardMaterial 
        :color="woodMaterial.color"
        :roughness="woodMaterial.roughness"
        :metalness="woodMaterial.metalness"
        :envMapIntensity="woodMaterial.envMapIntensity"
      />
    </TresMesh>

    <!-- Wood grain detail lines -->
    <TresMesh 
      v-for="(line, i) in woodGrainLines" 
      :key="'grain-' + i"
      :position="line.position"
    >
      <TresBoxGeometry :args="[line.width, 0.001, topDepth * 0.95]" />
      <TresMeshStandardMaterial 
        :color="woodMaterial.color"
        :transparent="true"
        :opacity="line.opacity"
        :roughness="0.8"
      />
    </TresMesh>

    <!-- Desktop edge trim (dark accent) -->
    <TresMesh :position="[0, topHeight + topThickness/2 + 0.002, topDepth/2]" cast-shadow>
      <TresBoxGeometry :args="[topWidth, 0.004, 0.008]" />
      <TresMeshStandardMaterial 
        color="#1a1a1a"
        :roughness="0.3"
        :metalness="0.6"
      />
    </TresMesh>
    <TresMesh :position="[0, topHeight + topThickness/2 + 0.002, -topDepth/2]" cast-shadow>
      <TresBoxGeometry :args="[topWidth, 0.004, 0.008]" />
      <TresMeshStandardMaterial 
        color="#1a1a1a"
        :roughness="0.3"
        :metalness="0.6"
      />
    </TresMesh>
    <TresMesh :position="[topWidth/2, topHeight + topThickness/2 + 0.002, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.008, 0.004, topDepth]" />
      <TresMeshStandardMaterial 
        color="#1a1a1a"
        :roughness="0.3"
        :metalness="0.6"
      />
    </TresMesh>
    <TresMesh :position="[-topWidth/2, topHeight + topThickness/2 + 0.002, 0]" cast-shadow>
      <TresBoxGeometry :args="[0.008, 0.004, topDepth]" />
      <TresMeshStandardMaterial 
        color="#1a1a1a"
        :roughness="0.3"
        :metalness="0.6"
      />
    </TresMesh>

    <!-- Underside support frame -->
    <TresMesh :position="[0, topHeight - topThickness/2 - 0.025, topDepth/2 - 0.03]" cast-shadow>
      <TresBoxGeometry :args="[topWidth - legOffset * 2 + 0.1, 0.05, 0.06]" />
      <TresMeshStandardMaterial 
        :color="woodMaterial.color"
        :roughness="0.5"
        :metalness="0.05"
      />
    </TresMesh>
    <TresMesh :position="[0, topHeight - topThickness/2 - 0.025, -topDepth/2 + 0.03]" cast-shadow>
      <TresBoxGeometry :args="[topWidth - legOffset * 2 + 0.1, 0.05, 0.06]" />
      <TresMeshStandardMaterial 
        :color="woodMaterial.color"
        :roughness="0.5"
        :metalness="0.05"
      />
    </TresMesh>

    <!-- ADVANCED LEG SYSTEM -->
    
    <!-- Main leg posts (tapered, high-detail) -->
    <TresMesh 
      v-for="(pos, index) in legPositions" 
      :key="'leg-main-' + index" 
      :position="pos" 
      cast-shadow 
      receive-shadow
    >
      <TresCylinderGeometry :args="[legWidth * 0.6, legWidth * 0.9, legHeight, 16]" />
      <TresMeshStandardMaterial 
        :color="metalMaterial.color"
        :roughness="metalMaterial.roughness"
        :metalness="metalMaterial.metalness"
        :envMapIntensity="metalMaterial.envMapIntensity"
      />
    </TresMesh>

    <!-- Leg top mounting plates (premium detail) -->
    <TresMesh 
      v-for="(pos, index) in legPositions" 
      :key="'mount-top-' + index" 
      :position="[pos[0], topHeight - topThickness/2 - 0.015, pos[2]]"
      cast-shadow
    >
      <TresCylinderGeometry :args="[legWidth * 1.3, legWidth * 1.3, 0.03, 32]" />
      <TresMeshStandardMaterial 
        :color="accentMetal.color"
        :roughness="accentMetal.roughness"
        :metalness="accentMetal.metalness"
        :envMapIntensity="accentMetal.envMapIntensity"
      />
    </TresMesh>

    <!-- Mounting plate screws (visual detail) -->
    <template v-for="(pos, legIndex) in legPositions" :key="'screws-' + legIndex">
      <TresMesh 
        v-for="i in 4" 
        :key="'screw-' + i"
        :position="[
          pos[0] + Math.cos(i * Math.PI / 2) * legWidth * 0.8,
          topHeight - topThickness/2 - 0.012,
          pos[2] + Math.sin(i * Math.PI / 2) * legWidth * 0.8
        ]"
        cast-shadow
      >
        <TresCylinderGeometry :args="[0.006, 0.006, 0.006, 12]" />
        <TresMeshStandardMaterial 
          color="#1a1a1a"
          :roughness="0.2"
          :metalness="0.9"
        />
      </TresMesh>
    </template>

    <!-- Leg base feet with anti-slip pads -->
    <TresMesh 
      v-for="(pos, index) in legPositions" 
      :key="'foot-' + index" 
      :position="[pos[0], 0.02, pos[2]]"
      cast-shadow
    >
      <TresCylinderGeometry :args="[legWidth * 1.4, legWidth * 1.2, 0.04, 32]" />
      <TresMeshStandardMaterial 
        :color="metalMaterial.color"
        :roughness="0.3"
        :metalness="0.85"
      />
    </TresMesh>

    <!-- Rubber foot pads -->
    <TresMesh 
      v-for="(pos, index) in legPositions" 
      :key="'pad-' + index" 
      :position="[pos[0], 0.008, pos[2]]"
      cast-shadow
    >
      <TresCylinderGeometry :args="[legWidth * 1.1, legWidth * 1.1, 0.015, 24]" />
      <TresMeshStandardMaterial 
        color="#0a0a0a"
        :roughness="0.95"
        :metalness="0.0"
      />
    </TresMesh>

    <!-- Cross bracing (premium structural support) -->
    <TresMesh :position="[0, legHeight * 0.3, 0]" :rotation="[0, 0, Math.PI/2]" cast-shadow>
      <TresCylinderGeometry :args="[0.018, 0.018, topWidth - legOffset * 2 - 0.15, 16]" />
      <TresMeshStandardMaterial 
        :color="metalMaterial.color"
        :roughness="0.3"
        :metalness="0.85"
      />
    </TresMesh>
    <TresMesh :position="[0, legHeight * 0.3, 0]" :rotation="[Math.PI/2, 0, 0]" cast-shadow>
      <TresCylinderGeometry :args="[0.018, 0.018, topDepth - legOffset * 2 - 0.1, 16]" />
      <TresMeshStandardMaterial 
        :color="metalMaterial.color"
        :roughness="0.3"
        :metalness="0.85"
      />
    </TresMesh>

    <!-- Brace connection nodes -->
    <TresMesh :position="[0, legHeight * 0.3, 0]" cast-shadow>
      <TresSphereGeometry :args="[0.025, 16, 16]" />
      <TresMeshStandardMaterial 
        :color="accentMetal.color"
        :roughness="0.2"
        :metalness="0.95"
      />
    </TresMesh>

    <!-- PREMIUM CABLE MANAGEMENT SYSTEM -->
    <template v-if="features.includes('Cable Management')">
      <!-- Main cable tray body -->
      <TresMesh :position="[0, topHeight - topThickness/2 - 0.08, topDepth/2 - 0.25]" cast-shadow receive-shadow>
        <TresBoxGeometry :args="[topWidth - 0.4, 0.12, 0.25]" />
        <TresMeshStandardMaterial 
          color="#1a1a1a"
          :roughness="0.4"
          :metalness="0.5"
        />
      </TresMesh>

      <!-- Cable tray mesh pattern (perforated look) -->
      <TresMesh 
        v-for="i in Math.floor((topWidth - 0.4) / 0.08)" 
        :key="'tray-hole-' + i"
        :position="[
          -topWidth/2 + 0.25 + (i * 0.08),
          topHeight - topThickness/2 - 0.08,
          topDepth/2 - 0.25
        ]"
      >
        <TresBoxGeometry :args="[0.03, 0.13, 0.15]" />
        <TresMeshStandardMaterial 
          color="#0a0a0a"
          :roughness="0.8"
          :metalness="0.1"
        />
      </TresMesh>

      <!-- Side mounting brackets -->
      <TresMesh :position="[topWidth/2 - 0.22, topHeight - topThickness/2 - 0.08, topDepth/2 - 0.25]" cast-shadow>
        <TresBoxGeometry :args="[0.02, 0.14, 0.27]" />
        <TresMeshStandardMaterial 
          :color="metalMaterial.color"
          :roughness="0.35"
          :metalness="0.8"
        />
      </TresMesh>
      <TresMesh :position="[-topWidth/2 + 0.22, topHeight - topThickness/2 - 0.08, topDepth/2 - 0.25]" cast-shadow>
        <TresBoxGeometry :args="[0.02, 0.14, 0.27]" />
        <TresMeshStandardMaterial 
          :color="metalMaterial.color"
          :roughness="0.35"
          :metalness="0.8"
        />
      </TresMesh>

      <!-- Cable entry grommets -->
      <TresMesh 
        v-for="i in 3" 
        :key="'grommet-' + i" 
        :position="[(i-2) * 0.25, topHeight + topThickness/2 - 0.005, topDepth/2 - 0.15]"
        cast-shadow
      >
        <TresCylinderGeometry :args="[0.03, 0.035, topThickness + 0.01, 24]" />
        <TresMeshStandardMaterial 
          color="#0a0a0a"
          :roughness="0.7"
          :metalness="0.3"
        />
      </TresMesh>

      <!-- Grommet rings (premium detail) -->
      <TresMesh 
        v-for="i in 3" 
        :key="'grommet-ring-' + i" 
        :position="[(i-2) * 0.25, topHeight + topThickness/2 + 0.002, topDepth/2 - 0.15]"
      >
        <TresTorusGeometry :args="[0.035, 0.003, 16, 32]" />
        <TresMeshStandardMaterial 
          :color="accentMetal.color"
          :roughness="0.2"
          :metalness="0.95"
        />
      </TresMesh>
    </template>

    <!-- PREMIUM DRAWER SYSTEM -->
    <template v-if="features.includes('Drawer')">
      <!-- Drawer box -->
      <TresMesh :position="[topWidth/3, legHeight * 0.55, 0.02]" cast-shadow receive-shadow>
        <TresBoxGeometry :args="[0.50, 0.20, topDepth - 0.15]" />
        <TresMeshStandardMaterial 
          :color="woodMaterial.color"
          :roughness="0.5"
          :metalness="0.05"
        />
      </TresMesh>

      <!-- Drawer front panel (premium finish) -->
      <TresMesh :position="[topWidth/3, legHeight * 0.55, topDepth/2 - 0.076]" cast-shadow>
        <TresBoxGeometry :args="[0.49, 0.19, 0.02]" />
        <TresMeshStandardMaterial 
          :color="woodMaterial.color"
          :roughness="0.3"
          :metalness="0.1"
        />
      </TresMesh>

      <!-- Drawer handle bar (brushed metal) -->
      <TresMesh :position="[topWidth/3, legHeight * 0.55, topDepth/2 - 0.055]" cast-shadow>
        <TresBoxGeometry :args="[0.30, 0.025, 0.025]" />
        <TresMeshStandardMaterial 
          :color="accentMetal.color"
          :roughness="0.15"
          :metalness="0.95"
          :envMapIntensity="1.5"
        />
      </TresMesh>

      <!-- Handle end caps -->
      <TresMesh :position="[topWidth/3 - 0.145, legHeight * 0.55, topDepth/2 - 0.055]" cast-shadow>
        <TresCylinderGeometry :args="[0.015, 0.015, 0.03, 16]" :rotation="[Math.PI/2, 0, 0]" />
        <TresMeshStandardMaterial 
          :color="accentMetal.color"
          :roughness="0.15"
          :metalness="0.95"
        />
      </TresMesh>
      <TresMesh :position="[topWidth/3 + 0.145, legHeight * 0.55, topDepth/2 - 0.055]" cast-shadow>
        <TresCylinderGeometry :args="[0.015, 0.015, 0.03, 16]" :rotation="[Math.PI/2, 0, 0]" />
        <TresMeshStandardMaterial 
          :color="accentMetal.color"
          :roughness="0.15"
          :metalness="0.95"
        />
      </TresMesh>

      <!-- Drawer slide rails -->
      <TresMesh :position="[topWidth/3 + 0.24, legHeight * 0.55, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.015, 0.015, topDepth - 0.2]" />
        <TresMeshStandardMaterial 
          :color="metalMaterial.color"
          :roughness="0.2"
          :metalness="0.9"
        />
      </TresMesh>
      <TresMesh :position="[topWidth/3 - 0.24, legHeight * 0.55, 0]" cast-shadow>
        <TresBoxGeometry :args="[0.015, 0.015, topDepth - 0.2]" />
        <TresMeshStandardMaterial 
          :color="metalMaterial.color"
          :roughness="0.2"
          :metalness="0.9"
        />
      </TresMesh>
    </template>

    <!-- ADVANCED RGB LIGHTING SYSTEM -->
    <template v-if="features.includes('RGB Lighting')">
      <!-- Main LED strip housing (gaming aesthetic) -->
      <TresMesh :position="[0, topHeight - topThickness/2 - 0.012, -topDepth/2 + 0.025]" cast-shadow>
        <TresBoxGeometry :args="[topWidth - 0.25, 0.018, 0.035]" />
        <TresMeshStandardMaterial 
          color="#0a0a0a"
          :roughness="0.2"
          :metalness="0.7"
        />
      </TresMesh>

      <!-- LED diffuser (glowing effect) -->
      <TresMesh :position="[0, topHeight - topThickness/2 - 0.012, -topDepth/2 + 0.025]">
        <TresBoxGeometry :args="[topWidth - 0.27, 0.012, 0.025]" />
        <TresMeshStandardMaterial 
          color="#00ffaa"
          :emissive="0x00ffaa"
          :emissiveIntensity="2.5"
          :transparent="true"
          :opacity="0.95"
          :roughness="0.1"
        />
      </TresMesh>

      <!-- Individual LED segments (realistic detail) -->
      <TresMesh 
        v-for="i in Math.floor((topWidth - 0.3) / 0.05)" 
        :key="'led-segment-' + i"
        :position="[(-topWidth/2 + 0.2) + (i * 0.05), topHeight - topThickness/2 - 0.012, -topDepth/2 + 0.025]"
      >
        <TresBoxGeometry :args="[0.012, 0.008, 0.020]" />
        <TresMeshStandardMaterial 
          color="#00ffaa"
          :emissive="0x00ffaa"
          :emissiveIntensity="3.5"
        />
      </TresMesh>

      <!-- Side LED strips (accent lighting) -->
      <TresMesh :position="[topWidth/2 - 0.015, topHeight + topThickness/2 - 0.005, 0]">
        <TresBoxGeometry :args="[0.02, 0.012, topDepth - 0.3]" />
        <TresMeshStandardMaterial 
          color="#ff00ff"
          :emissive="0xff00ff"
          :emissiveIntensity="2.2"
          :transparent="true"
          :opacity="0.9"
        />
      </TresMesh>
      <TresMesh :position="[-topWidth/2 + 0.015, topHeight + topThickness/2 - 0.005, 0]">
        <TresBoxGeometry :args="[0.02, 0.012, topDepth - 0.3]" />
        <TresMeshStandardMaterial 
          color="#ff00ff"
          :emissive="0xff00ff"
          :emissiveIntensity="2.2"
          :transparent="true"
          :opacity="0.9"
        />
      </TresMesh>

      <!-- RGB controller box (detail) -->
      <TresMesh :position="[topWidth/2 - 0.15, topHeight - topThickness/2 - 0.02, -topDepth/2 + 0.08]" cast-shadow>
        <TresBoxGeometry :args="[0.08, 0.025, 0.06]" />
        <TresMeshStandardMaterial 
          color="#1a1a1a"
          :roughness="0.3"
          :metalness="0.6"
        />
      </TresMesh>

      <!-- Controller LED indicator -->
      <TresMesh :position="[topWidth/2 - 0.15, topHeight - topThickness/2 - 0.008, -topDepth/2 + 0.105]">
        <TresSphereGeometry :args="[0.005, 12, 12]" />
        <TresMeshStandardMaterial 
          color="#00ff00"
          :emissive="0x00ff00"
          :emissiveIntensity="4.0"
        />
      </TresMesh>
    </template>

    <!-- PREMIUM MONITOR STAND -->
    <template v-if="features.includes('Monitor Stand')">
      <!-- Stand platform -->
      <TresMesh :position="[0, topHeight + topThickness/2 + 0.05, -topDepth/4]" cast-shadow receive-shadow>
        <TresBoxGeometry :args="[0.55, 0.10, 0.28]" />
        <TresMeshStandardMaterial 
          :color="woodMaterial.color"
          :roughness="0.4"
          :metalness="0.08"
        />
      </TresMesh>

      <!-- Stand top surface accent -->
      <TresMesh :position="[0, topHeight + topThickness/2 + 0.098, -topDepth/4]" cast-shadow>
        <TresBoxGeometry :args="[0.54, 0.004, 0.27]" />
        <TresMeshStandardMaterial 
          color="#1a1a1a"
          :roughness="0.25"
          :metalness="0.7"
        />
      </TresMesh>

      <!-- Metal support legs -->
      <TresMesh :position="[-0.22, topHeight + topThickness/2 + 0.025, -topDepth/4]" cast-shadow>
        <TresBoxGeometry :args="[0.04, 0.05, 0.26]" />
        <TresMeshStandardMaterial 
          :color="metalMaterial.color"
          :roughness="0.3"
          :metalness="0.85"
        />
      </TresMesh>
      <TresMesh :position="[0.22, topHeight + topThickness/2 + 0.025, -topDepth/4]" cast-shadow>
        <TresBoxGeometry :args="[0.04, 0.05, 0.26]" />
        <TresMeshStandardMaterial 
          :color="metalMaterial.color"
          :roughness="0.3"
          :metalness="0.85"
        />
      </TresMesh>

      <!-- Cable pass-through -->
      <TresMesh :position="[0, topHeight + topThickness/2 + 0.05, -topDepth/4 - 0.13]" cast-shadow>
        <TresCylinderGeometry :args="[0.025, 0.025, 0.11, 24]" />
        <TresMeshStandardMaterial 
          color="#0a0a0a"
          :roughness="0.7"
          :metalness="0.3"
        />
      </TresMesh>
    </template>

    <!-- KEYBOARD TRAY SYSTEM -->
    <template v-if="features.includes('Keyboard Tray')">
      <!-- Tray surface -->
      <TresMesh :position="[0, topHeight - 0.18, 0.08]" cast-shadow receive-shadow>
        <TresBoxGeometry :args="[0.65, 0.018, 0.32]" />
        <TresMeshStandardMaterial 
          :color="woodMaterial.color"
          :roughness="0.45"
          :metalness="0.05"
        />
      </TresMesh>

      <!-- Tray edge trim -->
      <TresMesh :position="[0, topHeight - 0.172, 0.08]" cast-shadow>
        <TresBoxGeometry :args="[0.64, 0.005, 0.31]" />
        <TresMeshStandardMaterial 
          color="#1a1a1a"
          :roughness="0.3"
          :metalness="0.6"
        />
      </TresMesh>

      <!-- Slide rails (premium ball-bearing style) -->
      <TresMesh :position="[-0.31, topHeight - 0.1, 0.08]" cast-shadow>
        <TresBoxGeometry :args="[0.025, 0.02, 0.30]" />
        <TresMeshStandardMaterial 
          :color="metalMaterial.color"
          :roughness="0.15"
          :metalness="0.95"
        />
      </TresMesh>
      <TresMesh :position="[0.31, topHeight - 0.1, 0.08]" cast-shadow>
        <TresBoxGeometry :args="[0.025, 0.02, 0.30]" />
        <TresMeshStandardMaterial 
          :color="metalMaterial.color"
          :roughness="0.15"
          :metalness="0.95"
        />
      </TresMesh>

      <!-- Rail mounting brackets -->
      <template v-for="side in [-1, 1]" :key="'rail-' + side">
        <TresMesh 
          v-for="i in 3" 
          :key="'bracket-' + i"
          :position="[side * 0.31, topHeight - 0.08, -0.15 + (i * 0.15)]"
          cast-shadow
        >
          <TresBoxGeometry :args="[0.03, 0.025, 0.03]" />
          <TresMeshStandardMaterial 
            :color="accentMetal.color"
            :roughness="0.25"
            :metalness="0.9"
          />
        </TresMesh>
      </template>
    </template>
  </TresGroup>
</template>