<template>
  <div class="builder-page">
    <div class="builder-layout">
      <!-- 3D Canvas -->
      <div class="canvas-container">
        <TresCanvas clear-color="#1a1a1a" shadows>
          <!-- Camera -->
          <TresPerspectiveCamera :position="[5, 5, 5]" :look-at="[0, 0, 0]" />
          
          <!-- Controls -->
          <OrbitControls :enable-damping="true" />
          
          <!-- Basic cube to test rendering -->
          <TresMesh :position="[0, 0, 0]" cast-shadow receive-shadow>
            <TresBoxGeometry :args="[1, 1, 1]" />
            <TresMeshStandardMaterial color="red" />
          </TresMesh>
          
          <!-- Floor grid -->
          <TresGridHelper :args="[10, 10]" />
          
          <!-- Lights -->
          <TresAmbientLight :intensity="0.5" />
          <TresDirectionalLight 
            :position="[2, 5, 3]" 
            :intensity="1" 
            cast-shadow 
          />
        </TresCanvas>
      </div>
      
      <!-- Controls Panel -->
      <div class="controls-panel">
        <h2>🎨 Test 3D View</h2>
        <p>If you see a red cube, 3D is working!</p>
        <p>Current selection: {{ selectedType }}</p>
        
        <div class="control-section">
          <h3>Product Type</h3>
          <div class="button-group">
            <button 
              v-for="type in productTypes" 
              :key="type.name"
              :class="{ active: selectedType === type.name }"
              @click="selectedType = type.name"
            >
              {{ type.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'

const productTypes = ['Desk', 'Chair', 'Bench', 'Table']
const selectedType = ref('Desk')
</script>

<style scoped>
.builder-page {
  height: calc(100vh - 72px);
  background: #1a1a1a;
  color: white;
  overflow: hidden;
}

.builder-layout {
  display: flex;
  height: 100%;
}

.canvas-container {
  flex: 1;
  height: 100%;
  background: #222;
}

.controls-panel {
  width: 380px;
  background: #2a2a2a;
  padding: 20px;
  overflow-y: auto;
  border-left: 2px solid #8b4513;
}

.controls-panel h2 {
  margin: 0 0 20px 0;
  color: #ffd700;
  text-align: center;
}

.control-section {
  margin-bottom: 25px;
  padding: 15px;
  background: #333;
  border-radius: 10px;
}

.control-section h3 {
  margin: 0 0 15px 0;
  color: #ffd700;
  border-bottom: 2px solid #8b4513;
  padding-bottom: 8px;
}

.button-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.button-group button {
  padding: 12px;
  background: #444;
  color: white;
  border: 2px solid #555;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: bold;
}

.button-group button:hover {
  background: #555;
  transform: translateY(-2px);
}

.button-group button.active {
  background: #8b4513;
  border-color: #ffd700;
  box-shadow: 0 0 10px rgba(255,215,0,0.3);
}
</style>