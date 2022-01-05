module.exports = {
    // a function to run the logic for creep role
    run: function(creep) {
        let room = creep.room;
        let spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
        if (room.controller && room.controller.my && spawn) {
            creep.moveTo(spawn, {reusePath: 10, visualizePathStyle: {stroke: '#000000'}});
            spawn.recycleCreep(creep);
        }
        else {
            // move to home room
            creep.travelTo(new RoomPosition(25, 25, creep.memory.home), {roomCallback: global.roomCallback});
        }
    }
};