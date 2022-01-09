module.exports = {
  /**
   * @param  {Creep} creep
   */
  run: function (creep) {
    // if in target room
    if (creep.room.name == creep.memory.target) {
      // find closest enemy creep
      let target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
        filter: (s) =>
          s.structureType == STRUCTURE_TOWER && _.filter(creep.room.lookAt(s.pos), (o) => o.type == 'structure' && o.structure.structureType == STRUCTURE_RAMPART)[0] == undefined,
      });
      let maxRampartHits = 50000;
      let itr = 10000;
      if (target == undefined)
        for (let i = 0; i < maxRampartHits && target == undefined; i += itr) {
          target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            filter: (s) =>
              s.structureType == STRUCTURE_TOWER &&
              _.filter(creep.room.lookAt(s.pos), (o) => o.type == 'structure' && o.structure.structureType == STRUCTURE_RAMPART && o.structure.hits < i)[0],
          });
        }
      if (target == undefined) {
        target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
          filter: (s) =>
            s.structureType == STRUCTURE_SPAWN &&
            _.filter(creep.room.lookAt(s.pos), (o) => o.type == 'structure' && o.structure.structureType == STRUCTURE_RAMPART)[0] == undefined,
        });
        let maxRampartHits = 100000;
        let itr = 10000;
        if (target == undefined)
          for (let i = 0; i < maxRampartHits && target == undefined; i += itr) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
              filter: (s) =>
                s.structureType == STRUCTURE_SPAWN &&
                _.filter(creep.room.lookAt(s.pos), (o) => o.type == 'structure' && o.structure.structureType == STRUCTURE_RAMPART && o.structure.hits < i)[0],
            });
          }
        if (target == undefined) target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.hits < 30000 });
      }
      // if one is found
      if (target != undefined) {
        // try to attack
        let dismantle = creep.dismantle(target);
        // if the enemy is not in range
        if (dismantle == ERR_NOT_IN_RANGE) {
          // move towards the enemy
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
        } else if (attack == OK) console.log(`${creep.name} is dismantling ${target} in ${creep.room}, hp left: ${creep.hits} while targets hits are ${target.hits}`);
      }
    }
    // if not in target room and not waiting...
    else if (!creep.memory.waiting) {
      // travel to target room
      creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
    }
  },
};
