<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import { onBeforeRouteLeave } from "vue-router";

const AFRAME_CDN = "https://aframe.io/releases/1.4.0/aframe.min.js";
const ARJS_CDN =
  "https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.4.7/aframe/build/aframe-ar.js";

const MARKER_SIZE_METERS = 0.08;
const DESK_SCALE = 1.2;
const DESK_Y_OFFSET = 0;
const DESK_ROTATION_X = 0;
const DESK_ROTATION_Y = Math.PI / 2;
const DEFAULT_NAV_OFFSET = 72;
const AR_OWNER_ATTR = "data-ar-owner";
const AR_OWNER_NAME = "virtual-showrooms";

const sceneRef = ref(null);
const markerRef = ref(null);
const stageRef = ref(null);
const sceneVisible = ref(false);

const markerVisible = ref(false);
const statusText = ref("Loading AR...");
const initError = ref("");

let isActive = true;
let isTornDown = false;
let resizeDebounceTimer = null;
let injectedDeskGroup = null;
let markerFoundHandler = null;
let markerLostHandler = null;
let restoreCanvasGetContext = null;
let restoreArControllerPatch = null;
let hadPreviousGlobalThree = false;
let previousGlobalThree = null;

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function installCanvasReadbackHint() {
  if (restoreCanvasGetContext || typeof window === "undefined") return;

  const proto = window.HTMLCanvasElement?.prototype;
  if (!proto || typeof proto.getContext !== "function") return;

  const originalGetContext = proto.getContext;
  proto.getContext = function patchedGetContext(type, attrs) {
    if (type === "2d") {
      const options =
        attrs && typeof attrs === "object"
          ? { ...attrs, willReadFrequently: true }
          : { willReadFrequently: true };
      return originalGetContext.call(this, type, options);
    }
    return originalGetContext.call(this, type, attrs);
  };

  restoreCanvasGetContext = () => {
    proto.getContext = originalGetContext;
    restoreCanvasGetContext = null;
  };
}

function uninstallCanvasReadbackHint() {
  if (restoreCanvasGetContext) {
    restoreCanvasGetContext();
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
    vertex: [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ],
  };
}

function installArControllerSafetyPatch() {
  if (restoreArControllerPatch) return;

  const ARController = window.ARController;
  if (!ARController?.prototype) return;

  const proto = ARController.prototype;
  const originalGetMarker = proto.getMarker;
  const originalProcess = proto.process;
  if (typeof originalGetMarker !== "function") return;

  proto.getMarker = function patchedGetMarker(markerIndex) {
    const markerInfo = originalGetMarker.call(this, markerIndex);
    if (markerInfo && typeof markerInfo.idPatt !== "undefined") {
      return markerInfo;
    }
    return buildSafeMarkerInfo();
  };

  if (typeof originalProcess === "function") {
    proto.process = function patchedProcess(image) {
      try {
        return originalProcess.call(this, image);
      } catch (error) {
        const message = String(error?.message || error);
        if (message.includes("idPatt")) {
          return;
        }
        throw error;
      }
    };
  }

  restoreArControllerPatch = () => {
    proto.getMarker = originalGetMarker;
    if (typeof originalProcess === "function") {
      proto.process = originalProcess;
    }
    restoreArControllerPatch = null;
  };
}

function uninstallArControllerSafetyPatch() {
  if (restoreArControllerPatch) {
    restoreArControllerPatch();
  }
}

function isolateGlobalThreeForAr() {
  if (typeof window === "undefined") return;
  hadPreviousGlobalThree = Object.prototype.hasOwnProperty.call(window, "THREE");
  if (!hadPreviousGlobalThree) return;

  previousGlobalThree = window.THREE;
  try {
    delete window.THREE;
  } catch {
    window.THREE = undefined;
  }
}

function restoreGlobalThreeAfterAr() {
  if (typeof window === "undefined") return;

  if (hadPreviousGlobalThree) {
    window.THREE = previousGlobalThree;
  } else {
    try {
      delete window.THREE;
    } catch {
      window.THREE = undefined;
    }
  }

  hadPreviousGlobalThree = false;
  previousGlobalThree = null;
}

function setViewportHeightVar() {
  const layoutViewportHeight = window.innerHeight || 0;
  const visualViewportHeight = window.visualViewport?.height || 0;
  const viewportHeight = Math.max(layoutViewportHeight, visualViewportHeight);
  const safeHeight = Math.max(320, Math.round(viewportHeight));
  document.documentElement.style.setProperty("--ar-vh", `${safeHeight}px`);
}

