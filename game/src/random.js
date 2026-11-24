export function random(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function between(rng, low, high) {
  return low + rng() * (high - low);
}

export function pick(rng, values) {
  return values[Math.floor(rng() * values.length)];
}
