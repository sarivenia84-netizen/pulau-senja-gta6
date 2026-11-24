import * as THREE from "three";

export const CAR_NAMES = [
  "Ombak GT",
  "Sepat Badak",
  "Layar Kencana",
  "Rajawali Kota",
  "Kuda Laut",
  "Merapi Sport",
  "Cendrawasih",
  "Becak Baja",
  "Sagara RS",
  "Harimau Kota",
  "Puspa Touring",
  "Badai Selatan",
  "Komet Senja",
  "Benteng Tua",
];
const PAINT = [
  "#d87558",
  "#e4b64f",
  "#679b91",
  "#657ba0",
  "#c98791",
  "#d8d1bd",
  "#795c82",
  "#458080",
  "#c45d4c",
  "#8fa84b",
  "#65a7b5",
  "#be8b52",
  "#8874ad",
  "#7a8281",
];
const STATS = [30, 24, 27, 32, 22, 35, 29, 19, 38, 20, 26, 34, 40, 18];

export function createVehicles(scene, blockers, count = 14) {
  const cars = [];
  for (let i = 0; i < count; i++) {
    const group = new THREE.Group();
    const paint = new THREE.MeshStandardMaterial({
      color: PAINT[i % PAINT.length],
      roughness: 0.48,
      metalness: 0.25,
    });
    const glass = new THREE.MeshStandardMaterial({
      color: "#91b5b7",
      roughness: 0.25,
      metalness: 0.2,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.72, 4.1), paint);
    body.position.y = 0.68;
    group.add(body);
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.65, 0.72, 2.15),
      glass,
    );
    cabin.position.set(0, 1.34, -0.15);
    group.add(cabin);
    const wheels = [];
    for (const x of [-1, 1])
      for (const z of [-1.35, 1.35]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.22, 10),
          new THREE.MeshStandardMaterial({ color: "#252a31" }),
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.38, z);
        group.add(wheel);
        wheels.push(wheel);
      }
    const parking = [
      [0, 3.4],
      [40, -3.5],
      [-40, 3.5],
      [80, -3.5],
      [-80, 3.5],
      [120, -3.5],
      [-120, 3.5],
      [160, -3.5],
      [0, -43.5],
      [40, 43.5],
      [-40, -43.5],
      [80, 43.5],
      [-80, -43.5],
      [120, 43.5],
    ];
    const spot = parking[i % parking.length];
    group.position.set(spot[0], 0, spot[1]);
    group.rotation.y = Math.PI;
    scene.add(group);
    cars.push({
      group,
      name: CAR_NAMES[i % CAR_NAMES.length],
      speed: 0,
      maxSpeed: STATS[i % STATS.length],
      accel: 17 + (i % 4),
      occupied: false,
      npc: false,
      wheels,
      paint,
    });
  }
  return cars;
}

export function createTrafficCars(scene, templates, count = 10) {
  const traffic = [];
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const group = template.group.clone(true);
    const car = {
      ...template,
      group,
      wheels: group.children.filter(
        (child) => child.geometry?.type === "CylinderGeometry",
      ),
      npc: true,
      speed: 7,
      turnTimer: i * 0.37,
    };
    const lane = i % 2 ? -3.4 : 3.4;
    group.position.set(lane, 0, -160 + i * 31);
    group.rotation.y = i % 2 ? Math.PI : 0;
    scene.add(group);
    traffic.push(car);
  }
  return traffic;
}

export function collides(position, blockers, halfX = 1.2, halfZ = 2.2) {
  return blockers.some(
    (b) =>
      position.x + halfX > b.minX &&
      position.x - halfX < b.maxX &&
      position.z + halfZ > b.minZ &&
      position.z - halfZ < b.maxZ,
  );
}

export function updateVehicle(car, input, blockers, dt) {
  const accel = input.keys.has("KeyW")
    ? (car.accel ?? 17)
    : input.keys.has("KeyS")
      ? -22
      : 0;
  const crewBoost = performance.now() < (car.crewSpeedUntil ?? 0) ? 1.35 : 1;
  car.speed = THREE.MathUtils.clamp(
    car.speed + accel * crewBoost * dt,
    -9,
    car.maxSpeed ?? 30,
  );
  car.speed *= Math.exp(-dt * (accel ? 0.24 : 1.15));
  const steer =
    (input.keys.has("KeyA") ? 1 : 0) - (input.keys.has("KeyD") ? 1 : 0);
  if (Math.abs(car.speed) > 0.3)
    car.group.rotation.y +=
      steer *
      dt *
      1.45 *
      Math.sign(car.speed) *
      Math.min(1, Math.abs(car.speed) / 5);
  const next = car.group.position
    .clone()
    .add(
      new THREE.Vector3(
        Math.sin(car.group.rotation.y),
        0,
        Math.cos(car.group.rotation.y),
      ).multiplyScalar(car.speed * dt),
    );
  if (collides(next, blockers)) car.speed = 0;
  else car.group.position.copy(next);
  for (const wheel of car.wheels) wheel.rotation.x += (car.speed * dt) / 0.38;
}

export function updateTraffic(car, dt, blockers, cityEdge) {
  car.speed = 7;
  car.turnTimer = (car.turnTimer ?? 0) + dt;
  const pos = car.group.position;
  const heading = car.group.rotation.y;
  const front = new THREE.Vector3(Math.sin(heading), 0, Math.cos(heading));
  const alongX = Math.abs(front.x) > Math.abs(front.z);
  const intersectionAxis = alongX ? pos.x : pos.z;
  const intersection = Math.round(intersectionAxis / 40) * 40;
  if (
    Math.abs(intersectionAxis - intersection) < car.speed * dt + 0.12 &&
    car.turnTimer > 3
  ) {
    if (Math.sin(car.turnTimer * 13 + car.group.position.x) > 0.55) {
      car.group.rotation.y += Math.PI / 2;
      if (alongX)
        pos.z = Math.round(pos.z / 40) * 40 + Math.sign(pos.z || 1) * 3.4;
      else pos.x = Math.round(pos.x / 40) * 40 + Math.sign(pos.x || 1) * 3.4;
    }
    car.turnTimer = 0;
  }
  const next = pos.clone().addScaledVector(front, car.speed * dt);
  const halfX = Math.abs(front.x) > Math.abs(front.z) ? 2.2 : 1.2;
  const halfZ = Math.abs(front.x) > Math.abs(front.z) ? 1.2 : 2.2;
  if (
    Math.abs(next.x) > cityEdge - 5 ||
    Math.abs(next.z) > cityEdge - 5 ||
    collides(next, blockers, halfX, halfZ)
  )
    car.group.rotation.y += Math.PI;
  else pos.copy(next);
}
