import * as THREE from 'three';

const TYPES = [
  { name: 'CRUISER', speed: 13, scale: 1, color: 0xf0eee1 },
  { name: 'SUV', speed: 10, scale: 1.18, color: 0xd9e2e0 },
];

function makeCar(scene, type) {
  const group = new THREE.Group();
  const paint = new THREE.MeshStandardMaterial({ color: type.color, roughness: 0.42, metalness: 0.25 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x203748, roughness: 0.28, metalness: 0.2 });
  const red = new THREE.MeshStandardMaterial({ color: 0xe34d4d, emissive: 0x8e1010 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x4298ef, emissive: 0x164d91 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2 * type.scale, 0.72 * type.scale, 4.5 * type.scale), paint);
  body.position.y = 0.72 * type.scale; group.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.65 * type.scale, 0.7 * type.scale, 2.1 * type.scale), dark);
  cabin.position.set(0, 1.35 * type.scale, -0.15); group.add(cabin);
  for (const x of [-0.63, 0.63]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.25), x < 0 ? red : blue);
    lamp.position.set(x, 1.12 * type.scale, 0.2); group.add(lamp);
  }
  scene.add(group);
  return group;
}

function makeHeli(scene) {
  const group = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x34485a, roughness: 0.5 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x9fc4cf, metalness: 0.3, roughness: 0.2 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.15, 10, 7), bodyMat);
  body.scale.set(1.25, 0.72, 1.6); group.add(body);
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.05), glass);
  cockpit.position.set(0, 0.1, 1.35); group.add(cockpit);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 3.2), bodyMat);
  tail.position.set(0, 0.15, -2.7); group.add(tail);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.55, 8), bodyMat);
  mast.position.y = 1; group.add(mast);
  const rotor = new THREE.Group(); rotor.position.y = 1.3;
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0x25323c });
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 7), bladeMat);
    blade.rotation.y = i * Math.PI / 2; rotor.add(blade);
  }
  group.add(rotor);
  const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.12), bladeMat);
  tailRotor.position.set(0, 0.4, -4.25); group.add(tailRotor);
  const spot = new THREE.SpotLight(0xffedba, 38, 65, Math.PI / 8, 0.45, 1.4);
  spot.position.set(0, -0.35, 0.3); spot.target.position.set(0, -12, 7);
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(7, 18, 16, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffedba, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }),
  );
  const beamDirection = new THREE.Vector3(0, -12, 7).normalize();
  beam.position.copy(spot.position).addScaledVector(beamDirection, 9);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), beamDirection);
  group.add(spot, spot.target, beam);
  scene.add(group);
  return { group, rotor, spot, beam };
}

export function createPolice(scene, wanted = 0) {
  const heli = makeHeli(scene);
  const units = [];
  const state = { scene, wanted: 0, units, heli, escaped: 0, lastRam: 0 };
  setWanted(state, wanted);
  return state;
}

function setWanted(state, value) {
  state.wanted = THREE.MathUtils.clamp(Math.floor(value), 0, 5);
  const desired = state.wanted === 0 ? 0 : Math.min(5, state.wanted + 1);
  while (state.units.length < desired) {
    const index = state.units.length;
    const type = TYPES[index % TYPES.length];
    const group = makeCar(state.scene, type);
    state.units.push({ group, type, status: 'IN SIGHT', speed: 0 });
  }
  while (state.units.length > desired) {
    const unit = state.units.pop();
    state.scene.remove(unit.group);
  }
  state.heli.group.visible = state.wanted >= 3;
}

export function raiseWanted(state, amount = 1) {
  setWanted(state, Math.min(5, state.wanted + amount));
}

export function updatePolice(state, target, dt, hour, currentSpeed = 0) {
  const now = performance.now() / 1000;
  for (let i = 0; i < state.units.length; i++) {
    const unit = state.units[i];
    if (!unit.initialized) {
      unit.group.position.set(target.x + 28 + i * 8, 0, target.z + 30 + i * 5);
      unit.initialized = true;
    }
  }
  if (state.wanted > 0) {
    const distance = Math.min(...state.units.map(unit => unit.group.position.distanceTo(target)), Infinity);
    if (distance > 48) state.escaped += dt;
    else state.escaped = Math.max(0, state.escaped - dt * 0.8);
    if (state.escaped > 14) {
      setWanted(state, state.wanted - 1);
      state.escaped = 0;
    }
  }
  for (let i = 0; i < state.units.length; i++) {
    const unit = state.units[i];
    const pos = unit.group.position;
    const dx = target.x - pos.x, dz = target.z - pos.z;
    const dist = Math.hypot(dx, dz);
    const heading = Math.atan2(dx, dz);
    const angle = Math.atan2(Math.sin(heading - unit.group.rotation.y), Math.cos(heading - unit.group.rotation.y));
    unit.group.rotation.y += THREE.MathUtils.clamp(angle, -dt * 1.8, dt * 1.8);
    unit.speed = THREE.MathUtils.lerp(unit.speed, unit.type.speed, dt * 0.8);
    const pit = dist < 5 && currentSpeed > 3 && now - state.lastRam > 2.5;
    const move = unit.speed * dt * (pit ? 1.8 : 1);
    pos.x += Math.sin(unit.group.rotation.y) * move;
    pos.z += Math.cos(unit.group.rotation.y) * move;
    if (pit) { state.lastRam = now; unit.status = 'PIT'; }
    else if (dist < 12 && i > 0) unit.status = 'BOX';
    else if (i > 0 && Math.abs(angle) < 0.65 && dist < 42) unit.status = 'FLANKING';
    else if (dist < 65) unit.status = 'IN SIGHT';
    else unit.status = 'SEARCHING';
    unit.group.position.y = 0;
  }
  const heli = state.heli;
  heli.group.visible = state.wanted >= 3;
  if (heli.group.visible) {
    const orbit = now * 0.2;
    heli.group.position.set(target.x + Math.cos(orbit) * 7, 9 + Math.sin(now * 2) * 0.5, target.z + Math.sin(orbit) * 7);
    heli.group.lookAt(target.x, 0, target.z);
    heli.rotor.rotation.y += dt * 18;
    heli.spot.intensity = hour < 6 || hour > 18 ? 42 : 0;
  }
}

export function policeHud(state) {
  return state.units.map(unit => ({ x: unit.group.position.x, z: unit.group.position.z, status: unit.status, name: unit.type.name }));
}
export function getPoliceStatus(state) { return state.units.map(unit => `${unit.type.name} · ${unit.status}`); }
export function setPoliceWanted(state, value) { setWanted(state, value); }
export default createPolice;
