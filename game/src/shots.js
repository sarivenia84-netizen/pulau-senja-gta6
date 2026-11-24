import * as THREE from 'three';

const scenes = {
  1: { hour: 22.4, position: [-3, 0.75, 0], yaw: 0, pitch: 0.12, cameraDistance: 12, wanted: 3 },
  2: { hour: 17.4, position: [0, 0.75, 0], yaw: 0.25, pitch: 0.12, cameraDistance: 22, wanted: 0 },
  3: { hour: 22.1, position: [0, 0.75, 0], yaw: -0.3, pitch: 0.12, cameraDistance: 22, wanted: 0 },
  4: { hour: 18.1, ped: 0, yaw: 0, pitch: 0.08, cameraDistance: 8, wanted: 0 },
};

export function setupShot({ search, player, peds, input, police, setWanted, camera }) {
  const number = Number(new URLSearchParams(search).get('shot'));
  const shot = scenes[number];
  if (!shot) return null;
  let target;
  if (shot.position) {
    player.position.fromArray(shot.position);
    target = player.position;
  } else {
    const ped = peds[shot.ped];
    ped.root.position.set(-4, 0.25, 0);
    ped.root.rotation.y = 0;
    player.position.set(0, 0.75, 0);
    target = player.position;
  }
  input.yaw = shot.yaw;
  input.pitch = shot.pitch;
  setWanted(police, shot.wanted);
  if (camera) {
    camera.position.set(target.x, target.y + (number === 4 ? 3.2 : 5.5), target.z + shot.cameraDistance);
    camera.lookAt(target.x, target.y + (number === 4 ? 1.3 : 1), target.z - (number === 1 ? 8 : 0));
  }
  return { number, hour: shot.hour };
}

export function shotDialogue(number) {
  return number === 4 ? { speaker: 'Nadia', text: 'Permisi, saya mencari jalan ke Pelabuhan Tua.' } : null;
}
