var roleUpgrader = require('roles_role.upgrader');

module.exports = {
  /**
   * @param  {Creep} creep
   */
  run: function (creep) {
    // if creep is trying to complete a constructionSite but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }
    // if in target room
    if (creep.memory.target == undefined || creep.room.name == creep.memory.target) {
      // if creep is supposed to complete a constructionSite
      if (creep.memory.working == true) {
        // find closest constructionSite
        var constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        // if one is found
        if (constructionSite != undefined) {
          // try to build, if the constructionSite is not in range
          if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
            // move towards the constructionSite
            creep.moveTo(constructionSite, {
              visualizePathStyle: { stroke: '#ffff00' },
            });
          }
        }
        // if no constructionSite is found
        else {
          // go upgrading the controller
          roleUpgrader.run(creep);
        }
      }
      // if creep is supposed to harvest energy from source
      else {
        creep.getEnergy(true, true, true);
      }
    }
    // if not in the target room...
    else {
      // travel to target room
      creep.travelTo(new RoomPosition(25, 25, creep.memory.target), {
        roomCallback: global.roomCallback,
      });
    }
  },
};
