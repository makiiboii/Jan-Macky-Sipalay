"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";

const location = { latitude: 6.75, longitude: 125.35 };

const cameraStops = [
  { progress: 0, latitude: 14, longitude: -28, distance: 4.8 },
  { progress: 0.5, latitude: 20, longitude: 112, distance: 3.65 },
  { progress: 1, ...location, distance: 2.7 },
];

function viewOrientation(latitude: number, longitude: number) {
  const latitudeRadians = THREE.MathUtils.degToRad(latitude);
  const longitudeRadians = THREE.MathUtils.degToRad(longitude);
  const yaw = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    -Math.PI / 2 - longitudeRadians,
  );
  const tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), latitudeRadians);
  return tilt.multiply(yaw);
}

function getLocationNormal() {
  const latitude = THREE.MathUtils.degToRad(location.latitude);
  const longitude = THREE.MathUtils.degToRad(location.longitude);
  return new THREE.Vector3(
    Math.cos(latitude) * Math.cos(longitude),
    Math.sin(latitude),
    -Math.cos(latitude) * Math.sin(longitude),
  ).normalize();
}

function smooth(value: number) {
  return value * value * (3 - 2 * value);
}

function sceneAt(progress: number) {
  const scaled = THREE.MathUtils.clamp(progress, 0, 1) * (cameraStops.length - 1);
  const index = Math.min(Math.floor(scaled), cameraStops.length - 2);
  const local = smooth(scaled - index);
  const from = cameraStops[index];
  const to = cameraStops[index + 1];
  const orientation = viewOrientation(from.latitude, from.longitude).slerp(
    viewOrientation(to.latitude, to.longitude),
    local,
  );

  return {
    distance: THREE.MathUtils.lerp(from.distance, to.distance, local),
    orientation,
  };
}

type EarthCanvasProps = {
  progress: { current: number };
  onUnavailable: () => void;
  locationLine: RefObject<SVGLineElement | null>;
  locationAnchor: RefObject<HTMLSpanElement | null>;
};

