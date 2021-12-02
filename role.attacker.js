module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if in target room
        if (creep.room.name == creep.memory.target) {
            // find closest enemy creep
            var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            // if one is found
            if (target != undefined) {
                // try to attack
                var attack = creep.attack(target)
                // if the enemy is not in range
                if (attack == ERR_NOT_IN_RANGE) {
                    // move towards the enemy
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                }
                // if attacked successfully
                else if (attack == OK) {
                    console.log(creep + ' is attacking ' + target + ' in ' + creep.room + ', hp left: ' + creep.hits)
                }
            }
            else {
                var invaderCore = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_INVADER_CORE});
                if (invaderCore != undefined) {
                    // try to attack
                    var dismantle = creep.attack(invaderCore)
                    // if the invader core is not in range
                    if (dismantle == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(invaderCore, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                    // if attacked successfully
                    else if (invaderCore == OK) {
                        console.log(creep + ' is attacking ' + invaderCore + ' in ' + creep.room + ', hp left: ' + creep.hits)
                    }
                }
            }
        }
        // if not in target room...
        else {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // and move to exit
            creep.moveTo(creep.pos.findClosestByPath(exit), {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
};