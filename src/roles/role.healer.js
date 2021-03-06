module.exports = {
  /**
   * @param  {Creep} creep
   */
  run: function (creep) {
    if (creep.spawning) creep.memory.spawning = true;
    else if (creep.memory.spawning != undefined) delete creep.memory.spawning;

    if (Game.creeps[creep.memory.target] != undefined) {
      let mainTarget = Game.creeps[creep.memory.target];
      if (creep.room.name == mainTarget.room.name) {
        creep.moveTo(Game.creeps[creep.memory.target], { range: 0, ignoreCreeps: true, visualizePathStyle: { stroke: '#00ff00' } });
        let target = creep.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (c) => c.hits < c.hitsMax });
        if (target) {
          creep.heal(target);
        }
      } else {
        // travel to target creeps room
        creep.travelTo(new RoomPosition(25, 25, Game.creeps[creep.memory.target].room.name));
      }
    }
  },
};
