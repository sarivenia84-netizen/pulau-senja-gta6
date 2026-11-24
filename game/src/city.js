import * as THREE from 'three';
import { BLOCK, ROAD, HALF_BLOCKS, CITY_EDGE, WATER_EDGE, DISTRICTS } from './config.js';
import { random, between, pick } from './random.js';

const rng = random(602);
const box = new THREE.BoxGeometry(1, 1, 1);
const colors = ['#e8aeaa', '#f0cfb1', '#b4c5bc', '#f1d6ba', '#b5bcca', '#d9a9a6', '#c9c1b4', '#e7c19d'];
const material = (color, options = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...options });
const pavement = material('#d7bdac');
const roadMat = material('#596371');
const sandMat = material('#e9d3a9');
const markingMat = material('#f4dbb0', { emissive: '#785735', emissiveIntensity: 0.14 });
const grassMat = material('#8eaa8b');
const trunkMat = material('#926b56');
const leafMat = material('#5b967b', { side: THREE.DoubleSide });
const metalMat = material('#f2d4bd', { metalness: 0.22, roughness: 0.64 });

function cube(group, width, height, depth, mat, x, y, z) {
  const mesh = new THREE.Mesh(box, mat);
  mesh.position.set(x, y, z);
  mesh.scale.set(width, height, depth);
  group.add(mesh);
  return mesh;
}

function windows() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e6c4ae';
  ctx.fillRect(0, 0, 256, 512);
  for (let y = 16; y < 512; y += 39) {
    for (let x = 14; x < 256; x += 40) {
      ctx.fillStyle = rng() < 0.25 ? '#ffe3a0' : pick(rng, ['#667e8d', '#83909a', '#72858d']);
      ctx.fillRect(x, y, 23, 25);
      ctx.fillStyle = '#e7d4ba';
      ctx.fillRect(x + 10, y, 2, 25);
      ctx.fillStyle = '#fff0d0';
      ctx.fillRect(x - 2, y + 25, 28, 3);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function palm(group, x, z, scale = 1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.32 * scale, 6 * scale, 6), trunkMat);
  trunk.position.set(x, 3 * scale, z);
  trunk.rotation.z = 0.09;
  group.add(trunk);
  const top = new THREE.Vector3(x - 0.25 * scale, 6 * scale, z);
  for (let i = 0; i < 7; i++) {
    const angle = i * Math.PI * 2 / 7;
    const tip = new THREE.Vector3(top.x + Math.cos(angle) * 3.6 * scale, top.y - 1.6 * scale, top.z + Math.sin(angle) * 3.6 * scale);
    const middle = new THREE.Vector3(top.x + Math.cos(angle) * 1.8 * scale, top.y + 0.45 * scale, top.z + Math.sin(angle) * 1.8 * scale);
    const side = new THREE.Vector3(-Math.sin(angle) * 0.53 * scale, 0, Math.cos(angle) * 0.53 * scale);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([...top.toArray(), ...middle.clone().add(side).toArray(), ...tip.toArray(), ...top.toArray(), ...tip.toArray(), ...middle.clone().sub(side).toArray()], 3));
    geometry.computeVertexNormals();
    group.add(new THREE.Mesh(geometry, leafMat));
  }
}

function ferrisWheel(group, x, z) {
  const radius = 15;
  const wheel = new THREE.Group();
  wheel.position.set(x, 20, z);
  wheel.rotation.y = 0.32;
  group.add(wheel);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.24, 8, 64), metalMat);
  wheel.add(rim);
  const center = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 8), material('#f7ae88'));
  wheel.add(center);
  for (let i = 0; i < 12; i++) {
    const angle = Math.PI * 2 * i / 12;
    const point = new THREE.Vector3(Math.sin(angle) * radius, Math.cos(angle) * radius, 0);
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, radius, 5), metalMat);
    bar.position.copy(point).multiplyScalar(0.5);
    bar.rotation.z = -angle;
    wheel.add(bar);
    cube(wheel, 2.6, 2, 2.1, material(pick(rng, ['#ec9c91', '#a6cbbf', '#f2d399', '#b8b4cb'])), point.x, point.y - 1.1, point.z);
  }
  for (const side of [-1, 1]) {
    const support = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 22, 8), metalMat);
    support.position.set(x + side * 5, 10.5, z);
    support.rotation.z = side * 0.47;
    group.add(support);
  }
}

