module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        if (Game.creeps[creep.memory.target] != undefined) {
            let mainTarget = Game.creeps[creep.memory.target];
            if (creep.room.name == mainTarget.room.name) {
                if (Math.abs(mainTarget.pos.x-creep.pos.x) > 1 || Math.abs(mainTarget.pos.y-creep.pos.y) > 1)
                    creep.moveTo(Game.creeps[creep.memory.target], {visualizePathStyle: {stroke: '#00ff00'}});
                let target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (c) => c.hits < c.hitsMax});
                if(target) {
                    creep.heal(target);
                }
            }
            else {
                // travel to target creep room
                creep.travelTo(new RoomPosition(25, 25, Game.creeps[creep.memory.target].room.name));
            }
        }
    }
};