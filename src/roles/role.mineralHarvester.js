module.exports = {
    // a function to run the logic for creep role
    run: function(creep) {
        // if creep is bringing energy to a storage but has no resources left
        if (creep.memory.working == true && creep.store.getFreeCapacity() == creep.carryCapacity) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full or minerals are empty
        else if (creep.memory.working == false && (creep.store.getFreeCapacity() == 0 || (creep.room.find(FIND_MINERALS)[0] != undefined && !creep.room.find(FIND_MINERALS)[0].mineralAmount > 0))) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer resources to a storage
        if (creep.memory.working == true) {
            // find storage in the room
            storage = creep.room.storage;
            
            // if we found one
            if (storage != undefined && storage.store.getFreeCapacity()) {
                let stored_resources = _.filter(Object.keys(creep.store), resource => creep.store[resource] > 0)
                // try to transfer resources, if it is not in range
                if (stored_resources != undefined && creep.transfer(storage, stored_resources[0]) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(storage, {reusePath: 10, visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            // find the mineral in the room
            let mineral = creep.pos.findClosestByPath(FIND_MINERALS);
            if (mineral != undefined && !mineral.mineralAmount > 0) creep.memory.role = 'recycle';
            // try to harvest resources, if the mineral is not in range
            if (creep.harvest(mineral) == ERR_NOT_IN_RANGE) {
                // move towards it
                creep.moveTo(mineral, {reusePath: 15, visualizePathStyle: {stroke: '#466D1D'}});
            }
        }
    }
};