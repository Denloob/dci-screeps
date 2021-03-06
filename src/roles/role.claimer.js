module.exports = {
  /**
   * @param  {Creep} creep
   */
  run: function (creep) {
    // if in target room
    if (creep.room.name != creep.memory.target) {
      // travel to target room
      creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { roomCallback: global.roomCallback });
    } else {
      let roomController = creep.room.controller;
      if (!(roomController.upgradeBlocked > 0)) {
        if (roomController != undefined && (roomController.reservation || (roomController.owner != undefined && !roomController.my))) {
          if (creep.attackController(roomController) == ERR_NOT_IN_RANGE) {
            // move towards the controller
            creep.moveTo(roomController, { visualizePathStyle: { stroke: '#9933ff' } });
          }
        } else {
          // try to claim controller
          if (!creep.memory.reserve && creep.claimController(roomController) == ERR_NOT_IN_RANGE) {
            // move towards the controller
            creep.moveTo(roomController, { visualizePathStyle: { stroke: '#993388' } });
          } else if (creep.memory.reserve && creep.reserveController(roomController) == ERR_NOT_IN_RANGE) {
            // move towards the controller
            creep.moveTo(roomController, { visualizePathStyle: { stroke: '#9933ff' } });
          }
        }
      } else {
        creep.memory.role = 'recycle';
      }
    }
  },
};
