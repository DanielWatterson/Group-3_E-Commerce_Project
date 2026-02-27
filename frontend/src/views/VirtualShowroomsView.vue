<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { TresCanvas } from '@tresjs/core'
import DeskModel from '@/components/models/DeskModel.vue'

const AFRAME_CDN = 'https://aframe.io/releases/1.4.0/aframe.min.js'
const ARJS_CDN = 'https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.7/aframe/build/aframe-ar.js'
// Calibrated for a commonly printed Hiro marker width (~5 cm).
// Increase/decrease MARKER_SIZE_METERS to match your physical print width exactly.
const MARKER_SIZE_METERS = 0.05
const DESK_SCALE = 1
const DESK_Y_OFFSET = 0
const DESK_ROTATION_X = -Math.PI / 2
const DESK_ROTATION_Y = 0
const DEFAULT_NAV_OFFSET = 72
const AR_OWNER_ATTR = 'data-ar-owner'
const AR_OWNER_NAME = 'virtual-showrooms'

const sceneRef = ref(null)
const markerRef = ref(null)
const stageRef = ref(null)
const deskRef = ref(null)
const sceneVisible = ref(false)

const markerVisible = ref(false)
const statusText = ref('Loading AR...')
const initError = ref('')

const deskDimensions = Object.freeze({
  width: 150,
  depth: 80,
  height: 75,
  topThickness: 3,
  legWidth: 5,
  legOffset: 10,
  xOffset: 0,
  yOffset: 0,
  zOffset: 0
})

const deskFeatures = Object.freeze([
  'Cable Management',
  'Drawer',
  'Monitor Stand'
])

let isActive = true
let isTornDown = false
let resizeDebounceTimer = null
let injectedDeskGroup = null
let markerFoundHandler = null
let markerLostHandler = null
let previousBodyOverflow = null
let restoreCanvasGetContext = null
let restoreArControllerPatch = null

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

function installCanvasReadbackHint() {
  if (restoreCanvasGetContext || typeof window === 'undefined') return

  const proto = window.HTMLCanvasElement?.prototype
  if (!proto || typeof proto.getContext !== 'function') return

  const originalGetContext = proto.getContext
  proto.getContext = function patchedGetContext(type, attrs) {
    if (type === '2d') {
      const options =
        attrs && typeof attrs === 'object'
          ? { ...attrs, willReadFrequently: true }
          : { willReadFrequently: true }
      return originalGetContext.call(this, type, options)
    }
    return originalGetContext.call(this, type, attrs)
  }

  restoreCanvasGetContext = () => {
    proto.getContext = originalGetContext
    restoreCanvasGetContext = null
  }
}

function uninstallCanvasReadbackHint() {
  if (restoreCanvasGetContext) {
    restoreCanvasGetContext()
  }
}

function buildSafeMarkerInfo() {
  return {
    id: -1,
    idPatt: -1,
    idMatrix: -1,
    dir: 0,
    dirPatt: 0,
    dirMatrix: 0,
    pos: [0, 0],
    vertex: [[0, 0], [0, 0], [0, 0], [0, 0]]
  }
}

function installArControllerSafetyPatch() {
  if (restoreArControllerPatch) return

  const ARController = window.ARController
  if (!ARController?.prototype) return

  const proto = ARController.prototype
  const originalGetMarker = proto.getMarker
  const originalProcess = proto.process
  if (typeof originalGetMarker !== 'function') return

  proto.getMarker = function patchedGetMarker(markerIndex) {
    const markerInfo = originalGetMarker.call(this, markerIndex)
    if (markerInfo && typeof markerInfo.idPatt !== 'undefined') {
      return markerInfo
    }
    return buildSafeMarkerInfo()
  }

  if (typeof originalProcess === 'function') {
    proto.process = function patchedProcess(image) {
      try {
        return originalProcess.call(this, image)
      } catch (error) {
        const message = String(error?.message || error)
        if (message.includes('idPatt')) {
          return
        }
        throw error
      }
    }
  }

  restoreArControllerPatch = () => {
    proto.getMarker = originalGetMarker
    if (typeof originalProcess === 'function') {
      proto.process = originalProcess
    }
    restoreArControllerPatch = null
  }
}