export default function EarthCanvas({ progress, onUnavailable, locationLine, locationAnchor }: EarthCanvasProps) {
  const host = useRef<HTMLDivElement>(null);
  const unavailable = useRef(onUnavailable);
  unavailable.current = onUnavailable;

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2") ?? probe.getContext("webgl");
      if (!context) throw new Error("WebGL is unavailable");
      context.getExtension("WEBGL_lose_context")?.loseContext();

      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const lowPower = mobile || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !lowPower,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
    } catch {
      container.replaceChildren(createFallback());
      unavailable.current();
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, cameraStops[0].distance);

    const canvas = renderer.domElement;
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "earth-canvas__webgl";
    container.appendChild(canvas);

    scene.add(new THREE.HemisphereLight(0xc5cbd2, 0x050608, 0.48));
    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(-3.5, 2.4, 4.5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x858b94, 0.2);
    fill.position.set(4, -2, -3);
    scene.add(fill);

    const earth = new THREE.Group();
    const earthGeometry = new THREE.SphereGeometry(1, 64, 48);
    const earthMaterial = new THREE.MeshStandardMaterial({
      color: 0x030405,
      roughness: 0.94,
      metalness: 0.02,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.add(earthMesh);

    const landMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
        uOpacity: { value: 1 },
        uSunDirection: { value: new THREE.Vector3(-3.5, 2.4, 4.5).normalize() },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aBrightness;
        uniform float uPixelRatio;
        uniform vec3 uSunDirection;
        varying float vBrightness;
        void main() {
          vec3 worldNormal = normalize(mat3(modelMatrix) * normalize(position));
          float sunlight = max(0.0, dot(worldNormal, normalize(uSunDirection)));
          vBrightness = aBrightness * (0.3 + sunlight * 0.7);
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewPosition;
          gl_PointSize = aSize * uPixelRatio * (3.5 / max(1.0, -viewPosition.z));
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying float vBrightness;
        void main() {
          float radius = length(gl_PointCoord - vec2(0.5));
          if (radius > 0.5) discard;
          float edge = 1.0 - smoothstep(0.3, 0.5, radius);
          float alpha = edge * vBrightness * uOpacity;
          gl_FragColor = vec4(vec3(0.76 + vBrightness * 0.22), alpha);
        }
      `,
    });
    const landPoints = new THREE.Points(new THREE.BufferGeometry(), landMaterial);
    landPoints.renderOrder = 2;
    landPoints.frustumCulled = false;
    earth.add(landPoints);

    const atmosphere = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vViewPosition = -viewPosition.xyz;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          float facing = max(0.0, dot(normalize(vNormal), normalize(vViewPosition)));
          float rim = pow(1.0 - facing, 2.4);
          gl_FragColor = vec4(0.72, 0.76, 0.82, rim * 0.28);
        }
      `,
    });
    const atmosphereGeometry = new THREE.SphereGeometry(1.024, 48, 36);
    earth.add(new THREE.Mesh(atmosphereGeometry, atmosphere));

    const orbitGeometries: THREE.BufferGeometry[] = [];
    const orbitMaterials: THREE.LineBasicMaterial[] = [];
    const orbitNodeGeometry = new THREE.SphereGeometry(0.006, 8, 6);
    const orbitNodeMaterial = new THREE.MeshBasicMaterial({ color: 0xe8ebef, toneMapped: false });
    addOrbit(earth, [28, -62], [14, 108], orbitGeometries, orbitMaterials, orbitNodeGeometry, orbitNodeMaterial);
    addOrbit(earth, [46, 142], [-24, 25], orbitGeometries, orbitMaterials, orbitNodeGeometry, orbitNodeMaterial);

    const locationNormal = getLocationNormal();
    const marker = new THREE.Group();
    marker.position.copy(locationNormal).multiplyScalar(1.012);
    marker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), locationNormal);
    const markerDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.009, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    );
    marker.add(markerDot);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xe5f1ff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.014, 0.019, 40), pulseMaterial);
    pulse.position.z = 0.004;
    marker.add(pulse);
    earth.add(marker);
    scene.add(earth);

    const starCount = window.matchMedia("(max-width: 767px)").matches ? 180 : 440;
    let seed = 1729;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      const point = new THREE.Vector3(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1)
        .normalize()
        .multiplyScalar(25 + random() * 10);
      point.toArray(starPositions, index * 3);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0x8da1b8, size: 0.045, transparent: true, opacity: 0.43, sizeAttenuation: true }),
    );
    scene.add(stars);

    let disposed = false;
    const mapImage = new Image();
    mapImage.decoding = "async";
    mapImage.onload = () => {
      if (disposed) return;
      try {
        const previousGeometry = landPoints.geometry;
        landPoints.geometry = createLandPointGeometry(mapImage);
        if (previousGeometry.getAttribute("position")) previousGeometry.dispose();
      } catch {
        container.classList.add("earth-canvas--fallback");
        unavailable.current();
      }
    };
    mapImage.onerror = () => {
    container.appendChild(createFallback());
      container.classList.add("earth-canvas--fallback");
      unavailable.current();
    };
    mapImage.src = "/textures/earth/earth-daymap.jpg";

    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let idleRotation = 0;
    const idleQuaternion = new THREE.Quaternion();
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const render = (time: number) => {
      frame = 0;
      if (!visible || disposed) return;
      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0;
      previousTime = time;

      const amount = THREE.MathUtils.clamp(progress.current, 0, 1);
      if (!reducedMotion && (amount < 0.01 || amount > 0.99)) {
        idleRotation += delta * 0.008;
      }
      const pose = sceneAt(amount);
      const approachRotation = 1 - smooth(Math.min(1, amount / 0.16));
      const settleRotation = smooth(Math.max(0, Math.min(1, (amount - 0.92) / 0.08))) * 0.035;
      idleQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), idleRotation * (approachRotation + settleRotation));
      earth.quaternion.copy(pose.orientation).multiply(idleQuaternion);
      camera.position.set(0, 0, pose.distance);
      camera.lookAt(0, 0, 0);
      marker.visible = amount > 0.42;

      const line = locationLine.current;
      const anchor = locationAnchor.current;
      if (line && anchor) {
        const markerPosition = marker.getWorldPosition(new THREE.Vector3());
        const projected = markerPosition.clone().project(camera);
        const canvasBounds = canvas.getBoundingClientRect();
        const facingCamera = markerPosition.z > 0.05;
        const onScreen = projected.z >= -1 && projected.z <= 1;

        if (amount >= 2 / 3 && marker.visible && facingCamera && onScreen) {
          const anchorBounds = anchor.getBoundingClientRect();
          line.setAttribute("x1", String((projected.x * 0.5 + 0.5) * canvasBounds.width));
          line.setAttribute("y1", String((-projected.y * 0.5 + 0.5) * canvasBounds.height));
          line.setAttribute("x2", String(anchorBounds.left + anchorBounds.width / 2 - canvasBounds.left));
          line.setAttribute("y2", String(anchorBounds.top + anchorBounds.height / 2 - canvasBounds.top));
          line.style.visibility = "visible";
        } else {
          line.style.visibility = "hidden";
        }
      }

      orbitMaterials.forEach((material) => {
        material.opacity = 0.2 - amount * 0.1;
      });

      const pulsePhase = reducedMotion ? 0 : (time % 1800) / 1800;
      pulse.scale.setScalar(0.7 + pulsePhase * 0.7);
      pulseMaterial.opacity = amount > 0.42 ? 0.55 * (1 - pulsePhase) : 0;

      renderer.render(scene, camera);
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        previousTime = 0;
        if (visible && !frame) frame = requestAnimationFrame(render);
        if (!visible && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "120px" },
    );
    visibilityObserver.observe(container);

    return () => {
      disposed = true;
      visible = false;
      if (frame) cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      earthGeometry.dispose();
      earthMaterial.dispose();
      landPoints.geometry.dispose();
      landMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphere.dispose();
      orbitGeometries.forEach((geometry) => geometry.dispose());
      orbitMaterials.forEach((material) => material.dispose());
      orbitNodeGeometry.dispose();
      orbitNodeMaterial.dispose();
      starGeometry.dispose();
      (stars.material as THREE.Material).dispose();
      markerDot.geometry.dispose();
      (markerDot.material as THREE.Material).dispose();
      pulse.geometry.dispose();
      pulseMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [progress]);

  return <div ref={host} className="earth-canvas" aria-hidden="true" />;
}

