export function createInput(element = document.body) {
  const keys = new Set();
  const input = { keys, yaw: 0.65, pitch: 0.36 };
  window.addEventListener('keydown', (event) => {
    keys.add(event.code);
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());
  element.addEventListener('click', () => element.requestPointerLock?.());
  window.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement !== element) return;
    input.yaw -= event.movementX * 0.003;
    input.pitch = Math.max(0.12, Math.min(1.1, input.pitch + event.movementY * 0.002));
  });
  return input;
}
