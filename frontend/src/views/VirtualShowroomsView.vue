<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const MARKER_SIZE_METERS = 0.05
const DEFAULT_NAV_OFFSET = 72

const stageRef = ref(null)
const sceneVisible = ref(false)
const markerVisible = ref(false)
const statusText = ref('Loading AR...')
const initError = ref('')

let isActive = true
let aframeLoaded = false
let cleanupFunctions = []

// Load A-Frame script
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
    cleanupFunctions.push(() => {
      if (script.parentNode) script.parentNode.removeChild(script)
    })
  })
}

// Clean up A-Frame completely
function cleanupAframe() {
  // Remove all A-Frame scenes
  document.querySelectorAll('a-scene').forEach(scene => {
    if (scene.parentNode) scene.parentNode.removeChild(scene)
  })
  
  // Remove AR.js elements
  document.querySelectorAll('.arjs-loader, .arjs-debugUIContainer, .a-enter-vr').forEach(el => {
    if (el.parentNode) el.parentNode.removeChild(el)
  })
  
  // Stop all video streams
  document.querySelectorAll('video').forEach(video => {
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop())
      video.srcObject = null
    }
  })
  
  // Clean up window globals
  delete window.AFRAME
  delete window.ARjs
  delete window.THREEx
  delete window.ARController
  
  // Reset Three.js if it was modified
  if (window.THREE && window.THREE.REVISION) {
    // Keep original THREE
  }
}

onMounted(async () => {
  try {
    statusText.value = 'Loading AR...'
    
    // Load A-Frame
    await loadScript('https://aframe.io/releases/1.4.0/aframe.min.js')
    
    // Load AR.js
    await loadScript('https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.7/aframe/build/aframe-ar.js')
    
    if (!isActive) return
    
    aframeLoaded = true
    sceneVisible.value = true
    statusText.value = 'Point camera at Hiro marker'
    
    // Set up marker detection after scene loads
    setTimeout(() => {
      const marker = document.querySelector('a-marker')
      if (marker) {
        marker.addEventListener('markerFound', () => {
          markerVisible.value = true
          statusText.value = 'Marker detected!'
        })
        marker.addEventListener('markerLost', () => {
          markerVisible.value = false
          statusText.value = 'Marker lost'
        })
      }
    }, 2000)
    
  } catch (error) {
    console.error('AR init failed:', error)
    initError.value = 'Failed to load AR. Please refresh.'
  }
})

onBeforeRouteLeave(() => {
  isActive = false
  cleanupAframe()
  cleanupFunctions.forEach(fn => fn())
})

onUnmounted(() => {
  isActive = false
  cleanupAframe()
  cleanupFunctions.forEach(fn => fn())
})
</script>

<template>
  <div class="ar-page">
    <div ref="stageRef" class="ar-stage">
      <!-- A-Frame Scene -->
      <a-scene
        v-if="sceneVisible"
        embedded
        vr-mode-ui="enabled: false"
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono; trackingMethod: best;"
        renderer="alpha: true; antialias: true;"
        device-orientation-permission-ui="enabled: false"
      >
        <a-marker preset="hiro" :size="MARKER_SIZE_METERS" emitevents="true">
          <!-- Simple desk model -->
          <a-box position="0 0.5 0" width="1.5" height="0.1" depth="0.8" color="#8B4513"></a-box>
          <a-box position="-0.6 0.25 -0.3" width="0.1" height="0.5" depth="0.1" color="#333"></a-box>
          <a-box position="0.6 0.25 -0.3" width="0.1" height="0.5" depth="0.1" color="#333"></a-box>
          <a-box position="-0.6 0.25 0.3" width="0.1" height="0.5" depth="0.1" color="#333"></a-box>
          <a-box position="0.6 0.25 0.3" width="0.1" height="0.5" depth="0.1" color="#333"></a-box>
        </a-marker>
        
        <a-entity camera></a-entity>
      </a-scene>

      <div v-else class="ar-loading">
        Loading AR...
      </div>

      <!-- UI Overlay -->
      <div class="ar-header">
        <h1>Virtual Showroom</h1>
        <p>Scan the Hiro marker to see the desk</p>
      </div>

      <div class="ar-status">
        <span :class="['dot', markerVisible ? 'visible' : 'hidden']"></span>
        <span>{{ statusText }}</span>
      </div>

      <p v-if="initError" class="ar-error">{{ initError }}</p>
    </div>
  </div>
</template>

<style scoped>
.ar-page {
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  overflow: hidden;
}

.ar-stage {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0a0a0a;
}

.ar-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.ar-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: #0a0a0a;
  z-index: 10;
}

.ar-header {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 20;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  pointer-events: none;
}

.ar-header h1 {
  margin: 0;
  font-size: 1.2rem;
}

.ar-header p {
  margin: 4px 0 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.ar-status {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 40px;
  font-size: 0.9rem;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.visible {
  background: #4caf50;
  box-shadow: 0 0 10px #4caf50;
}

.dot.hidden {
  background: #f44336;
}

.ar-error {
  position: absolute;
  top: 80px;
  left: 20px;
  right: 20px;
  padding: 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  z-index: 20;
  text-align: center;
}
</style>