function setNavOffsetVar() {
  const nav = document.querySelector(".top-nav");
  const navHeight = Math.max(
    DEFAULT_NAV_OFFSET,
    Math.round(nav?.getBoundingClientRect().height || DEFAULT_NAV_OFFSET),
  );
  document.documentElement.style.setProperty("--ar-nav-offset", `${navHeight}px`);
}

function applyStyles(element, styles) {
  if (!element) return;
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value, "important");
  });
}

function markArOwned(element) {
  if (!element) return;
  element.setAttribute(AR_OWNER_ATTR, AR_OWNER_NAME);
}

function tagArUiElements() {
  document
    .querySelectorAll(
      ".arjs-loader, .arjs-debugUIContainer, .a-enter-vr, .a-orientation-modal",
    )
    .forEach((element) => markArOwned(element));
}

function syncArLayout() {
  if (!isActive) return;

  const stage = stageRef.value;
  const scene = sceneRef.value;
  if (!stage || !scene || !sceneVisible.value) return;

  setViewportHeightVar();
  setNavOffsetVar();

  const stageRect = stage.getBoundingClientRect();
  const stageWidth = Math.max(1, Math.round(stageRect.width));
  const stageHeight = Math.max(1, Math.round(stageRect.height));
  const pixelRatio = Math.min(2, window.devicePixelRatio || 1);

  applyStyles(scene, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    margin: "0",
    background: "transparent",
    "z-index": "2",
  });

  const video =
    stage.querySelector("#arjs-video, video#arjs-video, video.arjs-video") ||
    document.querySelector("#arjs-video, video#arjs-video, video.arjs-video");

  const canvas =
    scene.canvas ||
    scene.querySelector("canvas.a-canvas") ||
    document.querySelector("canvas.a-canvas");

  if (video) {
    markArOwned(video);

    if (video.parentElement !== stage) {
      stage.appendChild(video);
    }

    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");

    applyStyles(video, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      top: "0",
      left: "0",
      margin: "0",
      transform: "none",
      "object-fit": "contain",
      background: "#000000",
      "pointer-events": "none",
      "z-index": "1",
    });
  }

  if (canvas) {
    markArOwned(canvas);

    if (canvas.parentElement !== scene) {
      scene.appendChild(canvas);
    }

    const renderWidth = Math.max(1, Math.round(stageWidth * pixelRatio));
    const renderHeight = Math.max(1, Math.round(stageHeight * pixelRatio));

    if (canvas.width !== renderWidth) canvas.width = renderWidth;
    if (canvas.height !== renderHeight) canvas.height = renderHeight;

    applyStyles(canvas, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      top: "0",
      left: "0",
      margin: "0",
      transform: "none",
      background: "transparent",
      "pointer-events": "none",
      "z-index": "2",
    });
  }

  if (scene.renderer?.setPixelRatio) {
    scene.renderer.setPixelRatio(pixelRatio);
  }

  if (scene.renderer?.setSize) {
    scene.renderer.setSize(stageWidth, stageHeight, false);
  }

  scene.resize?.();
  tagArUiElements();
}

function onViewportChange() {
  window.clearTimeout(resizeDebounceTimer);
  resizeDebounceTimer = window.setTimeout(() => {
    syncArLayout();
  }, 80);
}

function loadScriptOnce(src, isReady) {
  return new Promise((resolve, reject) => {
    if (isReady()) {
      resolve();
      return;
    }

    const selector = `script[data-ar-src="${src}"]`;
    const existing = document.querySelector(selector);

    const handleLoad = () => resolve();
    const handleError = () => reject(new Error(`Failed to load script: ${src}`));

    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.dataset.arSrc = src;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });
}

function resetArRuntime() {
  document
    .querySelectorAll(`script[data-ar-src="${AFRAME_CDN}"], script[data-ar-src="${ARJS_CDN}"]`)
    .forEach((script) => script.remove());

  try {
    delete window.AFRAME;
  } catch {}
  try {
    delete window.ARjs;
  } catch {}
  try {
    delete window.THREEx;
  } catch {}
}

function registerDeskSpinComponent() {
  const AFRAME = window.AFRAME;
  if (!AFRAME || AFRAME.components["desk-spin"]) return;

  AFRAME.registerComponent("desk-spin", {
    schema: {
      speed: { default: 0.00012 },
    },
    tick(_time, delta = 16) {
      const desk = this.el.object3D.getObjectByName("desk-ar-root");
      if (!desk || !this.el.object3D.visible) return;

      if (typeof desk.userData.baseRotationY !== "number") {
        desk.userData.baseRotationY = desk.rotation.y;
      }

      desk.userData.spinAngle =
        (desk.userData.spinAngle || 0) + delta * this.data.speed;
      desk.rotation.y = desk.userData.baseRotationY + desk.userData.spinAngle;
    },
  });
}

