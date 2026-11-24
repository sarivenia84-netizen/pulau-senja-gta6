import { getDialogue, getMissionTitle } from "./story.js";
import { createPortrait } from "./portrait.js";

const missions = [
  {
    objective: "Antar paket tertutup ke warung Bu Sari di Pantai Kerang.",
    target: [68, 0, 68],
    district: "Pantai Kerang",
    action: "deliver",
    reward: 250,
    respect: 5,
  },
  {
    objective: "Selidiki peti Garis Hitam di gudang Pelabuhan Tua.",
    target: [68, 0, -68],
    district: "Pelabuhan Tua",
    action: "reach",
    reward: 400,
    respect: 8,
  },
  {
    objective:
      "Temui Raka di jalan layang Pusat Kota dan dengarkan kesaksiannya.",
    target: [-68, 0, 68],
    district: "Pusat Kota",
    action: "reach",
    reward: 550,
    respect: 10,
  },
  {
    objective: "Buntuti kurir Garis Hitam sampai ke Bukit Salju.",
    target: [-68, 0, -68],
    district: "Bukit Salju",
    action: "follow",
    reward: 700,
    respect: 12,
  },
  {
    objective: "Ambil buku catatan pemerasan dari menara pengawas.",
    target: [0, 0, -108],
    district: "Bukit Salju",
    action: "collect",
    reward: 900,
    respect: 16,
  },
  {
    objective: "Bawa salinan bukti ke stasiun radio dan ungkap Garis Hitam.",
    target: [0, 0, 0],
    district: "Pusat Kota",
    action: "broadcast",
    reward: 1500,
    respect: 25,
  },
  {
    objective: "Temukan saksi pelabuhan yang bersembunyi di Pantai Kerang.",
    target: [108, 0, 68],
    district: "Pantai Kerang",
    action: "reach",
    reward: 650,
    respect: 12,
  },
  {
    objective: "Kawal kapal kecil membawa bukti melewati dermaga lama.",
    target: [108, 0, -108],
    district: "Pelabuhan Tua",
    action: "reach",
    reward: 800,
    respect: 15,
  },
  {
    objective: "Ambil rekaman transaksi dari garasi di Bukit Salju.",
    target: [-108, 0, -68],
    district: "Bukit Salju",
    action: "collect",
    reward: 950,
    respect: 18,
  },
  {
    objective: "Sampaikan bukti terakhir ke warga di alun-alun kota.",
    target: [-68, 0, 108],
    district: "Pusat Kota",
    action: "broadcast",
    reward: 1800,
    respect: 30,
  },
];
const bonusMission = {
  title: "Bantuan Warga",
  objective: "Bantu warga melindungi kios dari pemerasan.",
  target: [68, 0, 108],
  district: "Pantai Kerang",
  action: "reach",
  reward: 1200,
  respect: 20,
  bonus: true,
};

for (const [index, mission] of missions.entries()) {
  mission.title = getMissionTitle(index);
}

function ensurePanel() {
  let panel = document.querySelector("#mission-panel");
  if (panel) return panel;
  panel = document.createElement("section");
  panel.id = "mission-panel";
  Object.assign(panel.style, {
    position: "fixed",
    right: "28px",
    top: "260px",
    width: "min(330px, calc(100vw - 48px))",
    padding: "14px 16px",
    color: "#fff7e8",
    background: "rgba(27, 35, 41, .92)",
    borderLeft: "4px solid #f4bd77",
    borderRadius: "3px",
    font: "14px/1.5 Arial, sans-serif",
    textShadow: "0 1px 3px #222",
    pointerEvents: "none",
    zIndex: "5",
  });
  panel.setAttribute("aria-live", "polite");
  panel.setAttribute("aria-label", "Misi aktif");
  document.body.append(panel);
  return panel;
}

export function createMissions({
  player,
  query = new URLSearchParams(location.search),
  initialMission = 0,
  getStanding = () => 0,
  onComplete = () => {},
} = {}) {
  const requestedMission = Number(query.get("mission"));
  let index =
    query.has("mission") &&
    Number.isFinite(requestedMission) &&
    requestedMission >= 1
      ? Math.max(
          0,
          Math.min(missions.length - 1, Math.floor(requestedMission) - 1),
        )
      : Math.max(0, Math.min(missions.length - 1, initialMission));
  let complete = false;
  let bonusAvailable = getStanding("Pantai Kerang") >= 12;
  let bonusActive = false;
  const panel = ensurePanel();

  function render() {
    const mission = bonusActive ? bonusMission : missions[index];
    const lines = bonusActive ? getDialogue(10) : getDialogue(index);
    const speaker = lines[0]?.speaker ?? "Nadia";
    const portrait = createPortrait(speaker, 64).toDataURL();
    panel.innerHTML = `<div style="color:#f4bd77;letter-spacing:.12em;font-size:11px">${bonusActive ? "MISI BONUS" : `MISI ${index + 1} / ${missions.length}`} · ${mission.title.toUpperCase()}</div><div style="display:flex;gap:12px;align-items:center;margin-top:10px"><img width="64" height="64" alt="Potret ${speaker}" src="${portrait}" style="border:1px solid #f4bd77;border-radius:3px"><div><strong>OBJEKTIF</strong><br>${mission.objective}</div></div><div style="margin-top:10px;color:#e7d7c3">${lines.map((line) => `<div><b>${line.speaker}:</b> ${line.text}</div>`).join("")}</div>${complete ? '<div style="margin-top:9px;color:#f4bd77">MISI SELESAI · TUJUAN BERIKUTNYA TERBUKA</div>' : ""}`;
    panel.hidden = false;
    panel.style.display = "block";
    panel.style.top = "260px";
  }

  function update() {
    if (complete) return false;
    const mission = bonusActive ? bonusMission : missions[index];
    if (!bonusAvailable && getStanding("Pantai Kerang") >= 20) {
      bonusAvailable = true;
      render();
    }
    const dx = player.position.x - mission.target[0];
    const dz = player.position.z - mission.target[2];
    if (Math.hypot(dx, dz) < 9) {
      complete = true;
      onComplete({ ...mission, index, bonus: bonusActive });
      render();
      return true;
    }
    return false;
  }

  function advance() {
    if (!complete) return false;
    if (bonusActive) {
      bonusActive = false;
      bonusAvailable = false;
    } else if (index < missions.length - 1) index += 1;
    else return false;
    complete = false;
    render();
    return true;
  }

  function startBonus() {
    if (!bonusAvailable || bonusActive || complete) return false;
    bonusActive = true;
    render();
    return true;
  }

  render();
  return {
    update,
    advance,
    startBonus,
    get bonusAvailable() {
      return bonusAvailable;
    },
    get current() {
      return {
        ...(bonusActive ? bonusMission : missions[index]),
        index,
        complete,
        bonus: bonusActive,
      };
    },
  };
}

export { missions };
export default createMissions;
