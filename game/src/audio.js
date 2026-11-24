export function createAudio() {
  let context;
  let engine, engineGain, sirenOsc, sirenGain, radioOsc, radioGain;
  let unlocked = false;
  function unlock() {
    if (unlocked) { if (context.state === 'suspended') context.resume(); return; }
    context = new AudioContext();
    engine = context.createOscillator(); engine.type = 'sawtooth';
    engineGain = context.createGain(); engineGain.gain.value = 0.0001;
    const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 260;
    engine.connect(filter).connect(engineGain).connect(context.destination); engine.start();
    sirenOsc = context.createOscillator(); sirenOsc.type = 'triangle';
    sirenGain = context.createGain(); sirenGain.gain.value = 0.0001;
    sirenOsc.connect(sirenGain).connect(context.destination); sirenOsc.start();
    radioOsc = context.createOscillator(); radioOsc.type = 'sine'; radioOsc.frequency.value = 196;
    radioGain = context.createGain(); radioGain.gain.value = 0.0001;
    radioOsc.connect(radioGain).connect(context.destination); radioOsc.start();
    unlocked = true;
  }
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
  function update(speed = 0, wanted = 0) {
    if (!unlocked) return;
    const now = context.currentTime;
    engine.frequency.setTargetAtTime(48 + Math.abs(speed) * 4, now, 0.08);
    engineGain.gain.setTargetAtTime(Math.abs(speed) > 0.2 ? 0.035 : 0.0001, now, 0.12);
    sirenOsc.frequency.setTargetAtTime(520 + Math.sin(now * 5) * 180, now, 0.04);
    sirenGain.gain.setTargetAtTime(wanted ? 0.018 : 0.0001, now, 0.1);
    radioOsc.frequency.setTargetAtTime(196 + Math.sin(now * 1.3) * 32, now, 0.2);
    radioGain.gain.setTargetAtTime(0.008, now, 0.2);
  }
  function playShot() {
    if (!unlocked) return;
    const osc = context.createOscillator(), gain = context.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(130, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(38, context.currentTime + 0.12);
    gain.gain.setValueAtTime(0.11, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.13);
    osc.connect(gain).connect(context.destination); osc.start(); osc.stop(context.currentTime + 0.14);
  }
  return { update, playShot, unlock };
}
export default createAudio;
