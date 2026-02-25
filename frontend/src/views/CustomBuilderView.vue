<template>
  <div class="builder-page">
    <!-- Mode Toggle -->
    <div class="mode-toggle">
      <button 
        @click="mode = 'simple'"
        :class="{ active: mode === 'simple' }"
      >
        🟢 Simple Mode
      </button>
      <button 
        @click="mode = 'advanced'"
        :class="{ active: mode === 'advanced' }"
      >
        🔧 Advanced Mode
      </button>
    </div>

    <div class="builder-layout">
      <!-- 3D Canvas -->
      <div class="canvas-container">
        <TresCanvas clear-color="#1a1a1a" shadows>
          <!-- Camera -->
          <TresPerspectiveCamera :position="[5, 3, 8]" :look-at="[0, 1, 0]" />
          
          <!-- Controls -->
          <OrbitControls 
            :enable-damping="true" 
            :auto-rotate="autoRotate"
            :auto-rotate-speed="1.0"
          />
          
          <!-- Lighting -->
          <TresAmbientLight :intensity="0.5" />
          <TresDirectionalLight 
            :position="[5, 5, 5]" 
            :intensity="1" 
            cast-shadow 
          />
          <TresDirectionalLight 
            :position="[-5, 5, -5]" 
            :intensity="0.5" 
          />
          
          <!-- Floor grid -->
          <TresGridHelper :args="[10, 20]" :position="[0, 0, 0]" />
          
          <!-- The 3D Model -->
          <component 
            :is="currentModel" 
            :dimensions="dimensions"
            :material-color="currentMaterialColor"
            :features="enabledFeatures"
          />
        </TresCanvas>
      </div>
      
      <!-- Controls Panel -->
      <div class="controls-panel">
        <h2>🎨 {{ mode === 'simple' ? 'Simple' : 'Advanced' }} Builder</h2>
        
        <!-- Product Type Selection -->
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

        <!-- Material Selection -->
        <div class="control-section">
          <h3>Material</h3>
          <div class="material-grid">
            <div 
              v-for="material in materials" 
              :key="material.name"
              class="material-option"
              :class="{ active: selectedMaterial === material.name }"
              @click="selectedMaterial = material.name"
            >
              <div class="color-swatch" :style="{ background: material.color }"></div>
              <span>{{ material.name }}</span>
            </div>
          </div>
        </div>

        <!-- SIMPLE MODE CONTROLS -->
        <template v-if="mode === 'simple'">
          <!-- Overall Dimensions -->
          <div class="control-section">
            <h3>Overall Size</h3>
            <div class="slider-group">
              <label>Width: {{ dimensions.width }}cm</label>
              <input type="range" v-model.number="dimensions.width" :min="minWidth" :max="maxWidth" step="5">
            </div>
            <div class="slider-group">
              <label>Depth: {{ dimensions.depth }}cm</label>
              <input type="range" v-model.number="dimensions.depth" :min="minDepth" :max="maxDepth" step="5">
            </div>
            <div class="slider-group">
              <label>Height: {{ dimensions.height }}cm</label>
              <input type="range" v-model.number="dimensions.height" :min="minHeight" :max="maxHeight" step="5">
            </div>
          </div>

          <!-- Simple Features (only applicable ones) -->
          <div class="control-section">
            <h3>Features</h3>
            <div v-for="feature in simpleFeatures" :key="feature.name" class="feature-checkbox">
              <label>
                <input type="checkbox" v-model="feature.enabled">
                {{ feature.name }} (+R{{ feature.price }})
              </label>
            </div>
          </div>
        </template>

        <!-- ADVANCED MODE CONTROLS - DYNAMIC BASED ON MODEL -->
        <template v-if="mode === 'advanced'">
          <!-- Main Dimensions (always shown) -->
          <div class="control-section">
            <h3>Main Dimensions</h3>
            <div class="slider-group">
              <label>Width: {{ dimensions.width }}cm</label>
              <input type="range" v-model.number="dimensions.width" :min="minWidth" :max="maxWidth" step="5">
            </div>
            <div class="slider-group">
              <label>Depth: {{ dimensions.depth }}cm</label>
              <input type="range" v-model.number="dimensions.depth" :min="minDepth" :max="maxDepth" step="5">
            </div>
            <div class="slider-group">
              <label>Height: {{ dimensions.height }}cm</label>
              <input type="range" v-model.number="dimensions.height" :min="minHeight" :max="maxHeight" step="5">
            </div>
          </div>

          <!-- Desk/Table Specific Controls -->
          <div class="control-section" v-if="isDeskOrTable">
            <h3>Table Top</h3>
            <div class="slider-group">
              <label>Top Thickness: {{ dimensions.topThickness || 3 }}cm</label>
              <input type="range" v-model.number="dimensions.topThickness" min="1" max="10" step="0.5">
            </div>
            <div class="slider-group">
              <label>Leg Width: {{ dimensions.legWidth || 5 }}cm</label>
              <input type="range" v-model.number="dimensions.legWidth" min="2" max="15" step="0.5">
            </div>
            <div class="slider-group">
              <label>Leg Offset: {{ dimensions.legOffset || 10 }}cm</label>
              <input type="range" v-model.number="dimensions.legOffset" min="5" max="30" step="1">
            </div>
          </div>

          <!-- Chair Specific Controls -->
          <div class="control-section" v-if="selectedType === 'Chair'">
            <h3>Seat Details</h3>
            <div class="slider-group">
              <label>Seat Thickness: {{ dimensions.seatThickness || 5 }}cm</label>
              <input type="range" v-model.number="dimensions.seatThickness" min="2" max="10" step="0.5">
            </div>
            <div class="slider-group">
              <label>Backrest Height: {{ dimensions.backHeight || 30 }}cm</label>
              <input type="range" v-model.number="dimensions.backHeight" min="15" max="50" step="1">
            </div>
            <div class="slider-group">
              <label>Leg Width: {{ dimensions.legWidth || 3 }}cm</label>
              <input type="range" v-model.number="dimensions.legWidth" min="2" max="8" step="0.5">
            </div>
          </div>

          <!-- Statue Specific Controls -->
          <div class="control-section" v-if="selectedType === 'Statue'">
            <h3>Statue Proportions</h3>
            <div class="slider-group">
              <label>Base Height: {{ dimensions.baseHeight || 15 }}cm</label>
              <input type="range" v-model.number="dimensions.baseHeight" min="5" max="30" step="1">
            </div>
            <div class="slider-group">
              <label>Body Height: {{ dimensions.bodyHeight || 60 }}cm</label>
              <input type="range" v-model.number="dimensions.bodyHeight" min="30" max="120" step="5">
            </div>
            <div class="slider-group">
              <label>Head Size: {{ dimensions.headSize || 15 }}cm</label>
              <input type="range" v-model.number="dimensions.headSize" min="5" max="30" step="1">
            </div>
          </div>

          <!-- Position Offsets (for all models) -->
          <div class="control-section">
            <h3>Position Offsets</h3>
            <div class="slider-group">
              <label>X Offset: {{ dimensions.xOffset || 0 }}cm</label>
              <input type="range" v-model.number="dimensions.xOffset" min="-50" max="50" step="5">
            </div>
            <div class="slider-group">
              <label>Y Offset: {{ dimensions.yOffset || 0 }}cm</label>
              <input type="range" v-model.number="dimensions.yOffset" min="-20" max="50" step="5">
            </div>
            <div class="slider-group">
              <label>Z Offset: {{ dimensions.zOffset || 0 }}cm</label>
              <input type="range" v-model.number="dimensions.zOffset" min="-50" max="50" step="5">
            </div>
          </div>

          <!-- All Features -->
          <div class="control-section">
            <h3>Features</h3>
            <div v-for="feature in availableFeatures" :key="feature.name" class="feature-checkbox">
              <label>
                <input type="checkbox" v-model="feature.enabled">
                {{ feature.name }} (+R{{ feature.price }})
              </label>
            </div>
          </div>
        </template>

        <!-- Common Controls -->
        <div class="control-section">
          <h3>View Options</h3>
          <div class="feature-checkbox">
            <label>
              <input type="checkbox" v-model="autoRotate">
              Auto-rotate view
            </label>
          </div>
        </div>

        <!-- Price and Actions -->
        <div class="price-section">
          <div class="price">Total: R {{ totalPrice }}</div>
          
          <div class="action-buttons">
            <button class="email-btn" @click="sendEmail">
              📧 Email Design
            </button>
            <button class="add-to-cart-btn" @click="addToCart">
              🛒 Add to Cart
            </button>
          </div>
          
          <div v-if="emailSent" class="email-confirmation">
            ✓ Design sent successfully!
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'