function surfaceNormal(latitude: number, longitude: number, radius = 1) {
  const lat = THREE.MathUtils.degToRad(latitude);
  const lon = THREE.MathUtils.degToRad(longitude);
  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon),
    Math.sin(lat),
    -Math.cos(lat) * Math.sin(lon),
  ).multiplyScalar(radius);
}

function createFallback() {
  const fallback = document.createElement("div");
  fallback.className = "earth-canvas__fallback";
  fallback.setAttribute("role", "img");
  fallback.setAttribute("aria-label", "Earth centered on Southeast Asia");

  const marker = document.createElement("span");
  marker.className = "earth-canvas__fallback-marker";
  marker.style.left = `${(location.longitude / 180) * 100}%`;
  marker.style.top = `${((90 - location.latitude) / 180) * 100}%`;
  fallback.appendChild(marker);
  return fallback;
}

function createLandPointGeometry(image: HTMLImageElement) {
  const width = 1024;
  const height = 512;
  const map = document.createElement("canvas");
  map.width = width;
  map.height = height;
  const context = map.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is not available");

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const positions: number[] = [];
  const sizes: number[] = [];
  const brightness: number[] = [];
  const count = window.matchMedia("(max-width: 767px)").matches ? 70_000 : 140_000;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const y = 1 - (2 * (index + 0.5)) / count;
    const radius = Math.sqrt(1 - y * y);
    const angle = goldenAngle * index;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const latitude = Math.asin(y);
    const longitude = Math.atan2(-z, x);
    const u = (longitude + Math.PI) / (Math.PI * 2);
    const v = (Math.PI / 2 - latitude) / Math.PI;
    const pixel = (Math.min(height - 1, Math.floor(v * height)) * width + Math.min(width - 1, Math.floor(u * width))) * 4;
    const red = pixels[pixel] / 255;
    const green = pixels[pixel + 1] / 255;
    const blue = pixels[pixel + 2] / 255;

    if (blue > red * 1.16 && blue > green * 1.04) continue;

    const variation = Math.sin(index * 127.1) * 43758.5453;
    const random = variation - Math.floor(variation);
    positions.push(x * 1.003, y * 1.003, z * 1.003);
    sizes.push(0.72 + random * 0.48);
    brightness.push(0.58 + random * 0.36 + Math.min(0.08, (red + green + blue) / 38));
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("aBrightness", new THREE.Float32BufferAttribute(brightness, 1));
  return geometry;
}

function addOrbit(
  earth: THREE.Group,
  start: [number, number],
  end: [number, number],
  geometries: THREE.BufferGeometry[],
  materials: THREE.LineBasicMaterial[],
  nodeGeometry: THREE.SphereGeometry,
  nodeMaterial: THREE.MeshBasicMaterial,
) {
  const from = surfaceNormal(start[0], start[1], 1.012);
  const to = surfaceNormal(end[0], end[1], 1.012);
  const control = from.clone().add(to).normalize().multiplyScalar(1.22);
  const curve = new THREE.QuadraticBezierCurve3(from, control, to);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(72));
  const material = new THREE.LineBasicMaterial({ color: 0xd7dde5, transparent: true, opacity: 0.2 });
  const line = new THREE.Line(geometry, material);
  line.renderOrder = 2;
  earth.add(line);
  geometries.push(geometry);
  materials.push(material);

  for (const point of [from, to]) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.copy(point);
    earth.add(node);
  }
}