const gray = '#7b7b7b';
let lastRectSizesGlobal = {};
Room.prototype.displayData = function () {
  if (lastRectSizesGlobal[this.name] == undefined) {
    lastRectSizesGlobal[this.name] = [20, 6, 20];
  }
  let lastRectSizes = lastRectSizesGlobal[this.name];
  // get the memory of one of the spawns
  let roomSpawnMemory = this.find(FIND_MY_SPAWNS).length ? Memory.spawns[this.find(FIND_MY_SPAWNS)[0].name] : undefined;
  let roomMemory = Memory.rooms[this.name];
  let displayData = roomMemory.displayData;
  let fillRect = displayData.fill;
  // setup listOfRoles

  // // install "Better Comments" to vscode now if u r not gay
  // // install "Better Comments" to vscode now if u r not gay
  // // install "Better Comments" to vscode now if u r not gay
  // // install "Better Comments" to vscode now if u r not gay
  // // install "Better Comments" to vscode now if u r not gay
  // // install "Better Comments" to vscode now if u r not gay
  // // install "Better Comments" to vscode now if u r not gay
  // // install "Better Comments" to vscode now if u r not gay
  let listOfRoles = undefined;
  let displayedLDHs = undefined;
  let ldhMin = undefined;
  if (this.find(FIND_MY_SPAWNS).length) {
    if (roomMemory.importListOfRoles) listOfRoles = roomMemory.listOfRoles;
    else listOfRoles = ['harvester', 'collector', 'attacker', 'dismantler', 'claimer', 'upgrader', 'TM', 'MH', 'repairer', 'builder', 'wallRepairer'];
    displayedLDHs = [];

    // add LDH or LDC from spawn memory (ROOM_INDEX_WORK)
    ldhMin = roomSpawnMemory.minLongDistanceHarvesters;
    if (ldhMin == undefined) ldhMin = roomSpawnMemory.minLDH;
    if (ldhMin != undefined) {
      let ldhMinData = Object.keys(ldhMin);
      ldhMinData.forEach((data) => {
        if (ldhMin[data] > 0) {
          // if ldh data is not in the list of roles, add it
          if (!listOfRoles.includes(`$$LDH_${data}`)) listOfRoles.push(`$$LDH_${data}`);
        }
      });
    }
  }
  // User Data rect
  this.visual.rect(0, 0, 9, 9, { fill: fillRect, stroke: gray });
  this.visual.text('User Data', 1, 1.3, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });
  let cpuPersentage = Math.round(((Game.cpu.getUsed() * 100) / Game.cpu.limit) * 10) / 10;
  let cpuCollor = cpuPersentage < 50 ? 'green' : cpuPersentage < 80 ? 'orange' : cpuPersentage < 100 ? '#f12e01' : 'red';
  this.visual.text(`CPU:`, 1, 3, { color: cpuCollor, font: 0.8, align: LEFT });
  this.visual.text(`${cpuPersentage}%`, 4, 3, {
    color: cpuCollor,
    font: 0.8,
    align: LEFT,
  });
  let bucketPersentage = Math.round((Game.cpu.bucket / 10000) * 100 * 10) / 10;
  let bucketCollor = cpuPersentage < 20 ? 'red' : 'green';
  this.visual.text(`BKT:`, 1, 4, {
    color: bucketCollor,
    font: 0.8,
    align: LEFT,
  });
  this.visual.text(`${bucketPersentage}%`, 4, 4, {
    color: bucketCollor,
    font: 0.8,
    align: LEFT,
  });
  let gclPersentage = Math.round((Game.gcl.progress / Game.gcl.progressTotal) * 100 * 10) / 10;
  this.visual.text(`GCL:`, 1, 5, { color: '#069090', font: 0.8, align: LEFT });
  this.visual.text(`${gclPersentage}%`, 4, 5, {
    color: '#069090',
    font: 0.8,
    align: LEFT,
  });
  this.visual.text(`LVL:`, 1.005, 6, {
    color: '#069090',
    font: 0.8,
    align: LEFT,
  });
  this.visual.text(`${Game.gcl.level}`, 4, 6, {
    color: '#069090',
    font: 0.8,
    align: LEFT,
  });
  this.visual.text(`Viewing: [ ${this.name} ]`, 1, 8, {
    color: '#DEDEDE',
    font: 0.8,
    align: LEFT,
  });

  let listOfNotLimitedRoles = [];
  let listOfLimitedRoles = [];
  if (this.find(FIND_MY_SPAWNS).length)
    listOfRoles.forEach((role) => {
      if (role == 'MH' || role == 'MM' || role == 'TM' || role == 'builder') {
        role = `@@${role}`;
      }
      if (role.startsWith('$$')) {
        listOfLimitedRoles.push(role.replace('$$', ''));
        return;
      } else if (role.startsWith('@@')) {
        listOfLimitedRoles.push(role);
        return;
      }

      let neededCreeps = roomSpawnMemory.minCreeps[role];
      if (neededCreeps != undefined) listOfLimitedRoles.push(role);
      else listOfNotLimitedRoles.push(role);
    });
  this.visual.rect(0, 10, 9, lastRectSizes[0], {
    fill: fillRect,
    stroke: gray,
  }); // creeps info rect
  this.visual.text(`Creeps Info`, 1, 11, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });

  /** @type {Object.<string, number>} */
  let creepsInRoom = this.find(FIND_MY_CREEPS);

  let endIndex = 14.5;
  let actionRequired = false;

  let limitedRolesCollor = actionRequired ? 'orange' : 'green';
  this.visual.text(`Limited Roles`, 1, 13, {
    color: limitedRolesCollor,
    font: 0.8,
    align: LEFT,
  });

  // used to fix the indent problem with LDH with diffrent sourceIndex but same room
  let antiIndet = 0;
  if (this.find(FIND_MY_SPAWNS).length)
    listOfLimitedRoles.forEach((role, indent) => {
      let neededCreeps = roomSpawnMemory.minCreeps[role];
      let numOfCreeps = _.sum(creepsInRoom, (c) => c.memory.role == role);
      if (neededCreeps == undefined || role.startsWith('@@')) {
        if (role.startsWith('LDH')) {
          let [type, roomName, sourceIndex, numberOfWorkParts] = role.split('_');
          role = roomName;
          let data = undefined;
          switch (displayData.displayLDH) {
            case 'ROOM':
              if (!displayedLDHs.includes(roomName)) {
                role = `LDH ${roomName}`;
                // get num of ldh with the roomName target
                numOfCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'LDH' && c.memory.target == roomName && c.memory.home == this.name);
                // create copy of ldhMin
                data = Object.assign({}, ldhMin);
                // make objec wich contains only keys that start with roomName, get, the values, and sum them ([1, 2, 3] => 6) so {aa: 1, ab: 2, bc: 3} will return 3
                neededCreeps = Object.values(
                  Object.keys(data)
                    .filter(function (k) {
                      return k.indexOf(roomName) == 0;
                    })
                    .reduce(function (newData, k) {
                      newData[k] = data[k];
                      return newData;
                    }, {})
                ).reduce((partial_sum, a) => partial_sum + a, 0);
                displayedLDHs.push(roomName);
              } else {
                antiIndet--;
                return;
              }
              break;

            case 'ROOM_INDEX':
              if (!displayedLDHs.includes(roomName + sourceIndex)) {
                role = `${roomName}_${sourceIndex}`;
                numOfCreeps = _.sum(Game.creeps, (c) => c.memory.role == 'LDH' && c.memory.target == roomName && c.memory.sourceIndex == sourceIndex && c.memory.home == this.name);
                // create copy of ldhMin
                data = Object.assign({}, ldhMin);
                // make object wich contains only keys that start with roomName, get, the values, and sum them ([1, 2, 3] => 6) so {aa: 1, ab: 2, bc: 3} will return 3
                neededCreeps = Object.values(
                  Object.keys(data)
                    .filter(function (k) {
                      return k.indexOf(`${roomName}_${sourceIndex}`) == 0;
                    })
                    .reduce(function (newData, k) {
                      newData[k] = data[k];
                      return newData;
                    }, {})
                ).reduce((partial_sum, a) => partial_sum + a, 0);
                displayedLDHs.push(roomName + sourceIndex);
              } else {
                antiIndet--;
                return;
              }
              break;

            default:
              Console.log('ERROR: unexpected display LDH mode');
          }
        } else if (role.startsWith('@@')) {
          role = role.replace('@@', '');
          if (role == 'MH') {
            let roomMineral = this.find(FIND_MINERALS)[0];
            let roomExtractor = this.find(FIND_STRUCTURES, {
              filter: (s) => s.structureType == STRUCTURE_EXTRACTOR,
            })[0];
            let needMineralWorker = roomExtractor != undefined && roomMineral != undefined && roomMineral.mineralAmount > 0;
            neededCreeps = needMineralWorker ? roomSpawnMemory.minCreeps[role] : 0;
          } else if (role == 'TM') {
            if (
              roomMemory.terminal &&
              _.isEqual(Object.keys(roomMemory.terminal), ['enabled', 'autoSell', 'from', 'to']) &&
              roomMemory.terminal.enabled &&
              (_.some(roomMemory.terminal.to, { enabled: true }) || _.some(roomMemory.terminal.from, { enabled: true }))
            ) {
              neededCreeps = roomSpawnMemory.minCreeps[role];
            } else neededCreeps = 0;
          } else if (role == 'builder') {
            if (this.find(FIND_MY_CONSTRUCTION_SITES).length) {
              neededCreeps = roomSpawnMemory.minCreeps[role];
            } else neededCreeps = 0;
          }
          numOfCreeps = _.sum(creepsInRoom, (c) => c.memory.role == role);
        } else {
          Console.log('ERROR: Role type undefined');
        }
      }
      let color = undefined;
      if (neededCreeps != undefined) {
        color = numOfCreeps != neededCreeps ? 'red' : 'green';
        this.visual.text(`${role} ${numOfCreeps}/${neededCreeps}`, 1, 14.5 + indent + antiIndet, { color: color, font: 0.8, align: LEFT });
      } else {
        color = 'orange';
        this.visual.text(`${role} ${numOfCreeps}`, 1, 14.5 + indent + antiIndet, { color: color, font: 0.8, align: LEFT });
      }
      if (color != 'green') actionRequired = true;
      endIndex = 14.5 + indent + antiIndet;
    });

  this.visual.text(`Not Limited Roles`, 1, endIndex + 2, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });
  endIndex += 3.5;
  listOfNotLimitedRoles.forEach((role, indent) => {
    // TODO make so if creeps is ordered but is not ready, red text clr, else green
    this.visual.text(`${role} ${_.sum(creepsInRoom, (c) => c.memory.role == role)}`, 1, endIndex, { color: '#B5B5B5', font: 0.8, align: LEFT });
    endIndex++;
  });
  endIndex++;
  lastRectSizes[0] = endIndex - 10;

  // general Info rect
  this.visual.rect(40, 0, 9, lastRectSizes[1], {
    fill: fillRect,
    stroke: gray,
  });
  this.visual.text('General Info', 41, 1.3, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });

  let spawnsInRoom = this.find(FIND_MY_SPAWNS);
  endIndex = 2.8;
  spawnsInRoom.forEach((spawn, indent) => {
    this.visual.text(`${spawn.name}`, 41, 2.8 + 2 * indent, {
      color: 'white',
      font: 0.7,
      align: LEFT,
    });
    if (spawn.spawning) this.visual.text(`Spawning: ${Game.creeps[spawn.spawning.name].memory.role}`, 41, 3.6 + 1.9 * indent, { color: 'green', font: 0.7, align: LEFT });
    else
      this.visual.text(`Spawning: false`, 41, 3.6 + 1.9 * indent, {
        color: 'grey',
        font: 0.7,
        align: LEFT,
      });
    endIndex = 2 + indent;
  });
  endIndex *= 1.9;
  endIndex++;
  lastRectSizes[1] = endIndex;

  endIndex++;
  let endIndexCopy = endIndex;

  // room data rect
  this.visual.rect(40, endIndexCopy, 9, lastRectSizes[2], {
    fill: fillRect,
    stroke: gray,
  });
  endIndex += 1.5;
  this.visual.text('Room Data:', 41, endIndex, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });
  endIndex += 2;
  if (this.storage != undefined) {
    this.visual.text('Storage: ', 41, endIndex, {
      color: 'white',
      font: 0.8,
      align: LEFT,
    });
    let storagePersentage = Math.round((this.storage.store.getUsedCapacity() / this.storage.store.getCapacity()) * 100 * 10) / 10;
    this.visual.text(`(${storagePersentage}%)`, 44.7, endIndex, {
      color: 'white',
      font: 0.8,
      align: LEFT,
    });
    endIndex += 1.5;
    let storageResources = Object.keys(this.storage.store);
    storageResources.forEach((resource, indent) => {
      let resourceNum = this.storage.store[resource];
      if (resourceNum > 0) {
        resourceNumStr = resourceNum < 1000 ? resourceNum : Math.round(resourceNum / 1000) + 'k';
        this.visual.resource(resource, 41.5, endIndex + indent / 2 - 0.3, 0.5);
        if (indent == 0) endIndex -= 0.1;
        this.visual.text(`${resource}`, 42.2, endIndex + indent / 2, {
          color: 'white',
          font: 0.8,
          align: LEFT,
        });
        this.visual.text(`${resourceNumStr}`, 45, endIndex + indent / 2, {
          color: 'white',
          font: 0.8,
          align: LEFT,
        });
        endIndex += 0.7;
      }

      if (displayData.displayGraph) {
        let resourceArray = displayData.lastStorage[resource];
        if (!_.isArray(resourceArray) || resourceArray.length == 0) resourceArray = [[Game.time, resourceNum]];
        let lastResourceNumSaved = resourceArray[resourceArray.length - 1][1];
        if (Math.abs(lastResourceNumSaved - resourceNum) > 2000) {
          resourceArray.push([Game.time, resourceNum]);
        }
        while (resourceArray.length > 10) resourceArray.shift();
        displayData.lastStorage[resource] = resourceArray;
      }
    });
    endIndex += storageResources.length / 2;
    endIndex++;

    // Storage stats
    if (displayData.displayGraph) {
      for (let resourceName in displayData.lastStorage) {
        let resourceArray = displayData.lastStorage[resourceName];
        if (!_.isArray(resourceArray)) {
          resourceArray = [[Game.time, this.storage.store[resourceName]]];
          displayData.lastStorage[resourceName] = resourceArray;
        }
        if (resourceArray.length < 2) continue;
        // define starting position
        let lastCords;

        // calculate tick per block
        let ticksPerBlock = [...resourceArray];
        // get the smallest two points by time if there is more then 2 points
        if (resourceArray.length > 2) ticksPerBlock = ticksPerBlock.sort((a, b) => a[0] - b[0]).slice(0, 2);
        //// ticksPerBlock = ticksPerBlock.sort((a, b) => a[0]-b[0]);
        ticksPerBlock = ticksPerBlock[1][0] - ticksPerBlock[0][0];

        // calculate resourceNum per block
        let resourcePerBlock = [...resourceArray];
        // get the smallest two points by resource if there is more then 2 points
        if (resourceArray.length > 2) resourcePerBlock = resourcePerBlock.sort((a, b) => b[1] - a[1]).slice(0, 2);
        //// ticksPerBlock = ticksPerBlock.sort((a, b) => a[0]-b[0]);
        resourcePerBlock = resourcePerBlock[1][1] - resourcePerBlock[0][1];

        //calculate resourceNum value
        let smallestResourceNum = [...resourceArray].sort((a, b) => a[0] - b[0])[0][1];

        // calculate min tick
        let minTick = [...resourceArray].sort((a, b) => a[0] - b[0])[0][0];

        // iterate over each resource record
        for (let [tick, num] of resourceArray) {
          // currentCords = [(tick - minTick) / ticksPerBlock + 1, 48 - num / resourcePerBlock - 2 + biggesResourceNum / resourcePerBlock];
          currentCords = [(tick - minTick) / ticksPerBlock + 1, num / resourcePerBlock + 48 - (smallestResourceNum / resourcePerBlock + 1)];
          lastCords = lastCords || currentCords;
          if (_.isEqual(lastCords, currentCords)) continue;
          // create visual line from last cord
          this.visual.line(lastCords[0], lastCords[1], currentCords[0], currentCords[1], { color: RESOURCE_COLORS[resourceName] });
          this.visual.resource(resourceName, currentCords[0], currentCords[1], 0.1);
          lastCords = currentCords;
        }
      }
      this.visual.line(1, 48, 1, 39, { color: gray, opacity: 0.9 });
      this.visual.line(1, 48, 22, 48, { color: gray, opacity: 0.9 });
      for (let i = 39; i <= 48; i += 0.6) this.visual.line(1, i, 22, i, { color: gray, opacity: 0.02 });
      for (let i = 1; i < 22; i += 0.6) this.visual.line(i, 48, i, 39, { color: gray, opacity: 0.02 });
      this.visual.line(22, 48, 22, 39, { color: gray, opacity: 0.02 });
    }
  }
  if (this.terminal != undefined) {
    this.visual.text('Terminal: ', 41, endIndex, {
      color: 'white',
      font: 0.8,
      align: LEFT,
    });
    let terminalPersentage = Math.round((this.terminal.store.getUsedCapacity() / this.terminal.store.getCapacity()) * 100 * 10) / 10;
    this.visual.text(`(${terminalPersentage}%)`, 44.7, endIndex, {
      color: 'white',
      font: 0.8,
      align: LEFT,
    });
    endIndex += 1;
    let terminalResources = Object.keys(this.terminal.store);
    terminalResources.forEach((resource, indent) => {
      let resourceNum = this.terminal.store[resource];
      if (resourceNum > 0) {
        resourceNum = resourceNum < 1000 ? resourceNum : Math.round(resourceNum / 1000) + 'k';
        this.visual.resource(resource, 41.5, endIndex + indent / 2 - 0.3, 0.5);
        endIndex -= 0.1;
        this.visual.text(`${resource}`, 42.2, endIndex + indent / 2, {
          color: '#DEDEDE',
          font: 0.8,
          align: LEFT,
        });
        this.visual.text(`${resourceNum}`, 45, endIndex + indent / 2, {
          color: '#DEDEDE',
          font: 0.8,
          align: LEFT,
        });
        endIndex++;
      }
    });
    endIndex += terminalResources.length / 2;
    endIndex++;
    // if terminal memory is set properly
    if (Memory.rooms[this.name].terminal && _.isEqual(Object.keys(Memory.rooms[this.name].terminal), ['enabled', 'autoSell', 'from', 'to'])) {
      let terminalMemory = Memory.rooms[this.name].terminal;
      // if the terminal is on
      if (terminalMemory.enabled) {
        if (_.some(terminalMemory.autoSell, { enabled: true })) {
          this.visual.text('autoSell: ', 41.2, endIndex, {
            color: 'gold',
            font: 0.8,
            align: LEFT,
          });
          endIndex++;
          terminalMemory.autoSell.forEach((autoSell) => {
            if (autoSell.enabled) {
              this.visual.resource(autoSell.resource, 41.8, endIndex, 0.5);
              endIndex++;
              this.visual.text(`MP: ${autoSell.minPrice}, MD: ${autoSell.maxDistance}`, 42.2, endIndex, { color: '#DEDEDE', font: 0.8, align: LEFT });
              endIndex++; // minPrice, minDistance
            }
          });
        }
        if (_.some(terminalMemory.to, { enabled: true })) {
          this.visual.text('TO: ', 41.2, endIndex, {
            color: 'DeepSkyBlue',
            font: 0.8,
            align: LEFT,
          });
          endIndex++;
          terminalMemory.to.forEach((to) => {
            if (to.enabled) {
              this.visual.resource(to.dealData != undefined ? to.dealData.resourceType : to.resource, 41.8, endIndex, 0.5);
              endIndex++;
              let moreInfo = to.order && to.resource != undefined ? `order SELL: ${to.resource}` : `${to.dealData.roomName} ${to.dealData.price}$`;
              this.visual.text(moreInfo, 42.2, endIndex, {
                color: '#DEDEDE',
                font: 0.8,
                align: LEFT,
              });
              endIndex++;
            }
          });
        }
        if (_.some(terminalMemory.from, { enabled: true })) {
          this.visual.text('FROM: ', 41.2, endIndex, {
            color: 'DeepPink',
            font: 0.8,
            align: LEFT,
          });
          endIndex++;
          terminalMemory.from.forEach((from) => {
            if (from.enabled) {
              this.visual.resource(from.dealData != undefined ? from.dealData.resourceType : from.resource, 41.8, endIndex, 0.5);
              endIndex++;
              let moreInfo = from.order && from.resource != undefined ? `order BUY` : `${from.dealData.roomName} ${from.dealData.price}$`;
              moreInfo += from.toStructure != undefined ? ` to ${from.toStructure}` : '';
              this.visual.text(moreInfo, 42.2, endIndex, {
                color: '#DEDEDE',
                font: 0.8,
                align: LEFT,
              });
              endIndex++;
            }
          });
        }
        endIndex += 2;
      }
    }
  }
  let energyInTheRoomCollor = this.energyAvailable == this.energyCapacityAvailable ? 'green' : this.energyAvailable >= this.energyCapacityAvailable / 3 ? 'orange' : 'red';
  this.visual.text(`Energy in The Room:`, 41, endIndex, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });
  endIndex++;
  let energyPersentage = Math.round((this.energyAvailable / this.energyCapacityAvailable) * 100 * 10) / 10;
  this.visual.text(`${this.energyAvailable}/${this.energyCapacityAvailable}  (${energyPersentage}%)`, 41, endIndex, { color: energyInTheRoomCollor, font: 0.8, align: LEFT });
  endIndex++;
  endIndex++;

  this.visual.text(`Room Level:`, 41, endIndex, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });
  this.visual.text(`${this.controller.level}`, 46, endIndex, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });
  endIndex++;
  let controllerProgressPersentage = Math.round((this.controller.progress / this.controller.progressTotal) * 100 * 10) / 10;
  this.visual.text(`Progress:`, 41, endIndex, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });
  this.visual.text(`${controllerProgressPersentage}%`, 46, endIndex, {
    color: 'white',
    font: 0.8,
    align: LEFT,
  });
  endIndex++;
  lastRectSizes[2] = endIndex - endIndexCopy;
};
Room.prototype.options = function (name, data) {
  if (name != undefined && data != undefined) {
    Memory.rooms[this.name].displayData[name] = data;
    return `Set room ${this.name} display option ${name} to ${data}`;
  } else return `ERROR: Expected option name and data that will be assigned to a given option name`;
};
Room.prototype.hardOptions = function (name, data) {
  if (name != undefined && data != undefined) {
    Memory.hardMemory.rooms[this.name][name] = data;
    return `Set room ${this.name} hard option ${name} to ${data}`;
  } else return `ERROR: Expected option name and data that will be assigned to a given option name`;
};
Room.prototype.globalOption = function (name, data, roomList = false) {
  if (name != undefined && data != undefined) {
    if (!roomList) roomList = Object.keys(Game.rooms).filter((roomName) => Game.rooms[roomName].controller && Game.rooms[roomName].controller.my);
    for (roomName of roomList) {
      Memory.rooms[roomName].displayData[name] = data;
    }
    if (roomList.length == 1) return `Set room ${roomList.join(', ')} option ${name} to ${data}`;
    else if (roomList.length > 1) return `Set rooms ${roomList.join(', ')} option ${name} to ${data}`;
    else return `Sorry, but no rooms found`;
  } else return `ERROR: Expected option name and data that will be assigned to a given option name`;
};
Room.prototype.globalHardOption = function (name, data, roomList = false) {
  if (name != undefined && data != undefined) {
    if (!roomList) roomList = Object.keys(Game.rooms).filter((roomName) => Game.rooms[roomName].controller && Game.rooms[roomName].controller.my);
    for (roomName of roomList) {
      Memory.hardMemory.rooms[roomName][name] = data;
    }
    if (roomList.length == 1) return `Set room ${roomList.join(', ')} hard option ${name} to ${data}`;
    else if (roomList.length > 1) return `Set rooms ${roomList.join(', ')} hard option ${name} to ${data}`;
    else return `Sorry, but no rooms found`;
  } else return `ERROR: Expected option name and data that will be assigned to a given option name`;
};
Room.prototype.help = {
  list: 'enabled, displayLDH, fill, options, importListOfRoles, listOfRoles, options, hardOptions, globalOption, globalHardOption.',
  enabled: 'bool, display the data if enabled = true.',
  displayLDH: 'string, how to display LDHs. can be ROOM or ROOM_INDEX.',
  fill: `fill color of rect in the hex format or 'transparent'.`,
  importListOfRoles: `bool, set to true if you want to use listOfRoles.`,
  listOfRoles: `if importListOfRoles is true, used instead of hardcoded listOfRoles.`,
  options: `change the given display option to given data, options(name, data) for example: options('fill', '#00ff00').`,
  hardOptions: `change the given hard option to given data, hardOptions isn't expected to change automatically,\nhardOptions(name, data) for example: hardOptions('notifyOnDisplayReset', false).`,
  globalOption: `change the given display option to given data for all/given rooms, options(name, data, [roomList]) for example: options('fill', '#00ff00').`,
  globalHardOption: `change the given hard option to given data for all/given rooms,\nhardOptions isn't expected to change automatically,\nhardOptions(name, data, [roomList]) for example: hardOptions('notifyOnDisplayReset', false).`,
};