function uninstallArControllerSafetyPatch() {
  if (restoreArControllerPatch) {
    restoreArControllerPatch()
  }
}

function setViewportHeightVar() {
  const layoutViewportHeight = window.innerHeight || 0
  const visualViewportHeight = window.visualViewport?.height || 0
  const viewportHeight = Math.max(layoutViewportHeight, visualViewportHeight)
  const safeHeight = Math.max(320, Math.round(viewportHeight))
  document.documentElement.style.setProperty('--ar-vh', `${safeHeight}px`)
}

function setNavOffsetVar() {
  const nav = document.querySelector('.top-nav')
  const navHeight = Math.max(
    DEFAULT_NAV_OFFSET,
    Math.round(nav?.getBoundingClientRect().height || DEFAULT_NAV_OFFSET)
  )
  document.documentElement.style.setProperty('--ar-nav-offset', `${navHeight}px`)
}

function applyStyles(element, styles) {
  if (!element) return
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value, 'important')
  })
}

function markArOwned(element) {
  if (!element) return
  element.setAttribute(AR_OWNER_ATTR, AR_OWNER_NAME)
}

function tagArUiElements() {
  document
    .querySelectorAll('.arjs-loader, .arjs-debugUIContainer, .a-enter-vr, .a-orientation-modal')
    .forEach((element) => markArOwned(element))
}

function syncArLayout() {
  if (!isActive) return

  const stage = stageRef.value
  const scene = sceneRef.value
  if (!stage || !scene || !sceneVisible.value) return

  setViewportHeightVar()
  setNavOffsetVar()

  const stageRect = stage.getBoundingClientRect()
  const stageWidth = Math.max(1, Math.round(stageRect.width))
  const stageHeight = Math.max(1, Math.round(stageRect.height))
  const pixelRatio = Math.min(2, window.devicePixelRatio || 1)

  applyStyles(scene, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    margin: '0',
    background: 'transparent',
    'z-index': '2'
  })

  const video =
    stage.querySelector('#arjs-video, video#arjs-video, video.arjs-video') ||
    document.querySelector('#arjs-video, video#arjs-video, video.arjs-video')

  const canvas =
    scene.canvas ||
    scene.querySelector('canvas.a-canvas') ||
    document.querySelector('canvas.a-canvas')

  if (video) {
    markArOwned(video)

    if (video.parentElement !== stage) {
      stage.appendChild(video)
    }

    video.setAttribute('playsinline', 'true')
    video.setAttribute('webkit-playsinline', 'true')

    applyStyles(video, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      top: '0',
      left: '0',
      margin: '0',
      transform: 'none',
      'object-fit': 'contain',
      background: '#000000',
      'pointer-events': 'none',
      'z-index': '1'
    })
  }

  if (canvas) {
    markArOwned(canvas)

    if (canvas.parentElement !== scene) {
      scene.appendChild(canvas)
    }

    const renderWidth = Math.max(1, Math.round(stageWidth * pixelRatio))
    const renderHeight = Math.max(1, Math.round(stageHeight * pixelRatio))

    if (canvas.width !== renderWidth) canvas.width = renderWidth
    if (canvas.height !== renderHeight) canvas.height = renderHeight

    applyStyles(canvas, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      top: '0',
      left: '0',
      margin: '0',
      transform: 'none',
      background: 'transparent',
      'pointer-events': 'none',
      'z-index': '2'
    })
  }

  if (scene.renderer?.setPixelRatio) {
    scene.renderer.setPixelRatio(pixelRatio)
  }

  if (scene.renderer?.setSize) {
    scene.renderer.setSize(stageWidth, stageHeight, false)
  }

  scene.resize?.()
  tagArUiElements()
}

function onViewportChange() {
  window.clearTimeout(resizeDebounceTimer)
  resizeDebounceTimer = window.setTimeout(() => {
    syncArLayout()
  }, 80)
}

