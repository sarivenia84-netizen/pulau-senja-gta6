import * as THREE from "three";
import { DAY_SECONDS } from "./config.js";

export function createEnvironment(scene) {
  const sky = document.createElement("canvas");
  sky.width = 4;
  sky.height = 256;
  const ctx = sky.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "#61799e");
  gradient.addColorStop(0.47, "#dc9eac");
  gradient.addColorStop(0.76, "#ffcf9b");
  gradient.addColorStop(1, "#f4dcb7");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 4, 256);
  const texture = new THREE.CanvasTexture(sky);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1300, 32, 20),
    new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    }),
  );
  scene.add(dome);
  const sun = new THREE.DirectionalLight(0xffd9a0, 2.2);
  sun.position.set(-150, 170, -90);
  scene.add(sun, sun.target);
  const hemisphere = new THREE.HemisphereLight(0xffe1c4, 0x6a727e, 2.2);
  scene.add(hemisphere);
  const fog = new THREE.FogExp2(0xf4b4a2, 0.0022);
  scene.fog = fog;
  const night = new THREE.Color(0x26344f);
  const dusk = new THREE.Color(0xf4b4a2);
  function update(elapsed, offset = 17.2) {
    const hour = (offset + (elapsed * 24) / DAY_SECONDS) % 24;
    const daylight = Math.max(0, Math.sin(((hour - 6) / 12) * Math.PI));
    const twilight = Math.max(0, Math.min(1, daylight * 3));
    sun.intensity = 0.15 + 2.05 * daylight;
    hemisphere.intensity = 0.5 + 1.7 * daylight;
    sun.position.set(
      Math.cos(((hour - 6) * Math.PI) / 12) * 210,
      Math.max(-40, Math.sin(((hour - 6) * Math.PI) / 12) * 180),
      -100,
    );
    fog.color.copy(night).lerp(dusk, twilight);
    fog.density = 0.0032 - twilight * 0.001;
    dome.material.color.setRGB(
      0.23 + twilight * 0.77,
      0.28 + twilight * 0.72,
      0.43 + twilight * 0.57,
    );
    return hour;
  }
  update(0);
  return { update, sun, hemisphere };
}