// Import model components
import DeskModel from '@/components/models/DeskModel.vue'
import ChairModel from '@/components/models/ChairModel.vue'
import BenchModel from '@/components/models/BenchModel.vue'
import TableModel from '@/components/models/TableModel.vue'
import StatueModel from '@/components/models/StatueModel.vue'

const router = useRouter()
const store = useStore()

// Mode selection
const mode = ref('simple')

// Product types
const productTypes = [
  { name: 'Desk', minWidth: 100, maxWidth: 240, minDepth: 60, maxDepth: 120, minHeight: 70, maxHeight: 80, model: markRaw(DeskModel) },
  { name: 'Chair', minWidth: 40, maxWidth: 70, minDepth: 40, maxDepth: 70, minHeight: 40, maxHeight: 50, model: markRaw(ChairModel) },
  { name: 'Bench', minWidth: 120, maxWidth: 200, minDepth: 30, maxDepth: 50, minHeight: 40, maxHeight: 50, model: markRaw(BenchModel) },
  { name: 'Table', minWidth: 80, maxWidth: 200, minDepth: 80, maxDepth: 120, minHeight: 70, maxHeight: 80, model: markRaw(TableModel) },
  { name: 'Statue', minWidth: 30, maxWidth: 100, minDepth: 30, maxDepth: 100, minHeight: 50, maxHeight: 200, model: markRaw(StatueModel) }
]

