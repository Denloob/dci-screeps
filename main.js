// import modules
require('prototype.flag');
require('prototype.room');
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.terminal');

module.exports.loop = function() {
    if (Game.cpu.bucket == 10000) {
        Game.cpu.generatePixel();
    }
    var CreepsDied = undefined;
    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];

            if (CreepsDied == undefined) CreepsDied = name
            else CreepsDied += ', ' + name
        }
        // if (Game.creeps[name].memory.role == 'longDistanceHarvester') {
        //     Game.creeps[name].memory.role = 'LDH'
        // }
    }



    // for each creeps
    for (let name in Game.creeps) {
        if (Game.creeps[name].memory.role != undefined)
            // run creep logic
            Game.creeps[name].runRole();
    }

    // find all towers
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    // for each tower
    for (let tower of towers) {
        // run tower logic
        tower.main();
    }

    // for each spawn
    for (let spawnName in Game.spawns) {
        // run spawn logic
        Game.spawns[spawnName].spawnCreepsIfNecessary(CreepsDied);
    }
    for (let roomName in Game.rooms) {
        roomLogic(roomName);
        if (Game.time % 10 == 0) {
            let room = Game.rooms[roomName]
            if (room.terminal && room.controller && room.controller.my) room.terminal.processTasks();
        }
    }

    for (let flagName in Game.flags) {
        Game.flags[flagName].calcTask();
    }
    

    // console.log(Game.rooms.E9N23.terminal.sendEnergy('E8N23', 100000));
    // Game.creeps['LDH E7N23_27'].moveTo(40, 7)
    // var creepName = 'clai';
    // var roomName = Game.creeps[creepName] != undefined ? Game.creeps[creepName].room: undefined;
    // if (roomName != undefined) {
    //     var spawnName = Game.creeps[creepName].room.name == 'E8N23'? 'Spawn1': 'Spawn2'
    //     // var spawnName = 'Spawn1';
    //     var spawnCords = spawnName == 'Spawn1' ? [17, 27] : [25, 25];
    //     creep_ = Game.creeps[creepName]
    //     if (creep_ != undefined) {
    //         creep_.moveTo(spawnCords[0], spawnCords[1], {visualizePathStyle: {stroke: '#000000'}})
    //         Game.spawns[spawnName].recycleCreep(Game.creeps[creepName])
    //     }
    // }
    // Game.creeps['Healer Dismantler E7N24_13_41'].move(TOP)
    // Game.creeps['Dismantler Dismantler E7N24_13_32'].move(TOP)
    // Game.creeps['Dismantler Dismantler E7N24_13_10'].move(TOP)
    // Game.creeps['Dismantler E7N24_13'].move(TOP)
    // Game.creeps.builder49.moveTo(10, 0)
    // Game.creeps.builder70.moveTo(10, 0)

    // Game.spawns.Spawn1.createAttacker(4000, 15, 0, 0, 'E7N23', true)
};

function roomLogic(roomName) {
    if (Game.rooms[roomName].controller != undefined && Game.rooms[roomName].controller.my) { 
        let defaultHardMemory = {notifyOnDisplayReset: true, commentsOnDisplayReset: true, notifyOnTerminalDeal: true};
        if (typeof Memory.rooms !== 'object') Memory.rooms = {};
        if (typeof Memory.hardMemory !== 'object') Memory.hardMemory = {rooms: {}};
        if (typeof Memory.rooms[roomName] !== 'object') Memory.rooms[roomName] = {whiteList: ['Den_loob'], displayData: {enabled: true, displayLDH: 'ROOM', fill: '121212', importListOfRoles: false, listOfRoles: []}};
        if (typeof Memory.rooms[roomName].displayData !== 'object') Memory.rooms[roomName].displayData = {enabled: true, displayLDH: 'ROOM', fill: '121212', importListOfRoles: false, listOfRoles: []};
        if (typeof Memory.hardMemory.rooms[roomName] !== 'object') Memory.hardMemory.rooms[roomName] = defaultHardMemory;
        let roomMemory = Memory.rooms[roomName];
        let displayData = roomMemory.displayData;
        let hardMemory = Memory.hardMemory.rooms[roomName]
        if (typeof displayData === 'object' && !_.isEqual(Object.keys(displayData), ['enabled', 'displayLDH', 'fill', 'importListOfRoles', 'listOfRoles']) ) {
            if (Memory.hardMemory.rooms[roomName].notifyOnDisplayReset) {
                console.log(`DISPLAY DATA RESET FOR ROOM ${roomMemory}!`);
                if (commentsOnDisplayReset) {
                console.log(`// you can disable this message by running >> Memory.hardMemory.rooms[${roomName}].notifyOnDisplayReset=false;\n// you also can disable this comments buy running >> Memory.hardMemory.rooms[${roomName}].commentsOnDisplayReset=false;`);
                }
            }
            displayData = {enabled: true, displayLDH: 'ROOM', fill: '121212', importListOfRoles: false, listOfRoles: []};
        }
        if (typeof hardMemory === 'object' && !_.isEqual(Object.keys(hardMemory), Object.keys(defaultHardMemory)) ) {
            console.log(`\nERROR: hardMemory keys are wrong, you can set it to default by running >> Memory.hardMemory.rooms['${roomName}']=${JSON.stringify(defaultHardMemory)};\nor you can add keys to the hardMemory of the room ${roomName} manually,\nlist of all needed keys: [${_.difference(Object.keys(defaultHardMemory), Object.keys(hardMemory)).join(', ')}]`)
        }
        if (typeof displayData === 'object') {
            if (displayData.fill != 'transparent' && !displayData.fill.startsWith('#')) displayData.fill = `#${displayData.fill}`;

            if (displayData.enabled) Game.rooms[roomName].displayData();

            if (!_.isEqual(roomMemory.displayData, displayData)) roomMemory.displayData = displayData;
        }
    }
};