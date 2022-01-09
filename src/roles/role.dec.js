module.exports = {
  /**
   * @param  {Creep} creep
   */
  /** @type {Creep} */
  run: function (creep) {
    let pos = new RoomPosition(45, 8, 'W23S35');
    creep.moveTo(pos);
  },
};
