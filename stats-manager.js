function getMyRooms() {
    return Object.keys(Game.rooms)
        .map(function (i) { return Game.rooms[i]; })
        .filter(function (i) { return i.controller && i.controller.my; })
        .map(function (i) { return Game.rooms[i.name]; });
}
var StatsManager = /** @class */ (function () {
    function StatsManager() {
    }
    StatsManager.runForAllRooms = function () {
        if (Game.time % 13 > 0) {
            return;
        }
        var cpu = Game.cpu.getUsed();
        var myRooms = getMyRooms();
        var allCreeps = Object.keys(Game.creeps).map(function (i) { return Game.creeps[i]; });
        var roomStats = myRooms.map(function (room) {
            var ctrl = room.controller;
            var storage = room.storage ? room.storage.store.energy : 0;
            var controller = room.controller ? room.controller.progress : 0;
            var walls = _.sum(room
                .find(FIND_STRUCTURES)
                .filter(function (i) { return i.structureType === STRUCTURE_WALL; })
                .map(function (i) { return i.hits / 100; }));
            var ramparts = _.sum(room
                .find(FIND_MY_STRUCTURES)
                .filter(function (i) { return i.structureType === STRUCTURE_RAMPART; })
                .map(function (i) { return i.hits / 100; }));
            var total = storage + controller + walls + ramparts;
            room.memory.lastProgressChecktime = Game.time;
            room.memory.lastProgress = total;
            var spawnsUsage = room.find(FIND_MY_SPAWNS).length ? _.sum(room.find(FIND_MY_SPAWNS).map(function (i) { return (i.spawning ? 1 : 0); })) / room.find(FIND_MY_SPAWNS).length : 0;
            var storedEnergy = room.storage ? room.storage.store.energy : 0;
            var progressPercent = ctrl.progressTotal ? ctrl.progress / ctrl.progressTotal : 0;
            return {
                name: room.name,
                rcl: ctrl.level,
                rclP: ctrl.level + progressPercent,
                energy: room.energyAvailable,
                energyCapacity: room.energyCapacityAvailable,
                progress: ctrl.progress,
                progressTotal: ctrl.progressTotal,
                progressPercent: ctrl.progress / ctrl.progressTotal,
                underSiege: room.memory.isUnderSiege ? 1 : 0,
                energyAccumulated: total,
                spawnsUsage: spawnsUsage,
                storedEnergy: storedEnergy,
                creepsCount: _.countBy(allCreeps.filter(function (i) { return i.memory.homeRoom === room.name; }), function (c) { return c.memory.role; })
            };
        });
        let stats = {
            tick: Game.time,
            gcl: Game.gcl.level,
            roomsCount: myRooms.length,
            gclProgress: Game.gcl.progress,
            gclProgressTotal: Game.gcl.progressTotal,
            creeps: Object.keys(Game.creeps).length,
            cpu: Game.cpu.getUsed(),
            cpuMax: Game.cpu.limit,
            cpuPercent: cpu / Game.cpu.limit,
            bucket: Game.cpu.bucket,
            siegedRooms: myRooms.filter(function (i) { return i.memory.isUnderSiege; }).length,
            rooms: _.mapValues(_.groupBy(roomStats, function (i) { return i.name; }), function (i) { return i[0]; })
        };
        for (let stat of Object.keys(stats)) {
            Memory.stats[stat] = stats[stat];
        }

        if (!_.isArray(Memory.stats.logs)) Memory.stats.logs = [];
        if (!_.isArray(Memory.stats.__cpu)) Memory.stats.__cpu = [];
        Memory.stats.__cpu.push(Game.cpu.getUsed())
    };
    return StatsManager;
}());
module.exports = StatsManager;
