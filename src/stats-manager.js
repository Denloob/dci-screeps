function getMyRooms() {
  return Object.keys(Game.rooms)
    .map((i) => Game.rooms[i])
    .filter((i) => i.controller && i.controller.my)
    .map((i) => Game.rooms[i.name]);
}

let StatsManager = {
  runForAllRooms: () => {
    if (Game.time % 19 != 0) RawMemory.setActiveSegments([99]);
    else if (Game.time % 20 != 0) return;

    let cpu = Game.cpu.getUsed();
    let myRooms = getMyRooms();
    let allCreeps = Object.keys(Game.creeps).map((i) => Game.creeps[i]);

    let roomStats = myRooms.map((room) => {
      let ctrl = room.controller;
      const storage = room.storage ? room.storage.store.energy : 0;
      const controller = room.controller ? room.controller.progress : 0;

      const walls = _.sum(
        room
          .find(FIND_STRUCTURES)
          .filter((i) => i.structureType === STRUCTURE_WALL)
          .map((i) => i.hits / 100)
      );
      const ramparts = _.sum(
        room
          .find(FIND_MY_STRUCTURES)
          .filter((i) => i.structureType === STRUCTURE_RAMPART)
          .map((i) => i.hits / 100)
      );

      const total = storage + controller + walls + ramparts;

      room.memory.lastProgressChecktime = Game.time;
      room.memory.lastProgress = total;
      let roomSpawns = room.find(FIND_MY_SPAWNS);
      let spawnsUsage = roomSpawns.length ? _.sum(roomSpawns.map((i) => (i.spawning ? 1 : 0))) / roomSpawns.length : 0;
      let storedEnergy = room.storage ? room.storage.store.energy : 0;
      let progressPercent = ctrl.progressTotal ? ctrl.progress / ctrl.progressTotal : 0;

      return {
        name: room.name,
        rcl: ctrl.level,
        rclP: ctrl.level + progressPercent,
        energy: room.energyAvailable,
        energyCapacity: room.energyCapacityAvailable,
        progress: ctrl.progress,
        progressTotal: ctrl.progressTotal,
        progressPercent: ctrl.progress / ctrl.progressTotal,
        underSiege: room.memory.isUnderSiege ? 1 : 0,
        energyAccumulated: total,
        spawnsUsage,
        storedEnergy,
        creepsCount: _.countBy(
          allCreeps.filter((i) => i.memory.homeRoom === room.name),
          (c) => c.memory.role
        ),
      };
    });

    RawMemory.segments[99] = `{
        "tick": ${Game.time},
        "gcl": ${Game.gcl.level},
        "roomsCount": ${myRooms.length},
        "gclProgress": ${Game.gcl.progress},
        "gclProgressTotal": ${Game.gcl.progressTotal},
        "creeps": ${Object.keys(Game.creeps).length},
        "cpu": ${Game.cpu.getUsed()},
        "cpuMax": ${Game.cpu.limit},
        "cpuPercent": ${cpu / Game.cpu.limit},
        "bucket": ${Game.cpu.bucket},
        "rooms": ${JSON.stringify(
          _.mapValues(
            _.groupBy(roomStats, (i) => i.name),
            (i) => i[0]
          )
        )}
    }`.replace(/\s{2,}/g, '\n');
    // siegedRooms: myRooms.filter(i => i.memory.isUnderSiege).length,
  },
};

module.exports = StatsManager;
