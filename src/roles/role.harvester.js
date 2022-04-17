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
    if (posX < 1 || posX > 48 || posY < 1 || posY > 48) continue;
    if ((terrain.get(posX, posY) & TERRAIN_MASK_WALL) > 0) continue;
    if (room.lookForAt(LOOK_STRUCTURES, posX, posY).find((s) => OBSTACLE_OBJECT_TYPES.includes(s.structureType))) continue;

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
  return Math.floor(Math.random() * 8) + 1;
}
function getOppositeDir(dir) {
  return ((dir + 3) % 8) + 1;
}

module.exports = {
  /**
   * @param  {Creep} creep
   */
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
      // find closest spawn, extension or tower which is not full
      var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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
      // if there is no structure
      else {
        // find closest source
        let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        let pathToSource = creep.pos.findPathTo(source, { costCallback: global.roomCallback });
        if (pathToSource.length === 0) {
          creep.move(getNudgeDirection_Random(creep.pos));
        } else if (pathToSource.length === 1) {
          creep.move(getOppositeDir(pathToSource[0].direction));
        }
      }
    }
    // if creep is supposed to harvest energy from source
    else {
      creep.getEnergy(false, true);
    }
  },
};