// Materials
const materials = [
  { name: 'Oak', color: '#8B5A2B', price: 1.0 },
  { name: 'Walnut', color: '#4A2C1A', price: 1.3 },
  { name: 'Maple', color: '#E8D9B5', price: 1.1 },
  { name: 'Cherry', color: '#A15030', price: 1.2 },
  { name: 'Mahogany', color: '#4A2C2A', price: 1.4 },
  { name: 'Pine', color: '#F0D9B5', price: 0.8 }
]

// State
const selectedType = ref('Desk')
const selectedMaterial = ref('Oak')
const autoRotate = ref(true)
const emailSent = ref(false)

// Dimensions with defaults for all models
const dimensions = ref({
  width: 150,
  depth: 75,
  height: 75,
  // Common advanced props
  topThickness: 3,
  legWidth: 5,
  legOffset: 10,
  xOffset: 0,
  yOffset: 0,
  zOffset: 0,
  // Chair specific
  seatThickness: 5,
  backHeight: 30,
  // Statue specific
  baseHeight: 15,
  bodyHeight: 60,
  headSize: 15
})

// Features
const availableFeatures = ref([
  { name: 'Cable Management', price: 500, enabled: false, applicable: ['Desk', 'Table'] },
  { name: 'RGB Lighting', price: 800, enabled: false, applicable: ['Desk', 'Table', 'Bench', 'Statue'] },
  { name: 'Drawer', price: 600, enabled: false, applicable: ['Desk', 'Table'] },
  { name: 'Armrests', price: 400, enabled: false, applicable: ['Chair'] },
  { name: 'Cushion', price: 300, enabled: false, applicable: ['Chair', 'Bench'] },
  { name: 'Base Plinth', price: 700, enabled: false, applicable: ['Statue'] },
  { name: 'Gold Leaf Accents', price: 1200, enabled: false, applicable: ['Statue'] }
])

// Computed properties
const currentModel = computed(() => {
  return productTypes.find(t => t.name === selectedType.value)?.model || DeskModel
})

const minWidth = computed(() => productTypes.find(t => t.name === selectedType.value)?.minWidth || 100)
const maxWidth = computed(() => productTypes.find(t => t.name === selectedType.value)?.maxWidth || 240)
const minDepth = computed(() => productTypes.find(t => t.name === selectedType.value)?.minDepth || 60)
const maxDepth = computed(() => productTypes.find(t => t.name === selectedType.value)?.maxDepth || 120)
const minHeight = computed(() => productTypes.find(t => t.name === selectedType.value)?.minHeight || 70)
const maxHeight = computed(() => productTypes.find(t => t.name === selectedType.value)?.maxHeight || 80)