function loadScriptOnce(src, isReady) {
  return new Promise((resolve, reject) => {
    if (isReady()) {
      resolve()
      return
    }

    const selector = `script[data-ar-src="${src}"]`
    const existing = document.querySelector(selector)

    const handleLoad = () => resolve()
    const handleError = () => reject(new Error(`Failed to load script: ${src}`))

    if (existing) {
      existing.addEventListener('load', handleLoad, { once: true })
      existing.addEventListener('error', handleError, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.dataset.arSrc = src
    script.addEventListener('load', handleLoad, { once: true })
    script.addEventListener('error', handleError, { once: true })
    document.head.appendChild(script)
  })
}

function registerDeskSpinComponent() {
  const AFRAME = window.AFRAME
  if (!AFRAME || AFRAME.components['desk-spin']) return

  AFRAME.registerComponent('desk-spin', {
    schema: {
      speed: { default: 0.00012 }
    },
    tick(_time, delta = 16) {
      const desk = this.el.object3D.getObjectByName('desk-ar-root')
      if (!desk || !this.el.object3D.visible) return

      if (typeof desk.userData.baseRotationY !== 'number') {
        desk.userData.baseRotationY = desk.rotation.y
      }

      desk.userData.spinAngle = (desk.userData.spinAngle || 0) + delta * this.data.speed
      desk.rotation.y = desk.userData.baseRotationY + desk.userData.spinAngle
    }
  })
}

function resolveDeskGroup() {
  const exposed = deskRef.value?.group
  const tresNode = exposed?.value ?? exposed
  if (!tresNode) return null

  const candidates = [
    tresNode,
    tresNode?.object3D,
    tresNode?.value,
    tresNode?.value?.object3D,
    tresNode?.instance,
    tresNode?.instance?.object3D,
    tresNode?.instance?.value,
    tresNode?.instance?.value?.object3D,
    tresNode?.el,
    tresNode?.el?.object3D,
    tresNode?.$el?.object3D
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    if (candidate.object3D?.isObject3D) return candidate.object3D
    if (candidate.isObject3D) return candidate
  }

  const visited = new WeakSet()
  const queue = [{ node: tresNode, depth: 0 }]
  const maxDepth = 5

  while (queue.length) {
    const { node, depth } = queue.shift()
    if (!node || typeof node !== 'object') continue
    if (visited.has(node)) continue
    visited.add(node)

    if (node.object3D?.isObject3D) return node.object3D
    if (node.isObject3D) return node
    if (depth >= maxDepth) continue

    const priorityKeys = ['value', 'object3D', 'instance', 'el', '$el', 'proxy', 'group', 'children']
    priorityKeys.forEach((key) => {
      const next = node[key]
      if (!next) return
      if (Array.isArray(next)) {
        next.slice(0, 12).forEach((item) => queue.push({ node: item, depth: depth + 1 }))
      } else {
        queue.push({ node: next, depth: depth + 1 })
      }
    })

    const values = Object.values(node).slice(0, 20)
    values.forEach((value) => {
      if (value && typeof value === 'object') {
        queue.push({ node: value, depth: depth + 1 })
      }
    })
  }

  return null
}

async function waitForDeskGroup(timeoutMs = 7000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    if (!isActive) return null
    const group = resolveDeskGroup()
    if (group && group.children?.length) {
      return group
    }
    await wait(100)
  }

  return null
}

function createFallbackDeskGroup() {
  const THREE = window.AFRAME?.THREE || window.THREE
  if (!THREE) return null

  const group = new THREE.Group()
  group.name = 'desk-ar-root'

  const topMaterial = new THREE.MeshStandardMaterial({
    color: '#d9b98b',
    roughness: 0.45,
    metalness: 0.08
  })
  const legMaterial = new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    roughness: 0.3,
    metalness: 0.82
  })

  const desktop = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.8), topMaterial)
  desktop.position.set(0, 0.75, 0)
  group.add(desktop)

  const legGeometry = new THREE.BoxGeometry(0.07, 0.72, 0.07)
  const legPositions = [
    [-0.67, 0.36, -0.32],
    [0.67, 0.36, -0.32],
    [-0.67, 0.36, 0.32],
    [0.67, 0.36, 0.32]
  ]

  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.set(x, y, z)
    group.add(leg)
  })

  group.scale.setScalar(DESK_SCALE)
  group.position.set(0, DESK_Y_OFFSET, 0)
  group.rotation.set(DESK_ROTATION_X, DESK_ROTATION_Y, 0, 'XYZ')
  group.userData.baseRotationY = group.rotation.y
  group.userData.spinAngle = 0

  group.traverse((node) => {
    if (!node || typeof node !== 'object') return
    node.frustumCulled = false
    if (node.isMesh) {
      node.castShadow = true
      node.receiveShadow = true
    }
  })

  return group
}