export function createCity(scene) {
  const city = new THREE.Group();
  scene.add(city);
  const blockers = [];
  cube(city, CITY_EDGE * 2 + 40, 1, CITY_EDGE * 2 + 40, grassMat, 0, -0.85, 0);
  cube(city, WATER_EDGE - CITY_EDGE + 12, 0.2, CITY_EDGE * 2 + 40, sandMat, CITY_EDGE + 18, -0.13, 0);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1300, 1300), new THREE.MeshStandardMaterial({ color: '#72b3bc', metalness: 0.28, roughness: 0.28, transparent: true, opacity: 0.9 }));
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(WATER_EDGE + 660, -0.24, 0);
  city.add(sea);
  for (let i = -HALF_BLOCKS; i <= HALF_BLOCKS; i++) {
    const coordinate = i * BLOCK;
    cube(city, ROAD, 0.045, CITY_EDGE * 2 + 30, roadMat, coordinate, 0.02, 0);
    cube(city, CITY_EDGE * 2 + 30, 0.045, ROAD, roadMat, 0, 0.025, coordinate);
    for (let j = -HALF_BLOCKS; j < HALF_BLOCKS; j++) {
      const at = (j + 0.5) * BLOCK;
      cube(city, 0.17, 0.015, 3.2, markingMat, coordinate, 0.055, at - 9);
      cube(city, 3.2, 0.015, 0.17, markingMat, at - 9, 0.055, coordinate);
    }
  }
  const windowTexture = windows();
  const facadeMaterials = colors.map(color => [material(color), new THREE.MeshStandardMaterial({ map: windowTexture, color, roughness: 0.86, emissive: '#edb879', emissiveMap: windowTexture, emissiveIntensity: 0.10 })]);
  for (let gx = -HALF_BLOCKS; gx < HALF_BLOCKS; gx++) {
    for (let gz = -HALF_BLOCKS; gz < HALF_BLOCKS; gz++) {
      const cx = (gx + 0.5) * BLOCK;
      const cz = (gz + 0.5) * BLOCK;
      cube(city, BLOCK - ROAD - 2, 0.25, BLOCK - ROAD - 2, pavement, cx, 0.16, cz);
      const beach = gx >= 2;
      if (beach && gz === 1) {
        ferrisWheel(city, cx, cz);
        continue;
      }
      if (beach && rng() < 0.38) {
        for (let p = 0; p < 5; p++) palm(city, cx + between(rng, -11, 11), cz + between(rng, -11, 11), between(rng, 0.7, 1.2));
        continue;
      }
      const count = rng() < 0.5 ? 1 : 2;
      for (let b = 0; b < count; b++) {
        const width = count === 1 ? between(rng, 15, 24) : between(rng, 9, 12);
        const depth = count === 1 ? between(rng, 15, 24) : between(rng, 15, 22);
        const height = between(rng, 8, beach ? 23 : 40);
        const x = cx + (count === 1 ? 0 : (b === 0 ? -7 : 7));
        const z = cz + between(rng, -2, 2);
        const [roof, facade] = pick(rng, facadeMaterials);
        const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), [facade, facade, roof, roof, facade, facade]);
        building.position.set(x, height / 2 + 0.3, z);
        city.add(building);
        cube(city, width + 0.9, 0.48, depth + 0.9, roof, x, height + 0.5, z);
        if (height > 22) cube(city, width * 0.35, 1.3, depth * 0.32, roof, x, height + 1.4, z);
        blockers.push({ minX: x - width / 2, maxX: x + width / 2, minZ: z - depth / 2, maxZ: z + depth / 2 });
      }
      if (rng() < 0.82) palm(city, cx + 14, cz + 13, between(rng, 0.7, 1));
      if (rng() < 0.48) palm(city, cx - 13, cz - 13, between(rng, 0.7, 1));
    }
  }
  for (let z = -CITY_EDGE; z <= CITY_EDGE; z += 13) {
    palm(city, CITY_EDGE + 7 + between(rng, -2, 2), z + between(rng, -3, 3), between(rng, 0.85, 1.35));
  }
  for (const district of DISTRICTS) {
    const cx = district.x * 100;
    const cz = district.z * 100;
    const post = material('#475969');
    cube(city, 0.4, 5, 0.4, post, cx + 5, 2.5, cz + 5);
    cube(city, 6, 1, 0.25, material('#f4d0b0', { emissive: '#cf8063', emissiveIntensity: 0.3 }), cx + 5, 5.1, cz + 5);
  }
  return { blockers, group: city, districts: DISTRICTS };
}
