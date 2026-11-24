const KEY = 'pulau-senja-save-v1';

export function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (!saved || typeof saved !== 'object') return null;
    return {
      money: Number.isFinite(saved.money) ? saved.money : 1250,
      respect: Number.isFinite(saved.respect) ? saved.respect : 0,
      mission: Number.isInteger(saved.mission) ? Math.max(0, Math.min(5, saved.mission)) : 0,
      x: Number.isFinite(saved.x) ? saved.x : 0,
      z: Number.isFinite(saved.z) ? saved.z : 0,
    };
  } catch { return null; }
}

export function saveGame(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      money: state.money ?? 1250,
      respect: state.respect ?? 0,
      mission: state.mission ?? 0,
      x: state.player?.position.x ?? 0,
      z: state.player?.position.z ?? 0,
    }));
    return true;
  } catch { return false; }
}

export function clearSave() { localStorage.removeItem(KEY); }
export default { loadGame, saveGame, clearSave };
