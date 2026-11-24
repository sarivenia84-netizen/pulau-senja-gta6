export function random(seed = 1) {
  let cursor = seed >>> 0;

  const next = () => {
    cursor = (Math.imul(cursor, 1_664_525) + 1_013_904_223) >>> 0;
    return cursor / 4_294_967_296;
  };

  return next;
}

export function between(rng, low, high) {
  const span = high - low;
  return low + rng() * span;
}

export function pick(rng, values) {
  const index = Math.floor(rng() * values.length);
  return values[index];
}
