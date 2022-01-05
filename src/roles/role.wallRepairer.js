let roleBuilder = require("roles_role.builder");

module.exports = {
  /** @type {Creep} */
  // a function to run the logic for this role
  run: function (creep) {
    // if creep is trying to repair something but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (
      creep.memory.working == false &&
      creep.carry.energy == creep.carryCapacity
    ) {
      // switch state
      creep.memory.working = true;
    }
    if (
      creep.memory.target == undefined ||
      creep.memory.home == creep.room.name
    ) {
      // if creep is supposed to repair something
      if (creep.memory.working == true) {
        // set the default walls limit
        let wallsLimit = 0;
        // if rooms wallsLimit is defined
        if (Memory.rooms && Memory.rooms[creep.room.name]) {
          if (
            _.isObject(Memory.rooms[creep.room.name].wallsLimit) &&
            _.isEqual(
              Object.keys(Memory.rooms[creep.room.name].wallsLimit).sort(),
              ["tower", "creep"].sort()
            )
          )
            wallsLimit = Memory.rooms[creep.room.name].wallsLimit.creep;
          else
            Memory.rooms[creep.room.name].wallsLimit = {
              tower: wallsLimit,
              creep: wallsLimit,
            };
        }
        // // let walls = creep.room.find(FIND_STRUCTURES, {
        // //     filter: (s) => (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) && s.hits < wallsLimit
        // // });

        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: (s) =>
            (s.structureType == STRUCTURE_WALL ||
              s.structureType == STRUCTURE_RAMPART) &&
            s.hits < wallsLimit,
        });

        // // // loop with increasing percentages
        // // for (let percentage = 0.0001; percentage <= 1; percentage += 0.0001){
        // //     // find a wall with less than percentage hits
        // //     for (let wall of walls) {
        // //         if (wall.hits / wall.hitsMax < percentage) {
        // //             target = wall;
        // //             break;
        // //         }
        // //     }

        // //     // if there is one
        // //     if (target != undefined) {
        // //         // break the loop
        // //         break;
        // //     }
        // // }

        // if we find a wall that has to be repaired
        if (target != undefined) {
          // try to repair it, if not in range
          if (creep.repair(target) == ERR_NOT_IN_RANGE) {
            // move towards it
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
          }
        }
        // if we can't fine one
        else {
          // look for construction sites
          roleBuilder.run(creep);
        }
      }
      // if creep is supposed to harvest energy from source
      else {
        creep.getEnergy(true, true, true);
      }
    } else {
      // find exit to home room
      var exit = creep.room.findExitTo(creep.memory.home);
      // move to exit
      creep.moveTo(creep.pos.findClosestByPath(exit), {
        visualizePathStyle: { stroke: "#feeb75" },
      });
    }
  },
};
