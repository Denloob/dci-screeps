// import modules
require('prototypes_prototype.flag');
require('prototypes_prototype.room');
require('prototypes_prototype.creep');
require('prototypes_prototype.tower');
require('prototypes_prototype.spawn');
require('prototypes_prototype.terminal');
require('prototypes_prototype.RoomVisual');
var Traveler = require('Traveler');
var watcher = require('watch-client');
var statsConsole = require('statsConsole');
var MemHack = require('memHack');
var getColorBasedOnPercentage = require('colors');
//// let excuseMe = require('creep.excuseMe');
//// let StatsManager = require('stats-manager');

const profiler = require('cpu.profiler');
profiler.enable();

module.exports.loop = function () {
  MemHack.pretick();
  profiler.wrap(mainLoop);
};

// TODO creeps do not go to tombstones/resources/sources/etc while there is a attacker creep nearby

function mainLoop() {
  if (Game.cpu.bucket == 10000) {
    Game.cpu.generatePixel();
  }
  global.Console = statsConsole;
  global.roomCallback = roomCallback;
  //// StatsManager.runForAllRooms();
  //// excuseMe.clearNudges();
  // check for memory entries of died creeps by iterating over Memory.creeps
  for (let name in Memory.creeps) {
    // and checking if the creep is still alive
    if (Game.creeps[name] == undefined) {
      // if not, delete the memory entry
      delete Memory.creeps[name];
    }
  }

  // for each creeps
  for (let name in Game.creeps) {
    const creep = Game.creeps[name];
    const roomList = ['W22S33'];
    if (roomList.includes(creep.room.name))
      for (let flagName in Game.flags) {
        const flag = Game.flags[flagName];
        if (flag.color == COLOR_PURPLE && flag.secondaryColor == COLOR_PURPLE) flag.getState(creep);
      }
    // // Game.creeps[name].giveWay()
    if (creep.memory.role != undefined)
      // run creep logic
      creep.runRole();
  }

  // find all towers
  const towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
  // for each tower
  for (let tower of towers) {
    // run tower logic
    tower.main();
  }

  // for each spawn
  for (const spawnName in Game.spawns) {
    // run spawn logic
    Game.spawns[spawnName].spawnCreepsIfNecessary();
    Game.spawns[spawnName].processAttacks();
  }
  for (const roomName in Game.rooms) {
    const room = Game.rooms[roomName];
    // delte the room memory if it is empty
    if (_.isObject(_.get(Memory, `rooms["${roomName}"]`)) && Object.keys(Memory.rooms[roomName]).length == 0) {
      delete Memory.rooms[roomName];
      continue;
    }
    // run the room logic
    roomLogic(roomName);
    // if the room controler is owned by you and the room has valid memory
    if (_.get(room, `controller.my`, false) && _.isObject(Memory.rooms[roomName])) {
      if (!_.isArray(Memory.rooms[roomName].boostCreeps)) Memory.rooms[roomName].boostCreeps = [];

      [...Memory.rooms[roomName].boostCreeps].forEach(([creepName, resource], index) => {
        if (!_.isString(creepName)) {
          statsConsole.log('err, for creepName, resource of boostCreeps: creepName is not a string');
          return;
        }
        if (!_.isString(resource)) {
          statsConsole.log('err, for creepName, resource of boostCreeps: resource is not a string');
          return;
        }

        /** @type {Creep} */
        const creep = Game.creeps[creepName];
        if (_.isUndefined(creep)) {
          Memory.rooms[roomName].boostCreeps.splice(index, 1);
          return;
        }

        if (creep.memory.hardRole == undefined) creep.memory.hardRole = creep.memory.role;
        if (creep.memory.role != 'boosting') creep.memory.role = 'boosting';
        if (!Object.keys(Game.structures).includes(creep.memory.labTarget))
          creep.memory.labTarget = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_LAB, mineralType: resource },
          }).id;
        /** @type {StructureLab} */
        const labTarget = Game.getObjectById(creep.memory.labTarget);
        const boostCreepReturn = labTarget.boostCreep(creep);
        if (boostCreepReturn == ERR_NOT_IN_RANGE) {
          creep.moveTo(labTarget, {
            visualizePathStyle: { stroke: '#D72483' },
          });
        }
      });
    }
    if (room.terminal && room.controller && room.controller.my) room.terminal.processTasks();
  }

  for (let flagName in Game.flags) {
    Game.flags[flagName].calcTask();
  }
  try {
    TempCode();
  } catch (e) {
    Console.log(`${e} at TempCode`);
  }
  // TempCode()
  // statsConsole.log('     ')
  // statsConsole.log('#1', 1)
  // statsConsole.log('#2', 2)
  // statsConsole.log('#3', 3)
  // statsConsole.log('#4', 4)
  // statsConsole.log('#5', 5)
  // if (Game.time % 5 === 0) {
  statsConsole.run(); // Run Stats collection
  let opts = {
    vBar: '║',
    hBar: '═',
    leftTopCorner: '╔',
    rightTopCorner: '╗',
    leftBottomCorner: '╚',
    rightBottomCorner: '╝',
  };
  console.log('\n'.repeat(20));
  console.log(statsConsole.displayHistogram());
  console.log(statsConsole.displayStats(opts));
  console.log(statsConsole.displayLogs(opts));
  if (Memory.stats.logs.length > 300) Memory.stats.logs.shift();
  //console.log(statsConsole.displayMaps()); // Don't use as it will consume ~30-40 CPU
  // totalTime = (Game.cpu.getUsed() - totalTime);
  // console.log("Time to Draw: " + totalTime.toFixed(2));
  // }
  watcher();
}

