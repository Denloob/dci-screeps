module.exports = {
  /** @type {Creep} */
  /**
   * @param  {Creep} creep
   */
  run: function (creep) {
    if (creep.memory.notifyWhenAttacked) {
      creep.notifyWhenAttacked(false);
      creep.memory.notifyWhenAttacked = false;
    }
    // if not in the target room
    if (creep.room.name != creep.memory.target) {
      // move to target room
      creep.travelTo(new RoomPosition(25, 25, creep.memory.target), { roomCallback: global.roomCallback });
    }
  },
};
