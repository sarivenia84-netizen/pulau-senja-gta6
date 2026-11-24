import * as THREE from "three";
import { CITY_EDGE } from "./config.js";

export function createPeds(scene, count = 24) {
  const peds = [];
  const palette = ["#d97f65", "#5f8790", "#d8bd75", "#a880a0", "#638b6c"];
  for (let i = 0; i < count; i++) {
    const root = new THREE.Group();
    const clothes = new THREE.MeshStandardMaterial({
      color: palette[i % palette.length],
    });
    const skin = new THREE.MeshStandardMaterial({ color: "#b77d64" });
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.9, 0.34),
      clothes,
    );
    torso.position.y = 1.25;
    root.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), skin);
    head.position.y = 1.9;
    root.add(head);
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.7, 0.2),
        clothes,
      );
      leg.position.set(side * 0.15, 0.45, 0);
      root.add(leg);
    }
    const axis = i % 2 ? "x" : "z";
    const sidewalk = i % 4 < 2 ? -7.2 : 7.2;
    const street = ((Math.floor(i / 4) % 9) - 4) * 40;
    const block = ((Math.floor(i / 2) % 5) - 2) * 40;
    const along = block + (i % 2 ? -14 : 14);
    root.position.set(
      axis === "z" ? street + sidewalk : along,
      0.25,
      axis === "x" ? street + sidewalk : along,
    );
    scene.add(root);
    peds.push({
      root,
      axis,
      direction: i % 2 ? 1 : -1,
      phase: i * 0.7,
      bounds: [block - 16, block + 16],
    });
  }
  return peds;
}

export function tickPeds(peds, dt, cityEdge) {
  for (const ped of peds) {
    ped.phase += dt * 5;
    ped.root.position[ped.axis] += ped.direction * dt * 1.1;
    if (
      ped.root.position[ped.axis] < ped.bounds[0] ||
      ped.root.position[ped.axis] > ped.bounds[1]
    ) {
      ped.direction *= -1;
      ped.root.position[ped.axis] = THREE.MathUtils.clamp(
        ped.root.position[ped.axis],
        ...ped.bounds,
      );
    }
    ped.root.rotation.y =
      ped.axis === "x"
        ? ped.direction > 0
          ? Math.PI / 2
          : -Math.PI / 2
        : ped.direction > 0
          ? 0
          : Math.PI;
    for (let i = 2; i < ped.root.children.length; i++)
      ped.root.children[i].rotation.x =
        Math.sin(ped.phase) * 0.34 * (i === 2 ? 1 : -1);
  }
}