function createFallbackDeskGroup() {
  const THREE = window.AFRAME?.THREE;
  if (!THREE) return null;

  const group = new THREE.Group();
  group.name = "desk-ar-root";

  const topMaterial = new THREE.MeshStandardMaterial({
    color: "#d9b98b",
    roughness: 0.45,
    metalness: 0.08,
  });
  const legMaterial = new THREE.MeshStandardMaterial({
    color: "#2a2a2a",
    roughness: 0.3,
    metalness: 0.82,
  });

  const desktop = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.06, 0.8),
    topMaterial,
  );
  desktop.position.set(0, 0.75, 0);
  group.add(desktop);

  const legGeometry = new THREE.BoxGeometry(0.07, 0.72, 0.07);
  const legPositions = [
    [-0.72, 0.36, -0.32],
    [0.72, 0.36, -0.32],
    [-0.72, 0.36, 0.32],
    [0.72, 0.36, 0.32],
  ];

  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(x, y, z);
    group.add(leg);
  });

  group.scale.setScalar(DESK_SCALE);
  group.position.set(0, DESK_Y_OFFSET, 0);
  group.rotation.set(DESK_ROTATION_X, DESK_ROTATION_Y, 0, "XYZ");
  group.userData.baseRotationY = group.rotation.y;
  group.userData.spinAngle = 0;

  group.traverse((node) => {
    if (!node || typeof node !== "object") return;
    node.frustumCulled = false;
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  return group;
}

function attachFallbackDeskToMarker() {
  const marker = markerRef.value;
  if (!marker?.object3D) return false;

  const fallbackGroup = createFallbackDeskGroup();
  if (!fallbackGroup) return false;

  if (injectedDeskGroup) {
    marker.object3D.remove(injectedDeskGroup);
  }

  injectedDeskGroup = fallbackGroup;
  marker.object3D.add(injectedDeskGroup);
  return true;
}

function addMarkerEvents() {
  const marker = markerRef.value;
  if (!marker) return;

  markerFoundHandler = () => {
    if (!injectedDeskGroup) {
      attachFallbackDeskToMarker();
    }
    markerVisible.value = true;
    statusText.value = "Marker detected. Desk anchored to Hiro marker.";
  };

  markerLostHandler = () => {
    markerVisible.value = false;
    statusText.value = "Marker lost. Point your camera at the Hiro marker.";
  };

  marker.addEventListener("markerFound", markerFoundHandler);
  marker.addEventListener("markerLost", markerLostHandler);
}

function removeMarkerEvents() {
  const marker = markerRef.value;
  if (markerFoundHandler && marker) {
    marker.removeEventListener("markerFound", markerFoundHandler);
  }
  if (markerLostHandler && marker) {
    marker.removeEventListener("markerLost", markerLostHandler);
  }
  markerFoundHandler = null;
  markerLostHandler = null;
}

function waitForSceneLoaded(timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const scene = sceneRef.value;
    if (!scene) {
      reject(new Error("AR scene element missing"));
      return;
    }

    if (scene.hasLoaded) {
      resolve(scene);
      return;
    }

    const onLoaded = () => {
      window.clearTimeout(timeoutId);
      resolve(scene);
    };

    const timeoutId = window.setTimeout(() => {
      scene.removeEventListener("loaded", onLoaded);
      reject(new Error("A-Frame scene load timed out"));
    }, timeoutMs);

    scene.addEventListener("loaded", onLoaded, { once: true });
  });
}

async function waitForMarkerObject(timeoutMs = 3000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (markerRef.value?.object3D) {
      return true;
    }
    await wait(50);
  }

  return false;
}

async function initAr() {
  try {
    initError.value = "";
    statusText.value = "Loading AR libraries...";
    sceneVisible.value = false;

    resetArRuntime();
    isolateGlobalThreeForAr();
    installCanvasReadbackHint();
    await loadScriptOnce(AFRAME_CDN, () => Boolean(window.AFRAME));
    await loadScriptOnce(ARJS_CDN, () => Boolean(window.ARjs || window.THREEx));
    installArControllerSafetyPatch();
    if (!isActive) return;

    registerDeskSpinComponent();
    sceneVisible.value = true;
    await nextTick();
    if (!isActive) return;

    await waitForSceneLoaded();
    if (!isActive) return;

    markerRef.value?.setAttribute("size", String(MARKER_SIZE_METERS));
    addMarkerEvents();

    await waitForMarkerObject();

    window.addEventListener("resize", onViewportChange, { passive: true });
    window.addEventListener("orientationchange", onViewportChange);
    window.visualViewport?.addEventListener("resize", onViewportChange, {
      passive: true,
    });
    window.visualViewport?.addEventListener("scroll", onViewportChange, {
      passive: true,
    });

    syncArLayout();
    window.setTimeout(syncArLayout, 150);
    window.setTimeout(syncArLayout, 500);

    const attached = attachFallbackDeskToMarker();
    statusText.value = attached
      ? "Point your camera at the Hiro marker."
      : "Point your camera at the Hiro marker.";

    syncArLayout();
  } catch (error) {
    console.error("[VirtualShowrooms] AR init failed:", error);
    initError.value = "Unable to start AR camera. Refresh and allow camera access.";
    statusText.value = "AR initialization failed.";
  }
}