function isAFrameThreeObject3D(object3D) {
  const AFRAME_THREE = window.AFRAME?.THREE
  return Boolean(AFRAME_THREE && object3D?.isObject3D && object3D instanceof AFRAME_THREE.Object3D)
}

function cloneTypedArray(arrayLike) {
  if (!arrayLike?.constructor) return null
  const cloned = new arrayLike.constructor(arrayLike.length)
  cloned.set(arrayLike)
  return cloned
}

function convertMaterialForAFrame(sourceMaterial, AFRAME_THREE) {
  if (!sourceMaterial) {
    return new AFRAME_THREE.MeshStandardMaterial({ color: '#d9b98b', roughness: 0.45, metalness: 0.08 })
  }

  const params = {}

  if (sourceMaterial.color?.isColor) params.color = sourceMaterial.color.getHex()
  if (sourceMaterial.emissive?.isColor) params.emissive = sourceMaterial.emissive.getHex()

  const numericProps = [
    'roughness',
    'metalness',
    'opacity',
    'emissiveIntensity',
    'envMapIntensity',
    'wireframe',
    'transparent',
    'depthWrite',
    'depthTest'
  ]

  numericProps.forEach((prop) => {
    if (sourceMaterial[prop] !== undefined) {
      params[prop] = sourceMaterial[prop]
    }
  })

  if (sourceMaterial.side !== undefined) params.side = sourceMaterial.side

  if (sourceMaterial.isMeshBasicMaterial) return new AFRAME_THREE.MeshBasicMaterial(params)
  if (sourceMaterial.isMeshPhongMaterial) return new AFRAME_THREE.MeshPhongMaterial(params)
  if (sourceMaterial.isMeshLambertMaterial) return new AFRAME_THREE.MeshLambertMaterial(params)
  return new AFRAME_THREE.MeshStandardMaterial(params)
}

