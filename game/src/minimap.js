import { CITY_EDGE, BLOCK, DISTRICTS } from './config.js';

export function createMinimap() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 220;
  canvas.setAttribute('aria-label', 'Peta Pulau Senja');
  Object.assign(canvas.style, { width: '220px', height: '220px', borderRadius: '50%', border: '2px solid rgba(255,239,211,.8)', boxShadow: '0 5px 24px #17212a99' });
  function draw(player, mission, police = [], missions = []) {
    const ctx = canvas.getContext('2d');
    const scale = 95 / (CITY_EDGE * 2);
    ctx.clearRect(0, 0, 220, 220);
    ctx.save(); ctx.beginPath(); ctx.arc(110, 110, 108, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#477879'; ctx.fillRect(0, 0, 220, 220);
    ctx.fillStyle = '#d9bd91'; ctx.fillRect(190, 0, 30, 220);
    ctx.fillStyle = '#bdad9a';
    for (let x = -CITY_EDGE; x <= CITY_EDGE; x += BLOCK) {
      const px = 110 + (x - player.position.x) * scale;
      ctx.fillRect(px - 2.5, 0, 5, 220);
    }
    for (let z = -CITY_EDGE; z <= CITY_EDGE; z += BLOCK) {
      const py = 110 + (z - player.position.z) * scale;
      ctx.fillRect(0, py - 2.5, 220, 5);
    }
    ctx.fillStyle = '#f5c46e'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center'; ctx.fillText('N', 110, 18);
    for (const district of DISTRICTS) {
      ctx.fillStyle = '#fff2d8aa'; ctx.font = '8px Arial';
      ctx.fillText(district.name.toUpperCase(), 110 + district.x * 34, 110 + district.z * 34);
    }
    for (const objective of missions) {
      const x = 110 + (objective.target[0] - player.position.x) * scale;
      const y = 110 + (objective.target[2] - player.position.z) * scale;
      ctx.fillStyle = objective.index === mission?.index ? '#ffd15c' : '#fff2d8';
      ctx.beginPath(); ctx.arc(x, y, objective.index === mission?.index ? 5 : 2.5, 0, Math.PI * 2); ctx.fill();
    }
    if (mission) {
      const x = 110 + (mission.target[0] - player.position.x) * scale;
      const y = 110 + (mission.target[2] - player.position.z) * scale;
      ctx.strokeStyle = '#ffd15c'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.stroke();
    }
    for (const cop of police) {
      const x = 110 + (cop.x - player.position.x) * scale;
      const y = 110 + (cop.z - player.position.z) * scale;
      ctx.fillStyle = '#79d9ff'; ctx.fillRect(x - 3, y - 3, 6, 6);
    }
    ctx.fillStyle = '#fff5dc'; ctx.beginPath(); ctx.moveTo(110, 98); ctx.lineTo(104, 116); ctx.lineTo(110, 112); ctx.lineTo(116, 116); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  return { element: canvas, draw };
}
export default createMinimap;
