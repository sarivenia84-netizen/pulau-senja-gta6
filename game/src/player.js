import * as THREE from "three";

export function shootRaycast(
  camera,
  targets,
  weapon = 1,
  pointer = { x: 0.5, y: 0.5 },
) {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(
    new THREE.Vector2(pointer.x * 2 - 1, 1 - pointer.y * 2),
    camera,
  );
  const hits = raycaster.intersectObjects(targets, true);
  if (!hits.length) return null;
  let target = hits[0].object;
  while (target.parent && target.userData.health === undefined)
    target = target.parent;
  if (target.userData.health === undefined) return null;
  const damage = [25, 12, 40, 0][weapon - 1] ?? 25;
  target.userData.health = Math.max(0, target.userData.health - damage);
  if (target.userData.health === 0) target.visible = false;
  return target;
}

export function createPlayer(scene) {
  // Create a simple player representation (a cube for now)
  const geometry = new THREE.BoxGeometry(0.5, 1.5, 0.5);
  const material = new THREE.MeshPhongMaterial({
    color: 0x00ff00, // Green player character
    shininess: 30,
  });

  const player = new THREE.Mesh(geometry, material);
  player.position.set(0, 0.75, 0);
  scene.add(player);

  // Store player properties
  player.velocity = new THREE.Vector3();
  player.speed = 5; // Movement speed in units/sec
  player.jumpForce = 8;
  player.onGround = false;

  return player;
}

export function updatePlayer(player, input, blockers, dt, cityEdge) {
  // Handle WASD movement
  const moveSpeed = player.speed * dt;
  const rotation = new THREE.Euler(0, input.yaw, 0);

  if (input.keys.has("KeyW") || input.keys.has("ArrowUp")) {
    player.position.x += Math.sin(input.yaw) * moveSpeed;
    player.position.z += Math.cos(input.yaw) * moveSpeed;
  }
  if (input.keys.has("KeyS") || input.keys.has("ArrowDown")) {
    player.position.x -= Math.sin(input.yaw) * moveSpeed;
    player.position.z -= Math.cos(input.yaw) * moveSpeed;
  }
  if (input.keys.has("KeyA") || input.keys.has("ArrowLeft")) {
    player.position.x += Math.sin(input.yaw - Math.PI / 2) * moveSpeed;
    player.position.z += Math.cos(input.yaw - Math.PI / 2) * moveSpeed;
  }
  if (input.keys.has("KeyD") || input.keys.has("ArrowRight")) {
    player.position.x += Math.sin(input.yaw + Math.PI / 2) * moveSpeed;
    player.position.z += Math.cos(input.yaw + Math.PI / 2) * moveSpeed;
  }

  // Apply gravity
  player.velocity.y -= 9.81 * dt;
  player.position.y += player.velocity.y * dt;

  // Simple ground collision
  if (player.position.y < 0.75) {
    player.position.y = 0.75;
    player.velocity.y = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // Clamp player position to city bounds
  player.position.x = THREE.MathUtils.clamp(
    player.position.x,
    -cityEdge,
    cityEdge,
  );
  player.position.z = THREE.MathUtils.clamp(
    player.position.z,
    -cityEdge,
    cityEdge,
  );

  // Update player rotation based on mouse look
  player.rotation.y = input.yaw;
}

export function nearbyVehicle(player, vehicles, distance = 5) {
  let nearest = null;
  for (const vehicle of vehicles) {
    const gap = player.position.distanceTo(vehicle.group.position);
    if (gap < distance && (!nearest || gap < nearest.gap))
      nearest = { vehicle, gap };
  }
  return nearest?.vehicle ?? null;
}

export function enterVehicle(player, vehicle) {
  player.visible = false;
  vehicle.occupied = true;
  player.position.copy(vehicle.group.position);
}

export function leaveVehicle(player, vehicle) {
  player.visible = true;
  vehicle.occupied = false;

  // Position player near vehicle when exiting
  const side = new THREE.Vector3(1.8, 0, 0).applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    vehicle.group.rotation.y,
  );
  player.position.copy(vehicle.group.position).add(side);
}