function TempCode() {}

function roomLogic(roomName) {
  if (Game.rooms[roomName] && Game.rooms[roomName].controller != undefined && Game.rooms[roomName].controller.my) {
    const defaultHardMemory = {
      notifyOnDisplayReset: true,
      commentsOnDisplayReset: true,
      notifyOnTerminalDeal: true,
      importListOfRoles: false,
      listOfRoles: [],
    };
    const defaultdisplayData = {
      enabled: true,
      displayLDH: 'ROOM',
      fill: '121212',
      displayGraph: true,
      lastStorage: {
        energy: [[Game.time, Game.rooms[roomName].storage ? Game.rooms[roomName].storage.store.energy : 0]],
      },
    };
    if (typeof Memory.rooms !== 'object') Memory.rooms = {};
    if (typeof Memory.hardMemory !== 'object') Memory.hardMemory = { rooms: {} };
    if (typeof Memory.rooms[roomName] !== 'object')
      Memory.rooms[roomName] = {
        whiteList: ['Den_loob'],
        displayData: defaultdisplayData,
        boostCreeps: [],
      };
    if (typeof Memory.rooms[roomName].displayData !== 'object') Memory.rooms[roomName].displayData = defaultdisplayData;
    if (typeof Memory.hardMemory.rooms[roomName] !== 'object') Memory.hardMemory.rooms[roomName] = defaultHardMemory;
    const roomMemory = Memory.rooms[roomName];
    let displayData = roomMemory.displayData;
    const hardMemory = Memory.hardMemory.rooms[roomName];
    if (typeof displayData === 'object' && !_.isEqual(Object.keys(displayData).sort(), Object.keys(defaultdisplayData).sort())) {
      if (Memory.hardMemory.rooms[roomName].notifyOnDisplayReset) {
        statsConsole.log(`DISPLAY DATA RESET FOR ROOM ${roomName}!`);
        if (hardMemory.commentsOnDisplayReset) {
          statsConsole.log(
            `// you can disable this message by running >> Memory.hardMemory.rooms[${roomName}].notifyOnDisplayReset=false;\n// you also can disable this comments buy running >> Memory.hardMemory.rooms[${roomName}].commentsOnDisplayReset=false;`
          );
        }
      }
      displayData = defaultdisplayData;
    }
    if (typeof hardMemory === 'object' && !_.isEqual(Object.keys(hardMemory).sort(), Object.keys(defaultHardMemory).sort())) {
      statsConsole.log(
        `\nERROR: hardMemory keys are wrong, you can set it to default by running >> Memory.hardMemory.rooms['${roomName}']=${JSON.stringify(
          defaultHardMemory
        )};\nor you can add keys to the hardMemory of the room ${roomName} manually,\nlist of all needed keys: [${_.difference(
          Object.keys(defaultHardMemory),
          Object.keys(hardMemory)
        ).join(', ')}]`
      );
    }
    if (typeof displayData === 'object') {
      if (displayData.fill != 'transparent' && !displayData.fill.startsWith('#')) displayData.fill = `#${displayData.fill}`;

      if (displayData.enabled) Game.rooms[roomName].displayData();

      if (!_.isEqual(roomMemory.displayData, displayData)) roomMemory.displayData = displayData;
    }
  }
}

/**
 * @param  {string} roomName
 * @param  {Room.costMatrix} matrix
 */
function roomCallback(roomName, matrix) {
  if (Memory.rooms && Memory.rooms[roomName] && Memory.rooms[roomName].avoid) return false;
  else if (!Game.rooms[roomName]) return matrix;
  let room = Game.rooms[roomName];
  let hostiles = room.find(FIND_HOSTILE_CREEPS, {
    filter: (c) => _.some(c.body, (b) => b.type == ATTACK || b.type == RANGED_ATTACK),
  });
  hostiles.forEach((h) => {
    if (_.some(h.body, (b) => b.type == RANGED_ATTACK)) {
      for (let x of _.range(-3, 4))
        for (let y of _.range(-3, 4)) {
          matrix.set(h.pos.x + x, h.pos.y + y, 255);
          room.visual.circle(h.pos.x + x, h.pos.y + y, { fill: 'blue' });
        }

      // for (let x of _.range(-4, 5))
      // for (let y of _.range(-4, 5))
      //     if (Math.abs(x) == 4 || Math.abs(y) == 4)
      //         matrix.set(h.pos.x + x, h.pos.y + y, 200);
    } else {
      /**
            @ => hostile
            + - | => matrix 255 border
            = & ! => 200 border
            &===&
            !+-+!
            !|@|!
            !+-+!
            &===&

             */
      for (let x of _.range(-1, 2)) {
        for (let y of _.range(-1, 2)) {
          matrix.set(h.pos.x + x, h.pos.y + y, 255);
          room.visual.circle(h.pos.x + x, h.pos.y + y, { fill: 'blue' });
        }
      }

      // for (let x of _.range(-2, 3)) {
      //     for (let y of _.range(-2, 3))
      //         if (Math.abs(x) == 2 || Math.abs(y) == 2)
      //             matrix.set(h.pos.x + x, h.pos.y + y, 200);
      // }
    }
  });
  return matrix;
}
// Game.rooms.W22S33.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LAB}})[0].boostCreep(Game.creeps[''])
