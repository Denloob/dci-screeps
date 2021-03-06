module.exports = {
  /**
   * @param  {Creep} creep
   */
  run: function (creep) {
    // if creep is bringing energy to the controller but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to transfer energy to the controller
    if (creep.memory.working == true) {
      // instead of upgraderController we could also use:
      // if (creep.transfer(creep.room.controller, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {

      // try to upgrade the controller
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        // if not in range, move towards the controller
        creep.moveTo(creep.room.controller, { reusePath: 15, range: 3, visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
    // if creep is supposed to harvest energy
    else {
      creep.getEnergy(true, true, true);
    }
  },
};
