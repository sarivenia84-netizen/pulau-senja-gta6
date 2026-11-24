const crew = [
  {
    name: "Mira",
    role: "DRIVER",
    specialty: "Drift & escape",
    ability: "Kendaraan +35% selama 12 dtk",
    type: "driver",
    color: "#f0b56c",
  },
  {
    name: "Bima",
    role: "PILOT",
    specialty: "Pengintai udara",
    ability: "Lari +45% selama 10 dtk",
    type: "pilot",
    color: "#79c9da",
  },
  {
    name: "Tono",
    role: "GUNNER",
    specialty: "Penekan polisi",
    ability: "Wanted turun 1 bintang",
    type: "gunner",
    color: "#e88c83",
  },
];

export function createCrew({ onWanted = () => {} } = {}) {
  let active = null;
  let cooldown = 0;
  function call(player, vehicles, driven, police) {
    if (cooldown > 0) return null;
    const position = driven?.group.position ?? player.position;
    const nearestCar = vehicles
      .filter((car) => !car.npc && !car.occupied)
      .sort(
        (a, b) =>
          position.distanceTo(a.group.position) -
          position.distanceTo(b.group.position),
      )[0];
    const carDistance = nearestCar
      ? position.distanceTo(nearestCar.group.position)
      : Infinity;
    const type =
      driven || carDistance < 45
        ? "driver"
        : police.wanted > 0
          ? "gunner"
          : "pilot";
    const member = crew.find((item) => item.type === type);
    active = {
      type,
      time: type === "gunner" ? 5 : 10,
      vehicle: driven || nearestCar,
    };
    cooldown = 18;
    if (type === "driver" && active.vehicle) {
      active.vehicle.crewSpeedUntil = performance.now() + active.time * 1000;
      active.vehicle.speed = Math.min(
        active.vehicle.maxSpeed ?? 30,
        active.vehicle.speed + 9,
      );
    }
    if (type === "pilot") {
      active.previousSpeed = player.speed;
      player.speed = 7.25;
    }
    if (type === "gunner") onWanted(Math.max(0, police.wanted - 1));
    return { ...member, duration: active.time };
  }
  function update(dt, player, driven) {
    cooldown = Math.max(0, cooldown - dt);
    if (!active) return;
    active.time -= dt;
    if (active.time > 0) return;
    if (active.type === "pilot") player.speed = active.previousSpeed ?? 5;
    if (active.type === "driver" && active.vehicle)
      active.vehicle.crewSpeedUntil = 0;
    if (active.type === "gunner") player.userData.gunnerUntil = 0;
    active = null;
  }
  return {
    members: crew,
    call,
    update,
    get cooldown() {
      return cooldown;
    },
    get active() {
      return active?.type ?? null;
    },
  };
}
export default createCrew;