const isDeskOrTable = computed(() => ['Desk', 'Table'].includes(selectedType.value))

const currentMaterialColor = computed(() => 
  materials.find(m => m.name === selectedMaterial.value)?.color || '#8B5A2B'
)

const enabledFeatures = computed(() => {
  return availableFeatures.value
    .filter(f => f.enabled && f.applicable.includes(selectedType.value))
    .map(f => f.name)
})

// Simple features (only applicable ones)
const simpleFeatures = computed(() => {
  return availableFeatures.value.filter(f => 
    f.applicable.includes(selectedType.value) && 
    ['Cable Management', 'Drawer', 'Armrests', 'Cushion'].includes(f.name)
  )
})

const totalPrice = computed(() => {
  let base = 5000
  const materialMultiplier = materials.find(m => m.name === selectedMaterial.value)?.price || 1
  base *= materialMultiplier
  
  // Base size pricing
  base += (dimensions.value.width - 100) * 20
  base += (dimensions.value.depth - 60) * 15
  base += (dimensions.value.height - 70) * 10
  
  // Advanced mode extras
  if (mode.value === 'advanced') {
    if (dimensions.value.legWidth > 5) base += (dimensions.value.legWidth - 5) * 50
    if (dimensions.value.topThickness > 3) base += (dimensions.value.topThickness - 3) * 100
    if (dimensions.value.xOffset !== 0 || dimensions.value.yOffset !== 0 || dimensions.value.zOffset !== 0) {
      base += 200
    }
  }
  
  // Add feature costs
  availableFeatures.value.forEach(f => {
    if (f.enabled && f.applicable.includes(selectedType.value)) base += f.price
  })
  
  return Math.round(base)
})

// Reset dimensions when changing type
watch(selectedType, (newType) => {
  const type = productTypes.find(t => t.name === newType)
  if (type) {
    // Set base dimensions
    dimensions.value.width = Math.round((type.minWidth + type.maxWidth) / 2)
    dimensions.value.depth = Math.round((type.minDepth + type.maxDepth) / 2)
    dimensions.value.height = Math.round((type.minHeight + type.maxHeight) / 2)
    
    // Reset advanced props based on type
    dimensions.value.topThickness = 3
    dimensions.value.legWidth = newType === 'Chair' ? 3 : 5
    dimensions.value.legOffset = 10
    dimensions.value.xOffset = 0
    dimensions.value.yOffset = 0
    dimensions.value.zOffset = 0
    
    // Type-specific defaults
    if (newType === 'Chair') {
      dimensions.value.seatThickness = 5
      dimensions.value.backHeight = 30
    } else if (newType === 'Statue') {
      dimensions.value.baseHeight = 15
      dimensions.value.bodyHeight = 60
      dimensions.value.headSize = 15
    }
  }
}, { immediate: true })

// Actions
const addToCart = () => {
  const customProduct = {
    product_id: Date.now(),
    product_name: `Custom ${selectedType.value} (${selectedMaterial.value})`,
    product_price: totalPrice.value,
    quantity: 1,
    cart_quantity: 1,
    customizations: {
      mode: mode.value,
      type: selectedType.value,
      material: selectedMaterial.value,
      dimensions: { ...dimensions.value },
      features: enabledFeatures.value
    }
  }
  
  store.dispatch('addToCart', customProduct)
  router.push('/cart')
}

