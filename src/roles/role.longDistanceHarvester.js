module.exports = {
  /**
   * @param  {Creep} creep
   */
  run: function (creep) {
    // if creep is bringing energy to a structure but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to transfer energy to a structure
    if (creep.memory.working == true) {
      // if in home room
      if (creep.room.name == creep.memory.home) {
        // find closest spawn, extension or tower which is not full
        var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          // the second argument for findClosestByPath is an object which takes
          // a property called filter which can be a function
          // we use the arrow operator to define it
          filter: (s) =>
            (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_LAB || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) &&
            s.energy < s.energyCapacity,
        });

        // if we don't found one
        if (structure == undefined) {
          // find closest storage which is not full
          structure = creep.room.storage;
        }

        // if we found one
        if (structure != undefined) {
          // try to transfer energy, if it is not in range
          if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // move towards it
            creep.moveTo(structure, { reusePath: 20, visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
      // if not in home room...
      else {
        // travel to home room
        creep.travelTo(new RoomPosition(25, 25, creep.memory.home), { roomCallback: global.roomCallback });
      }
    }
    // if creep is supposed to harvest energy from source
    else {
      // if there is no WORK parts in the creep
      if (_.filter(creep.body, (b) => b.type === WORK && b.hits != 0).length == 0) {
        if (creep.memory.hardRole == undefined) creep.memory.hardRole = creep.memory.role;
        creep.memory.role == 'recycle';
      }
      // if in target room
      else if (creep.room.name == creep.memory.target) {
        // find closest source
        var source = creep.room.find(FIND_SOURCES)[creep.memory.sourceIndex];
        // try to harvest energy, if the source is not in range
        if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
          // move towards the source
          creep.moveTo(source, { reusePath: 10, visualizePathStyle: { stroke: '#feeb75' } });
        }
      }
      // if not in target room...
      else {
        // travel to target room
        creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { roomCallback: global.roomCallback });
      }
    }
  },
};
