module.exports = {
    // a function to run the logic for creep role
    run: function(creep) {
        let room = creep.room;
        if (room.controller.my) {
            let spawn = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN)});
            creep.moveTo(spawn, {reusePath: 10, visualizePathStyle: {stroke: '#000000'}});
            spawn.recycleCreep(creep);
        }
        else {
            // find exit to home room
            let exit = creep.room.findExitTo(creep.memory.home);
            // move to exit
            creep.moveTo(creep.pos.findClosestByPath(exit), {visualizePathStyle: {stroke: '#000000'}});
        }
    }
};