function convertGeometryForAFrame(sourceGeometry, AFRAME_THREE) {
  if (!sourceGeometry?.attributes) return null

  const geometry = new AFRAME_THREE.BufferGeometry()

  if (sourceGeometry.index?.array) {
    const indexArray = cloneTypedArray(sourceGeometry.index.array)
    if (indexArray) {
      geometry.setIndex(new AFRAME_THREE.BufferAttribute(indexArray, sourceGeometry.index.itemSize || 1))
    }
  }

  Object.entries(sourceGeometry.attributes).forEach(([name, sourceAttribute]) => {
    if (!sourceAttribute?.array) return
    const attrArray = cloneTypedArray(sourceAttribute.array)
    if (!attrArray) return

    const attribute = new AFRAME_THREE.BufferAttribute(
      attrArray,
      sourceAttribute.itemSize,
      sourceAttribute.normalized
    )
    geometry.setAttribute(name, attribute)
  })

  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

function convertObject3DForAFrame(sourceNode, AFRAME_THREE) {
  if (!sourceNode?.isObject3D) return null

  let node = null

  if (sourceNode.isMesh) {
    const geometry = convertGeometryForAFrame(sourceNode.geometry, AFRAME_THREE)
    if (!geometry) return null

    const material = Array.isArray(sourceNode.material)
      ? sourceNode.material.map((item) => convertMaterialForAFrame(item, AFRAME_THREE))
      : convertMaterialForAFrame(sourceNode.material, AFRAME_THREE)

    node = new AFRAME_THREE.Mesh(geometry, material)
    node.castShadow = Boolean(sourceNode.castShadow)
    node.receiveShadow = Boolean(sourceNode.receiveShadow)
  } else if (sourceNode.isGroup) {
    node = new AFRAME_THREE.Group()
  } else {
    node = new AFRAME_THREE.Object3D()
  }

  node.name = sourceNode.name || ''
  node.visible = sourceNode.visible
  node.matrixAutoUpdate = sourceNode.matrixAutoUpdate
  node.renderOrder = sourceNode.renderOrder || 0
  node.position.set(sourceNode.position.x, sourceNode.position.y, sourceNode.position.z)
  node.quaternion.set(
    sourceNode.quaternion.x,
    sourceNode.quaternion.y,
    sourceNode.quaternion.z,
    sourceNode.quaternion.w
  )
  node.scale.set(sourceNode.scale.x, sourceNode.scale.y, sourceNode.scale.z)
  node.userData = { ...(sourceNode.userData || {}) }

  sourceNode.children?.forEach((child) => {
    const convertedChild = convertObject3DForAFrame(child, AFRAME_THREE)
    if (convertedChild) node.add(convertedChild)
  })

  return node
}

function normalizeDeskGroupForAFrame(sourceGroup) {
  if (!sourceGroup) return null
  if (isAFrameThreeObject3D(sourceGroup)) return sourceGroup

  const AFRAME_THREE = window.AFRAME?.THREE
  if (!AFRAME_THREE) return null

  try {
    return convertObject3DForAFrame(sourceGroup, AFRAME_THREE)
  } catch (error) {
    console.warn('[VirtualShowrooms] Failed to convert DeskModel to A-Frame THREE:', error)
    return null
  }
}

function cloneDeskGroup(sourceGroup) {
  const clone = sourceGroup.clone(true)
  clone.name = 'desk-ar-root'
  clone.scale.setScalar(DESK_SCALE)
  clone.position.set(0, DESK_Y_OFFSET, 0)
  clone.rotation.set(DESK_ROTATION_X, DESK_ROTATION_Y, 0, 'XYZ')
  clone.userData.baseRotationY = clone.rotation.y
  clone.userData.spinAngle = 0

  clone.traverse((node) => {
    if (!node || typeof node !== 'object') return
    node.frustumCulled = false

    if (node.isMesh) {
      node.castShadow = true
      node.receiveShadow = true

      if (Array.isArray(node.material)) {
        node.material = node.material.map((material) => (material?.clone ? material.clone() : material))
      } else if (node.material?.clone) {
        node.material = node.material.clone()
      }
    }
  })

  return clone
}

function attachDeskToMarker(sourceGroup) {
  const marker = markerRef.value
  if (!marker?.object3D || !sourceGroup) return false

  const normalizedDeskGroup = normalizeDeskGroupForAFrame(sourceGroup)
  if (!normalizedDeskGroup) return false

  if (injectedDeskGroup) {
    marker.object3D.remove(injectedDeskGroup)
  }

  injectedDeskGroup = cloneDeskGroup(normalizedDeskGroup)
  marker.object3D.add(injectedDeskGroup)
  return true
}

function attachFallbackDeskToMarker() {
  const marker = markerRef.value
  if (!marker?.object3D) return false

  const fallbackGroup = createFallbackDeskGroup()
  if (!fallbackGroup) return false

  if (injectedDeskGroup) {
    marker.object3D.remove(injectedDeskGroup)
  }

  injectedDeskGroup = fallbackGroup
  marker.object3D.add(injectedDeskGroup)
  return true
}

function addMarkerEvents() {
  const marker = markerRef.value
  if (!marker) return

  markerFoundHandler = () => {
    if (!injectedDeskGroup) {
      const lateDeskSource = resolveDeskGroup()
      if (!attachDeskToMarker(lateDeskSource)) {
        attachFallbackDeskToMarker()
      }
    }
    markerVisible.value = true
    statusText.value = 'Marker detected. Desk anchored to Hiro marker.'
  }

  markerLostHandler = () => {
    markerVisible.value = false
    statusText.value = 'Marker lost. Point your camera at the Hiro marker.'
  }

  marker.addEventListener('markerFound', markerFoundHandler)
  marker.addEventListener('markerLost', markerLostHandler)
}

function removeMarkerEvents() {
  const marker = markerRef.value
  if (markerFoundHandler && marker) marker.removeEventListener('markerFound', markerFoundHandler)
  if (markerLostHandler && marker) marker.removeEventListener('markerLost', markerLostHandler)
  markerFoundHandler = null
  markerLostHandler = null
}

function waitForSceneLoaded(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const scene = sceneRef.value
    if (!scene) {
      reject(new Error('AR scene element missing'))
      return
    }

    if (scene.hasLoaded) {
      resolve(scene)
      return
    }

    const onLoaded = () => {
      window.clearTimeout(timeoutId)
      resolve(scene)
    }

    const timeoutId = window.setTimeout(() => {
      scene.removeEventListener('loaded', onLoaded)
      reject(new Error('A-Frame scene load timed out'))
    }, timeoutMs)

    scene.addEventListener('loaded', onLoaded, { once: true })
  })
}

