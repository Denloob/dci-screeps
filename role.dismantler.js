module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if in target room
        if (creep.room.name == creep.memory.target) {
            if (creep.memory.path == undefined) {
                // find closest enemy core or spawn
                var hostileSpawn = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS);
                // if one is found
                if (hostileSpawn != undefined) {
                    // try to dismantle
                    var dismantle = creep.dismantle(hostileSpawn)
                    // if the hostile spawn is not in range
                    if (dismantle == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(hostileSpawn, {visualizePathStyle: {stroke: '#ff0000'}});
                    }
                    // if dismantle successfully
                    else if (hostileSpawn == OK) {
                        console.log(creep + ' is dismantling ' + hostileSpawn + ' in ' + creep.room + ', hp left: ' + creep.hits)
                    }
                }
                // if one is not found
                else {
                    // TODO usfull thing lmao :D p.s. removed dismantle invader core because it is meant to be attacked
                }
            }
            else {
                // let rampart = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
                // var dismantle = creep.dismantle(rampart)
                // // if the hostile spawn is not in range
                // if (dismantle == ERR_NOT_IN_RANGE) {
                //     // move towards it
                //     creep.moveTo(rampart, {visualizePathStyle: {stroke: '#ff0000'}});
                // }

                // creep.moveTo(33, 22)

                let tower = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
                var dismantle = creep.dismantle(tower)
                // if the hostile spawn is not in range
                if (dismantle == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(tower, {visualizePathStyle: {stroke: '#ff0000'}});
                }


                // var hostileSpawn = creep.pos.findClosestByPath(FIND_HOSTILE_SPAWNS);
                // // if one is found
                // if (hostileSpawn != undefined) {
                //     // try to dismantle
                //     var dismantle = creep.dismantle(hostileSpawn)
                //     // if the hostile spawn is not in range
                //     if (dismantle == ERR_NOT_IN_RANGE) {
                //         // move towards it
                //         creep.moveTo(hostileSpawn, {visualizePathStyle: {stroke: '#ff0000'}});
                //     }
                //     // if dismantle successfully
                //     else if (hostileSpawn == OK) {
                //         console.log(creep + ' is dismantling ' + hostileSpawn + ' in ' + creep.room + ', hp left: ' + creep.hits)
                //     }
                // }

                
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