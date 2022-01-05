const offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
const offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];

/**
 * returns a weighted random direction from given position
 * prefers empty tiles over ones with creeps
 * never picks a direction that would result in hitting a wall or an obstacle structure
 *
 * @param {RoomPosition} pos
 */
function getNudgeDirection_Random(pos) {
  const room = Game.rooms[pos.roomName];
  const terrain = Game.map.getRoomTerrain(pos.roomName);
  let totalWeight = 0;
  let dirCandidates = new Uint8Array(9);
  for (let dir = TOP; dir <= TOP_LEFT; ++dir) {
    let posX = pos.x + offsetX[dir];
    let posY = pos.y + offsetY[dir];
    if (posX < 1 || posX > 48 || posY < 1 || posY > 48)
      continue;
    if ((terrain.get(posX, posY) & TERRAIN_MASK_WALL) > 0)
      continue;
    if (room.lookForAt(LOOK_STRUCTURES, posX, posY).find(s => OBSTACLE_OBJECT_TYPES.includes(s.structureType)))
      continue;

    const hasCreeps = room.lookForAt(LOOK_CREEPS, posX, posY).length > 0;
    const addWeight = hasCreeps ? 1 : 2;
    dirCandidates[dir] += addWeight;
    totalWeight += dirCandidates[dir];
  }

  let sum = 0;
  let rnd = _.random(1, totalWeight, false);
  for (let dir = TOP; dir <= TOP_LEFT; ++dir) {
    if (dirCandidates[dir] > 0) {
      sum += dirCandidates[dir];
      if (rnd <= sum) {
        return dir;
      }
    }
  }

  // this should never happen, unless creep is spawned into a corner
  // or structure is built next to it and seals the only path out
  // getRandomDir
  return (Math.floor(Math.random() * 8) + 1)();
}

Flag.prototype.build =
    function (structureType, name) {
        return this.room.createConstructionSite(this.pos, structureType, name);
    };
Flag.prototype.calcTask =
    function () {
        if (this.color == COLOR_YELLOW && this.secondaryColor == COLOR_ORANGE) this.build(STRUCTURE_TOWER);
        else if (this.color == COLOR_ORANGE && this.secondaryColor == COLOR_YELLOW) this.build(STRUCTURE_STORAGE);
        else if (this.color == COLOR_GREEN && this.secondaryColor == COLOR_GREEN) this.build(STRUCTURE_RAMPART);
        else if (this.color == COLOR_YELLOW && this.secondaryColor == COLOR_YELLOW) this.build(STRUCTURE_EXTENSION);
        else if (this.color == COLOR_WHITE && this.secondaryColor == COLOR_WHITE) this.build(STRUCTURE_ROAD);
    };
Flag.prototype.getState =
    /**
     * @param  {Creep} creep
     * @param  {RoomPosition} target
     */
    function (creep, target) {
        if (this.color == COLOR_PURPLE && this.secondaryColor == COLOR_PURPLE) {
            if (creep.memory.allowStandingTimer == undefined) creep.memory.allowStandingTimer = 0;
            if (!this.memory.allowStanding && this.name.startsWith('blockStanding')) this.memory.allowStanding = false
            if (!this.memory.allowStandingException && this.name.startsWith('blockStanding')) this.memory.allowStandingException = {role: 'miner'}
            let allowStanding = creep.memory.role == this.memory.allowStandingException.role ? !this.memory.allowStanding: this.memory.allowStanding
            if (!allowStanding && this.pos.x == creep.pos.x && this.pos.y == creep.pos.y && this.pos.roomName == creep.pos.roomName) {
                creep.memory.allowStandingTimer++;
                if (creep.memory.allowStandingTimer >= 3) {
                    creep.memory.allowStandingTimer = 0;
                    if (target != undefined)
                        return creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}})
                    else return creep.move(getNudgeDirection_Random(creep.pos))
                }
            }
        }
    };