async function initAr() {
  try {
    initError.value = ''
    statusText.value = 'Loading AR libraries...'
    sceneVisible.value = false
    installCanvasReadbackHint()

    await loadScriptOnce(AFRAME_CDN, () => Boolean(window.AFRAME))
    await loadScriptOnce(ARJS_CDN, () => Boolean(window.ARjs || window.THREEx))
    installArControllerSafetyPatch()
    if (!isActive) return

    registerDeskSpinComponent()
    sceneVisible.value = true
    await nextTick()
    if (!isActive) return

    await waitForSceneLoaded()
    if (!isActive) return

    markerRef.value?.setAttribute('size', String(MARKER_SIZE_METERS))
    addMarkerEvents()

    window.addEventListener('resize', onViewportChange, { passive: true })
    window.addEventListener('orientationchange', onViewportChange)
    window.visualViewport?.addEventListener('resize', onViewportChange, { passive: true })
    window.visualViewport?.addEventListener('scroll', onViewportChange, { passive: true })

    syncArLayout()
    window.setTimeout(syncArLayout, 150)
    window.setTimeout(syncArLayout, 500)

    statusText.value = 'Point your camera at the Hiro marker.'

    const deskGroupSource = await waitForDeskGroup(12000)
    const attached =
      (deskGroupSource && attachDeskToMarker(deskGroupSource)) || attachFallbackDeskToMarker()

    statusText.value = attached
      ? 'Point your camera at the Hiro marker.'
      : 'Desk model setup failed. Please refresh the page.'

    syncArLayout()
  } catch (error) {
    console.error('[VirtualShowrooms] AR init failed:', error)
    initError.value = 'Unable to start AR camera. Refresh and allow camera access.'
    statusText.value = 'AR initialization failed.'
  }
}

function stopCameraStreams() {
  const stageVideos = Array.from(
    stageRef.value?.querySelectorAll('#arjs-video, video#arjs-video, video.arjs-video') ?? []
  )

  const ownedVideos = Array.from(
    document.querySelectorAll(
      `#arjs-video[${AR_OWNER_ATTR}="${AR_OWNER_NAME}"], video#arjs-video[${AR_OWNER_ATTR}="${AR_OWNER_NAME}"], video.arjs-video[${AR_OWNER_ATTR}="${AR_OWNER_NAME}"]`
    )
  )

  const videos = new Set([...stageVideos, ...ownedVideos])

  videos.forEach((videoEl) => {
    const stream = videoEl.srcObject
    if (stream?.getTracks) {
      stream.getTracks().forEach((track) => track.stop())
    }
    videoEl.srcObject = null
  })
}

