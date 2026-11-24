import * as THREE from 'three';
import { createCity } from './city.js';
import { createEnvironment } from './environment.js';
import { createInput } from './input.js';
import { CITY_EDGE } from './config.js';
import { createPlayer, updatePlayer, nearbyVehicle, enterVehicle, leaveVehicle, shootRaycast } from './player.js';
import { createVehicles, createTrafficCars, updateVehicle } from './vehicles.js';
import { tickTraffic } from './traffic.js';
import { createPeds, tickPeds } from './peds.js';
import { createMissions } from './missions.js';
import { createHud } from './hud.js';
import { createAudio } from './audio.js';
import { loadGame, saveGame } from './save.js';
import { createMenu } from './menu.js';
import { getDialogue } from './story.js';
import { createPolice, updatePolice, policeHud, raiseWanted, setPoliceWanted, getPoliceStatus } from './police.js';
import { setupShot, shotDialogue } from './shots.js';

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(67, window.innerWidth / window.innerHeight, 0.1, 1500);
const environment = createEnvironment(scene);
const city = createCity(scene);
const input = createInput(renderer.domElement);
const player = createPlayer(scene);
const vehicles = createVehicles(scene, city.blockers, 8);
const traffic = createTrafficCars(scene, vehicles, 10);
const peds = createPeds(scene);
const query = new URLSearchParams(location.search);
const save = loadGame();
if (save) player.position.set(save.x, 0.75, save.z);
let money = save?.money ?? 1250;
let respect = save?.respect ?? 0;
const missions = createMissions({
  player,
  query,
  initialMission: save?.mission ?? 0,
  onComplete(mission) {
    money += mission.reward;
    respect += mission.respect;
  },
});
const hud = createHud();
const audio = createAudio();
const police = createPolice(scene, Number(query.get('wanted')) || 0);
let wanted = police.wanted;
const clock = new THREE.Clock();
const focus = new THREE.Vector3();
const targetCamera = new THREE.Vector3();
const shotSetup = setupShot({ search: location.search, player, peds, input, police, setWanted: setPoliceWanted, camera });
const startHour = shotSetup?.hour ?? (Number(query.get('hour')) || 17.2);
let driven = null;
if (shotSetup?.number === 1) {
  const chaseCar = vehicles[0];
  chaseCar.group.position.set(-3, 0, 3.5);
  chaseCar.group.rotation.y = Math.PI;
  enterVehicle(player, chaseCar);
  driven = chaseCar;
}
let toggleWasDown = false;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  const toggleDown = input.keys.has('KeyF');
  if (toggleDown && !toggleWasDown) {
    if (driven) {
      leaveVehicle(player, driven);
      driven = null;
    } else {
      const candidate = nearbyVehicle(player, vehicles.filter(car => !car.npc && !car.occupied));
      if (candidate) {
        driven = candidate;
        enterVehicle(player, driven);
      }
    }
  }
  toggleWasDown = toggleDown;
  if (driven) updateVehicle(driven, input, city.blockers, dt);
  else updatePlayer(player, input, city.blockers, dt, CITY_EDGE);
  tickTraffic(traffic, dt, city.blockers, CITY_EDGE);
  tickPeds(peds, dt, CITY_EDGE);

  const target = driven ? driven.group.position : player.position;
  updatePolice(police, target, dt, startHour, driven?.speed ?? 0);
  wanted = police.wanted;
  const distance = driven ? 16 : 22;
  targetCamera.set(target.x - Math.sin(input.yaw) * distance * Math.cos(input.pitch), target.y + (driven ? 3 : 4) + Math.sin(input.pitch) * distance, target.z - Math.cos(input.yaw) * distance * Math.cos(input.pitch));
  camera.position.lerp(targetCamera, Math.min(1, dt * 5));
  focus.set(target.x, target.y + (driven ? 1.2 : 4), target.z);
  camera.lookAt(focus);
  if (shotSetup?.number === 1 && police.heli.group.visible) {
    const heliPosition = camera.position.clone().add(new THREE.Vector3(-2.5, 5, -32).applyQuaternion(camera.quaternion));
    police.heli.group.position.copy(heliPosition);
    police.heli.group.lookAt(target.x, target.y, target.z);
    police.heli.spot.intensity = 42;
  }
  const hour = environment.update(clock.elapsedTime, startHour);
  const missionCompleted = missions.update();
  if (missionCompleted) saveGame({ money, respect, mission: missions.current.index, player });
  const mission = missions.current;
  audio.update(driven?.speed ?? 0, wanted);
  const dialogue = shotDialogue(shotSetup?.number) ?? getDialogue(mission.index)?.[0] ?? null;
  hud.render({ player, vehicle: driven, mission, money, respect, wanted, hour, weapon: hud.weapon, dialogue, police: policeHud(police), policeStatus: getPoliceStatus(police) });
  if (wanted !== police.wanted) wanted = police.wanted;
  if (Math.floor(clock.elapsedTime) !== Math.floor(clock.elapsedTime - dt)) saveGame({ money, respect, mission: mission.index, player });
  renderer.render(scene, camera);
}
camera.position.set(-16, 13, -18);
frame();
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener('keyup', event => {
  if (event.code === 'KeyF') toggleWasDown = false;
});

const hint = document.querySelector('#hint');
if (hint) hint.textContent = 'W A S D · JELAJAHI / KEMUDIKAN  ·  SHIFT LARI  ·  F MASUK/KELUAR  ·  KLIK TEMBAK';
window.pulauSenja = { camera, player, vehicles, traffic, peds, police, hud, audio, get driven() { return driven; }, get wanted() { return wanted; }, set wanted(value) { setPoliceWanted(police, value); wanted = police.wanted; } };

window.addEventListener('keydown', event => {
  if (event.code === 'Enter' && missions.current.complete && missions.advance()) {
    saveGame({ money, respect, mission: missions.current.index, player });
  }
  if (event.code === 'Escape') {
    if (document.querySelector('#ps-menu')) return;
    createMenu({
      onStart() {},
      onSave() { saveGame({ money, respect, mission: missions.current.index, player }); },
      onLoad() {
        const state = loadGame();
        if (!state) return false;
        money = state.money; respect = state.respect;
        player.position.set(state.x, 0.75, state.z);
        return true;
      },
    });
  }
});
window.addEventListener('beforeunload', () => saveGame({ money, respect, mission: missions.current.index, player }));
let mouseDown = false;
renderer.domElement.addEventListener('pointerdown', event => {
  if (event.button !== 0 || mouseDown || driven) return;
  mouseDown = true;
  const targets = [...peds.map(ped => { ped.root.userData.health ??= 100; return ped.root; }), ...traffic.map(car => { car.group.userData.health ??= 100; return car.group; })];
  const hit = shootRaycast(camera, targets, hud.weapon, { x: event.clientX / innerWidth, y: event.clientY / innerHeight });
  if (hit) raiseWanted(police, 1);
  wanted = police.wanted;
  audio.playShot();
});
window.addEventListener('pointerup', () => { mouseDown = false; });
if (!query.has('shot') && !query.has('wanted') && !query.has('mission')) createMenu({ onStart() {} });
hud.render({ player, vehicle: null, mission: missions.current, money, respect, wanted, hour: startHour, policeStatus: getPoliceStatus(police), police: policeHud(police) });