function stopCameraStreams() {
  const stageVideos = Array.from(
    stageRef.value?.querySelectorAll(
      "#arjs-video, video#arjs-video, video.arjs-video",
    ) ?? [],
  );

  const ownedVideos = Array.from(
    document.querySelectorAll(
      `#arjs-video[${AR_OWNER_ATTR}="${AR_OWNER_NAME}"], video#arjs-video[${AR_OWNER_ATTR}="${AR_OWNER_NAME}"], video.arjs-video[${AR_OWNER_ATTR}="${AR_OWNER_NAME}"]`,
    ),
  );

  const videos = new Set([...stageVideos, ...ownedVideos]);

  videos.forEach((videoEl) => {
    const stream = videoEl.srcObject;
    if (stream?.getTracks) {
      stream.getTracks().forEach((track) => track.stop());
    }
    videoEl.srcObject = null;
  });
}

function cleanupArDom() {
  document
    .querySelectorAll(`[${AR_OWNER_ATTR}="${AR_OWNER_NAME}"]`)
    .forEach((el) => el.remove());

  document
    .querySelectorAll("#arjs-video, video#arjs-video, video.arjs-video")
    .forEach((el) => el.remove());

  document
    .querySelectorAll(
      ".arjs-loader, .arjs-debugUIContainer, .a-enter-vr, .a-orientation-modal",
    )
    .forEach((el) => el.remove());

  stageRef.value
    ?.querySelectorAll("a-scene.ar-scene, a-scene[arjs]")
    .forEach((el) => {
      if (el !== sceneRef.value) {
        el.remove();
      }
    });
}

function teardownAr() {
  if (isTornDown) return;
  isTornDown = true;

  removeMarkerEvents();

  if (resizeDebounceTimer) {
    window.clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = null;
  }

  window.removeEventListener("resize", onViewportChange);
  window.removeEventListener("orientationchange", onViewportChange);
  window.visualViewport?.removeEventListener("resize", onViewportChange);
  window.visualViewport?.removeEventListener("scroll", onViewportChange);

  const marker = markerRef.value;
  if (injectedDeskGroup && marker?.object3D) {
    marker.object3D.remove(injectedDeskGroup);
  }
  injectedDeskGroup = null;

  stopCameraStreams();
  cleanupArDom();
  sceneRef.value?.pause?.();
  uninstallArControllerSafetyPatch();
  uninstallCanvasReadbackHint();
  restoreGlobalThreeAfterAr();

  document.documentElement.style.removeProperty("--ar-vh");
  document.documentElement.style.removeProperty("--ar-nav-offset");

  sceneVisible.value = false;
}

onMounted(async () => {
  isActive = true;
  isTornDown = false;

  setViewportHeightVar();
  setNavOffsetVar();

  await nextTick();
  initAr();
});

onBeforeRouteLeave(() => {
  isActive = false;
  teardownAr();
});

onUnmounted(() => {
  isActive = false;
  teardownAr();
});
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
        arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono; trackingMethod: best;"
        device-orientation-permission-ui="enabled: false"
      >
        <a-entity light="type: ambient; color: #ffffff; intensity: 0.85"></a-entity>
        <a-entity
          light="type: directional; color: #ffffff; intensity: 1.1; position: 1 2 1"
        ></a-entity>

        <a-marker
          ref="markerRef"
          preset="hiro"
          emitevents="true"
          :size="MARKER_SIZE_METERS"
          desk-spin="speed: 0.00012"
        ></a-marker>

        <a-entity camera></a-entity>
      </a-scene>

      <div v-else class="ar-loading">Initializing camera and tracking...</div>

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
  </section>
</template>

<style scoped>
.ar-page {
  position: relative;
  width: 100%;
  min-height: 320px;
  height: calc(var(--ar-vh, 100vh) - var(--ar-nav-offset, 72px));
  background: radial-gradient(
    120% 100% at 50% 0%,
    #1a1a1a 0%,
    #0a0a0a 58%,
    #050505 100%
  );
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
  background: linear-gradient(
    180deg,
    rgba(34, 30, 25, 0.82),
    rgba(34, 30, 25, 0.55)
  );
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
  object-fit: contain !important;
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