function cleanupArDom() {
  document
    .querySelectorAll(`[${AR_OWNER_ATTR}="${AR_OWNER_NAME}"]`)
    .forEach((el) => el.remove())

  stageRef.value?.querySelectorAll('a-scene.ar-scene, a-scene[arjs]').forEach((el) => {
    if (el !== sceneRef.value) {
      el.remove()
    }
  })
}

function teardownAr() {
  if (isTornDown) return
  isTornDown = true

  if (previousBodyOverflow !== null) {
    document.body.style.overflow = previousBodyOverflow
    previousBodyOverflow = null
  }

  document.documentElement.style.removeProperty('--ar-vh')
  document.documentElement.style.removeProperty('--ar-nav-offset')
  sceneVisible.value = false

  removeMarkerEvents()

  if (resizeDebounceTimer) {
    window.clearTimeout(resizeDebounceTimer)
    resizeDebounceTimer = null
  }

  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('orientationchange', onViewportChange)
  window.visualViewport?.removeEventListener('resize', onViewportChange)
  window.visualViewport?.removeEventListener('scroll', onViewportChange)

  const marker = markerRef.value
  if (injectedDeskGroup && marker?.object3D) {
    marker.object3D.remove(injectedDeskGroup)
  }
  injectedDeskGroup = null

  stopCameraStreams()
  cleanupArDom()
  sceneRef.value?.pause?.()
  uninstallArControllerSafetyPatch()
  uninstallCanvasReadbackHint()
}

onMounted(async () => {
  isActive = true
  isTornDown = false
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  setViewportHeightVar()
  setNavOffsetVar()
  await nextTick()
  initAr()
})

onBeforeRouteLeave(() => {
  isActive = false
  teardownAr()
})

onUnmounted(() => {
  isActive = false
  teardownAr()
})
</script>

<template>
  <section class="ar-page">
    <div ref="stageRef" class="ar-stage">
      <a-scene
        v-if="sceneVisible"
        ref="sceneRef"
        class="ar-scene"
        embedded
        vr-mode-ui="enabled: false"
        renderer="alpha: true; antialias: true; colorManagement: true;"
        arjs="sourceType: webcam; sourceWidth: 640; sourceHeight: 480; displayWidth: 640; displayHeight: 480; debugUIEnabled: false; detectionMode: mono; trackingMethod: best;"
        device-orientation-permission-ui="enabled: false"
      >
        <a-entity light="type: ambient; color: #ffffff; intensity: 0.85"></a-entity>
        <a-entity light="type: directional; color: #ffffff; intensity: 1.1; position: 1 2 1"></a-entity>

        <a-marker
          ref="markerRef"
          preset="hiro"
          emitevents="true"
          :size="MARKER_SIZE_METERS"
          desk-spin="speed: 0.00012"
        ></a-marker>

        <a-entity camera></a-entity>
      </a-scene>

      <div v-else class="ar-loading">
        Initializing camera and tracking...
      </div>

      <header class="ar-header">
        <h1>Virtual Showroom AR</h1>
        <p>Scan the Hiro marker to preview your desk in real space.</p>
      </header>

      <div class="ar-overlay ar-overlay-bottom">
        <span :class="['status-dot', markerVisible ? 'is-visible' : 'is-hidden']"></span>
        <span>{{ statusText }}</span>
      </div>

      <p v-if="initError" class="ar-error">{{ initError }}</p>
    </div>

    <div class="desk-source" aria-hidden="true">
      <TresCanvas clear-color="#000000">
        <DeskModel
          ref="deskRef"
          :dimensions="deskDimensions"
          material-color="#d9b98b"
          :features="deskFeatures"
        />
      </TresCanvas>
    </div>
  </section>
</template>

