import { updateTraffic } from './vehicles.js';

export function tickTraffic(traffic, dt, blockers, cityEdge) {
  for (const car of traffic) updateTraffic(car, dt, blockers, cityEdge);
}
