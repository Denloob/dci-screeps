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
          filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION || s.structureType == STRUCTURE_TOWER) && s.energy < s.energyCapacity,
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
            creep.moveTo(structure, { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
      // if not in home room...
      else {
        // travel to home room
        creep.travelTo(new RoomPosition(25, 25, creep.memory.home), { roomCallback: global.roomCallback });
      }
    }
    // if creep is supposed to collect energy
    else {
      // if in target room
      if (creep.room.name == creep.memory.target) {
        getEnergy(creep);
      }
      // if not in target room...
      else {
        // travel to target room
        creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { roomCallback: global.roomCallback });
      }
    }
  },
};

var getEnergy = function (creep) {
  // find closest dropped resource, tombstone and ruin, with energy
  var droppedResources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: (dr) => dr.resourceType == RESOURCE_ENERGY && dr.amount > 50 });
  // var droppedResources = undefined;
  var tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, { filter: (t) => t.store[RESOURCE_ENERGY] > 0 });
  var ruin = creep.pos.findClosestByPath(FIND_RUINS, { filter: (r) => r.store[RESOURCE_ENERGY] > 0 });
  var container = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (c) => c.structureType == STRUCTURE_CONTAINER && c.store[RESOURCE_ENERGY] > 500 });
  if (droppedResources != undefined) {
    // try to withdraw droppedResources, if it is not in range
    if (creep.pickup(droppedResources) == ERR_NOT_IN_RANGE) {
      // move towards it
      creep.moveTo(droppedResources, { visualizePathStyle: { stroke: '#feeb75' } });
    }
  } else if (tombstone != undefined) {
    // try to withdraw energy from tombstone, if it is not in range
    if (creep.withdraw(tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      // move towards it
      creep.moveTo(tombstone, { visualizePathStyle: { stroke: '#feeb75' } });
    }
  } else if (ruin != undefined) {
    // try to withdraw energy from ruin, if it is not in range
    if (creep.withdraw(ruin, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      // move towards it
      creep.moveTo(ruin, { visualizePathStyle: { stroke: '#feeb75' } });
    }
  } else if (container != undefined) {
    // try to withdraw energy from container, if it is not in range
    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      // move towards it
      creep.moveTo(container, { visualizePathStyle: { stroke: '#feeb75' } });
    }
  }
  // if no droppedResources, tombstones, ruins or container with energy found
  else {
    // find the closest storage which
    var storage = creep.room.storage;
    // if we found one
    if (storage != undefined && storage.store[RESOURCE_ENERGY] > 100000) {
      // try to withdraw energy, if it is not in range
      if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        // move towards it
        creep.moveTo(storage, { visualizePathStyle: { stroke: '#feeb75' } });
      }
    }
  }
};
