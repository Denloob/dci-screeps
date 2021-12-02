module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // find target
        let mainTarget = creep.pos.findClosestByPath(FIND_MY_CREEPS, {filter: (c) => c.name == creep.memory.target});
        if (mainTarget != undefined) {
            creep.moveTo(mainTarget, {visualizePathStyle: {stroke: '#00ff00'}});
        }
        else {
            // TODO escape
        }

        let target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {filter: (c) => c.hits < c.hitsMax});
        if(target) {
            creep.heal(target)
        }
    }
};