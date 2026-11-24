import { createMinimap } from './minimap.js';
import { createPortrait } from './portrait.js';

const style = document.createElement('style');
style.textContent = `#ps-hud{position:fixed;inset:0;z-index:4;color:#fff5df;font:13px Arial,sans-serif;text-shadow:0 2px 5px #18232c;pointer-events:none}#ps-map{position:absolute;left:26px;top:22px}#ps-stats{position:absolute;right:28px;top:140px;text-align:right;font-size:17px;font-weight:bold}#ps-stats small{display:block;font-size:12px;color:#f6d2a3;margin-top:7px}#ps-weapons{position:absolute;right:28px;top:24px;display:flex;gap:6px}#ps-weapons span{padding:9px 12px;background:#19232cbb;border-bottom:2px solid #d5bd98;border-radius:3px}#ps-weapons .active{border-color:#ffce76;color:#ffce76}#ps-car{position:absolute;right:30px;bottom:28px;text-align:right;font-size:14px}#ps-speed{font-size:38px;font-weight:bold}#ps-radio{color:#f6d2a3;margin-top:5px}#ps-mission{position:absolute;left:270px;top:130px;width:270px;padding:13px 16px;background:#202b35c9;border-left:3px solid #f3bd76;line-height:1.5}#ps-dialogue{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);min-width:380px;max-width:620px;padding:12px 20px;background:#19232cdd;border-bottom:2px solid #f3bd76;text-align:center;display:none}#ps-dialogue img{width:56px;height:56px;object-fit:cover;border:1px solid #f3bd76;border-radius:3px}#ps-dialogue-content{display:inline-block;vertical-align:middle;margin-left:12px;max-width:500px;text-align:left}#ps-dispatch{position:absolute;left:26px;top:252px;padding:8px 10px;background:#19232cbb;line-height:1.55;color:#dceeff;font-size:11px}#ps-title{position:absolute;left:270px;top:82px;font-size:11px;letter-spacing:.15em;color:#fff0d6}#ps-crew{position:absolute;left:26px;top:310px;display:grid;grid-template-columns:repeat(3,82px);gap:5px}#ps-crew article,#ps-standing article{background:#19232cdd;border-left:2px solid var(--crew);padding:6px;font-size:9px;line-height:1.35}#ps-crew b,#ps-crew small{display:block}#ps-standing{position:absolute;left:270px;top:22px;display:flex;gap:4px}#ps-standing article{width:70px;border-color:#f3bd76}#ps-standing i{display:block;height:3px;background:#66716e;margin-top:4px}#ps-standing em{display:block;height:3px;background:#f3bd76}`;

document.head.append(style);

export function createHud() {
  const root = document.createElement('div'); root.id = 'ps-hud';
  root.innerHTML = '<div id="ps-map"></div><div id="ps-standing"></div><div id="ps-crew"></div><div id="ps-stats"></div><div id="ps-weapons"></div><div id="ps-car"></div><div id="ps-mission"></div><div id="ps-dialogue"></div><div id="ps-dispatch"></div><div id="ps-title">PULAU SENJA · NADIA</div>';
  const shotNumber = Number(new URLSearchParams(location.search).get('shot'));
  const hint = document.querySelector('#hint');
  document.body.append(root);
  if (hint) root.append(hint);
  const dialogueStyle = document.createElement('style');
  dialogueStyle.textContent = '#ps-hud:has(#ps-dialogue[style*="display: flex"]) #hint { display:none }#ps-hud #hint{left:26px;bottom:24px}';
  document.head.append(dialogueStyle);
  const map = createMinimap(); document.querySelector('#ps-map').append(map.element);
  let weapon = 1;
  const slots = ['PISTOL', 'SMG', 'SHOTGUN', 'KOSONG'];
  const weapons = document.querySelector('#ps-weapons');
  function render(data = {}) {
    if (data.weapon) weapon = data.weapon;
    const money = data.money ?? 1250, hour = data.hour ?? 17.2, wanted = data.wanted ?? 0;
    document.querySelector('#ps-stats').innerHTML = `Rp ${Math.floor(money).toLocaleString('id-ID')}<small>${String(Math.floor(hour) % 24).padStart(2,'0')}:${String(Math.floor((hour % 1) * 60)).padStart(2,'0')} &nbsp; · &nbsp; RESPEK ${data.respect ?? 0}</small><small style="color:#ffd25f;font-size:20px">${'★'.repeat(wanted)}${'☆'.repeat(5-wanted)}</small>`;
    weapons.innerHTML = slots.map((name, i) => `<span class="${weapon === i + 1 ? 'active' : ''}">${i+1} ${name}</span>`).join('');
    const speed = data.vehicle ? (shotNumber === 1 ? 95 : Math.round(Math.abs(data.vehicle.speed) * 3.6)) : 0;
    document.querySelector('#ps-car').innerHTML = data.vehicle ? `<div id="ps-speed">${speed}<small> KM/J</small></div>${data.vehicle.name}<div id="ps-radio">FM SENJA · ${data.radio ?? 'MALAM DI KOTA'}</div>` : '';
    const mission = data.mission;
    document.querySelector('#ps-mission').innerHTML = mission ? `<b style="color:#f6c77d">${mission.bonus ? 'MISI BONUS' : `MISI ${mission.index + 1} · ${mission.title}`}</b><br>${mission.objective}` : '';
    const standing = document.querySelector('#ps-standing');
    standing.innerHTML = (data.districts ?? []).map(d => `<article>${d.name}<i><em style="width:${Math.min(100, d.value)}%"></em></i>${d.value}%</article>`).join('');
    const crew = document.querySelector('#ps-crew');
    crew.innerHTML = (data.crew?.members ?? []).map(member => `<article style="--crew:${member.color}"><b>${member.name} · ${member.role}</b><small>${member.specialty}</small><small>${member.ability}</small>${data.crew.active === member.type ? 'AKTIF' : data.crew.cooldown > 0 ? `Q ${Math.ceil(data.crew.cooldown)}s` : 'Q PANGGIL'}</article>`).join('');
    map.draw(data.player, mission, data.police, data.missions);
    if (mission?.title) document.querySelector('#ps-mission b').textContent = mission.bonus ? 'MISI BONUS' : `MISI ${mission.index + 1} · ${mission.title}`;
    const dispatch = document.querySelector('#ps-dispatch');
    dispatch.innerHTML = data.policeStatus?.length ? `<b>DISPATCH</b><br>${data.policeStatus.map(status => `▸ ${status}`).join('<br>')}` : '';
    const bar = document.querySelector('#ps-dialogue');
    bar.style.display = data.dialogue ? 'flex' : 'none';
    bar.style.alignItems = 'center';
    bar.style.justifyContent = 'center';
    if (data.dialogue) {
      const portrait = createPortrait(data.dialogue.speaker, 56);
      bar.replaceChildren(portrait, Object.assign(document.createElement('span'), {
        textContent: `${data.dialogue.speaker}: ${data.dialogue.text}`,
      }));
    } else {
      bar.replaceChildren();
    }
  }
  window.addEventListener('keydown', event => { if (event.key >= '1' && event.key <= '4') { weapon = Number(event.key); render(); } });
  return { element: root, render, setDialogue(line) { render({ dialogue: line }); }, get weapon() { return weapon; } };
}
export default createHud;