<style scoped>
:global(html),
:global(body) {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.ar-page {
  position: relative;
  width: 100%;
  min-height: 320px;
  height: calc(var(--ar-vh, 100vh) - var(--ar-nav-offset, 72px));
  background: radial-gradient(120% 100% at 50% 0%, #1a1a1a 0%, #0a0a0a 58%, #050505 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ar-header {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 0.6rem);
  left: 0.6rem;
  right: 0.6rem;
  z-index: 10;
  pointer-events: none;
  padding: 0.55rem 0.75rem;
  border-radius: 0.6rem;
  background: linear-gradient(180deg, rgba(34, 30, 25, 0.82), rgba(34, 30, 25, 0.55));
  color: #f7f1e8;
}

.ar-header h1 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.ar-header p {
  margin: 0.2rem 0 0;
  font-size: 0.78rem;
  color: rgba(247, 241, 232, 0.85);
}

.ar-stage {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 280px;
  background: #0a0a0a;
  overflow: hidden;
  isolation: isolate;
  touch-action: none;
  overscroll-behavior: contain;
}

.ar-scene {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.ar-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.95rem;
  background: #0a0a0a;
  z-index: 3;
}

.ar-overlay {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(12, 12, 12, 0.58);
  color: #fff;
  padding: 0.55rem 0.9rem;
  border-radius: 999px;
  backdrop-filter: blur(4px);
  z-index: 10;
  font-size: 0.92rem;
  font-weight: 500;
  max-width: min(92vw, 760px);
  text-align: center;
  line-height: 1.25;
}

.ar-overlay-bottom {
  bottom: calc(env(safe-area-inset-bottom, 0px) + 0.9rem);
}

.status-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  flex: 0 0 0.55rem;
}

.status-dot.is-visible {
  background: #43e47a;
  box-shadow: 0 0 10px rgba(67, 228, 122, 0.7);
}

.status-dot.is-hidden {
  background: #ff8b8b;
}

.ar-error {
  position: absolute;
  top: clamp(4.2rem, 10vh, 5.4rem);
  left: 0.6rem;
  right: 0.6rem;
  margin: 0;
  padding: 0.55rem 0.7rem;
  border-radius: 0.6rem;
  background: #ffe3e3;
  color: #7f1b1b;
  font-size: 0.8rem;
  z-index: 10;
}

.desk-source {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.ar-stage :deep(#arjs-video),
.ar-stage :deep(video#arjs-video),
.ar-stage :deep(video.arjs-video),
.ar-stage :deep(canvas.a-canvas),
.ar-stage :deep(.a-canvas),
.ar-stage :deep(a-scene) {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  top: 0 !important;
  left: 0 !important;
  right: auto !important;
  bottom: auto !important;
  margin: 0 !important;
  transform: none !important;
  max-width: none !important;
  max-height: none !important;
}

.ar-stage :deep(#arjs-video),
.ar-stage :deep(video#arjs-video),
.ar-stage :deep(video.arjs-video) {
  object-fit: cover !important;
  background: #000 !important;
}

@media (max-width: 768px) {
  .ar-page {
    height: auto;
    min-height: calc(var(--ar-vh, 100vh) - var(--ar-nav-offset, 72px));
  }

  .ar-stage {
    aspect-ratio: 3 / 4;
    min-height: 420px;
    max-height: calc(var(--ar-vh, 100vh) - var(--ar-nav-offset, 72px));
  }

  .ar-header {
    top: 0.5rem;
    left: 0.5rem;
    right: 0.5rem;
    padding: 0.5rem 0.65rem;
  }

  .ar-header h1 {
    font-size: 0.9rem;
  }

  .ar-header p {
    font-size: 0.7rem;
  }

  .ar-overlay {
    width: calc(100% - 1rem);
    max-width: none;
    font-size: 0.78rem;
    padding: 0.5rem 0.7rem;
    border-radius: 0.8rem;
  }
}

@media (max-width: 480px) {
  .ar-stage {
    aspect-ratio: 9 / 14;
    min-height: 360px;
  }

  .ar-header h1 {
    font-size: 0.8rem;
  }

  .ar-header p {
    font-size: 0.62rem;
  }

  .ar-overlay {
    font-size: 0.72rem;
    padding: 0.45rem 0.65rem;
  }
}
</style>