const sendEmail = () => {
  const subject = `Custom ${selectedType.value} Design (${mode.value} mode)`
  const body = `
Design Details (${mode.value} mode):
- Product: ${selectedType.value}
- Material: ${selectedMaterial.value}
- Dimensions: ${dimensions.value.width}cm x ${dimensions.value.depth}cm x ${dimensions.value.height}cm
${isDeskOrTable.value ? `- Top Thickness: ${dimensions.value.topThickness}cm\n- Leg Width: ${dimensions.value.legWidth}cm` : ''}
${selectedType.value === 'Chair' ? `- Seat Thickness: ${dimensions.value.seatThickness}cm\n- Back Height: ${dimensions.value.backHeight}cm` : ''}
${selectedType.value === 'Statue' ? `- Base Height: ${dimensions.value.baseHeight}cm\n- Body Height: ${dimensions.value.bodyHeight}cm\n- Head Size: ${dimensions.value.headSize}cm` : ''}
- Features: ${enabledFeatures.value.join(', ') || 'None'}
- Estimated Price: R${totalPrice.value}

---
Created with WoodCraft Workshop Builder
  `.trim()

  window.location.href = `mailto:dominicpeck03@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  
  emailSent.value = true
  setTimeout(() => emailSent.value = false, 3000)
}
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

/* Mode Toggle */
.mode-toggle {
  position: absolute;
  top: 90px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  gap: 10px;
  background: #2a2a2a;
  padding: 5px;
  border-radius: 40px;
  border: 2px solid #8b4513;
}

.mode-toggle button {
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  background: #444;
  color: white;
}

.mode-toggle button.active {
  background: #8b4513;
  color: white;
  box-shadow: 0 0 15px rgba(139,69,19,0.5);
}

.mode-toggle button:first-child.active {
  background: #2a6f97;
}

.controls-panel {
  width: 400px;
  background: #2a2a2a;
  padding: 20px;
  overflow-y: auto;
  border-left: 2px solid #8b4513;
  box-shadow: -5px 0 15px rgba(0,0,0,0.5);
}

.controls-panel h2 {
  margin: 0 0 20px 0;
  color: #ffd700;
  text-align: center;
  font-size: 24px;
}

.control-section {
  margin-bottom: 25px;
  padding: 15px;
  background: #333;
  border-radius: 10px;
  border: 1px solid #444;
}

.control-section h3 {
  margin: 0 0 15px 0;
  color: #ffd700;
  font-size: 18px;
  border-bottom: 2px solid #8b4513;
  padding-bottom: 8px;
}

.button-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.button-group button {
  padding: 10px;
  background: #444;
  color: white;
  border: 2px solid #555;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
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

.material-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.material-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #444;
  border: 2px solid #555;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.material-option:hover {
  background: #555;
  transform: translateY(-2px);
}

.material-option.active {
  border-color: #ffd700;
  background: #8b4513;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid #fff;
}

.slider-group {
  margin-bottom: 15px;
}

.slider-group label {
  display: block;
  margin-bottom: 5px;
  color: #ddd;
  font-weight: bold;
}

.slider-group input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #444;
  outline: none;
  -webkit-appearance: none;
}

.slider-group input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #ffd700;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #8b4513;
}

.feature-checkbox {
  margin: 10px 0;
}

.feature-checkbox label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ddd;
  cursor: pointer;
  font-size: 14px;
}

.feature-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #8b4513;
}

.price-section {
  margin-top: 20px;
  padding: 20px;
  background: #333;
  border-radius: 10px;
  text-align: center;
  border: 2px solid #8b4513;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 15px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.add-to-cart-btn {
  width: 100%;
  padding: 15px;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.add-to-cart-btn:hover {
  background: #a0522d;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139,69,19,0.4);
}

.email-btn {
  width: 100%;
  padding: 15px;
  background: #2a6f97;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.email-btn:hover {
  background: #1e4e6f;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(42,111,151,0.4);
}

.email-confirmation {
  margin-top: 10px;
  padding: 10px;
  background: #2a6f97;
  border-radius: 6px;
  color: white;
  animation: fadeInOut 3s ease;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

/* Scrollbar */
.controls-panel::-webkit-scrollbar {
  width: 8px;
}

.controls-panel::-webkit-scrollbar-track {
  background: #333;
}

.controls-panel::-webkit-scrollbar-thumb {
  background: #8b4513;
  border-radius: 4px;
}

.controls-panel::-webkit-scrollbar-thumb:hover {
  background: #a0522d;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .mode-toggle {
    top: 80px;
    flex-direction: column;
    gap: 5px;
  }
  
  .controls-panel {
    width: 300px;
  }
  
  .button-group {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>