module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        // if creep is bringing energy to a structure but has no energy left
        if (creep.memory.working == true && creep.store.getFreeCapacity() == creep.store.getCapacity()) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is collecting energy but is full
        else if (creep.memory.working == false && creep.store.getFreeCapacity() == 0) {
            // switch state
            creep.memory.working = true;
        }
        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            // find closest spawn, extension or tower which is not full
            let structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_SPAWN
                            || s.structureType == STRUCTURE_EXTENSION
                            || s.structureType == STRUCTURE_LAB
                            || (s.structureType == STRUCTURE_TOWER && s.store[RESOURCE_ENERGY] < 800))
                            && s.store[RESOURCE_ENERGY] < s.store.getCapacity(RESOURCE_ENERGY)
            });
            
            // if we don't found one
            if (creep.room.storage && structure == undefined && creep.room.terminal != undefined && (
                (creep.room.storage.store[RESOURCE_ENERGY] > 50000 && creep.room.terminal.store[RESOURCE_ENERGY] < 50000) ||
                (creep.room.storage.store[RESOURCE_ENERGY] > 150000 && creep.room.terminal.store[RESOURCE_ENERGY] < 100000)
            )) {
                structure = creep.room.terminal;
            }
            
            // if we don't found one
            if (structure == undefined) {
                // find a storage
                structure = creep.room.storage;
            }

            // if we found one
            if (structure != undefined) {
                // try to transfer energy, if it is not in range
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(structure, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            // if there is more than energy in creeps inventory
            if (creep.store && Object.keys(creep.store).length > 0 && Object.keys(creep.store)[0] != RESOURCE_ENERGY) {
                // find a storage
                let storage = creep.room.storage;
            
                // if we found one
                if (storage != undefined && storage.store.getFreeCapacity()) {
                    let stored_resources = _.filter(Object.keys(creep.store), resource => creep.store[resource] > 0)
                    // try to transfer resources, if it is not in range
                    if (stored_resources != undefined && creep.transfer(storage, stored_resources[0]) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
        // if creep is supposed to collect energy
        else {
            // find closest dropped resource, tombstone and ruin, with resources
            let droppedResources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: dr => dr.amount > 100});
            let tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, { filter: (t) => t.store.getUsedCapacity() > 0});
            let ruin = creep.pos.findClosestByPath(FIND_RUINS, { filter: (r) => r.store.getCapacity() > 0});
            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (c) => c.structureType == STRUCTURE_CONTAINER && c.store[RESOURCE_ENERGY] > 500 });
            
            if(droppedResources != undefined) {
                // try to withdraw droppedResources, if it is not in range
                if(creep.pickup(droppedResources) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(droppedResources, {visualizePathStyle: {stroke: '#FFFC00'}});
                }
            }
            else if (tombstone != undefined) {
                let stored_resources = _.filter(Object.keys(tombstone.store), resource => tombstone.store[resource] > 0)
                // try to withdraw resources from tombstone, if it is not in range
                if(creep.withdraw(tombstone, stored_resources[0]) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(tombstone, {visualizePathStyle: {stroke: '#FFFC00'}});
                }
            }
            else if (ruin != undefined) {
                let stored_resources = _.filter(Object.keys(ruin.store), resource => ruin.store[resource] > 0)
                // try to withdraw resources from ruin, if it is not in range
                if(creep.withdraw(ruin, stored_resources[0]) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(ruin, {visualizePathStyle: {stroke: '#FFFC00'}});
                }
            }
            else if (container != undefined) {
                // try to withdraw energy from container, if it is not in range
                if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.moveTo(container, {visualizePathStyle: {stroke: '#feeb75'}});
                }
            }
            // if no droppedResources, tombstones, ruins or container with energy found
            else {
                // find closest spawn, extension or tower which aren't full
                let structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN
                                || s.structureType == STRUCTURE_EXTENSION
                                || s.structureType == STRUCTURE_TOWER)
                                && s.energy < s.energyCapacity
                });
                // if we found one
                if (structure != undefined) {
                    let roomMemory = Memory.rooms[creep.room.name];
                    if (roomMemory != undefined) {
                        let storage;
                        if (creep.room.terminal) {
                            // find the terminal
                            let terminalMemory = roomMemory.terminal;
                            if (terminalMemory == undefined) {
                                Memory.rooms[creep.room.name].terminal = {enabled: false, autoSell: [{enabled: false, resource: undefined, minPrice: 0, maxDistance: -1}], from: [{enabled: false, resource: undefined, order: false}], to: [{enabled: false, dealData: undefined, order: false}]};
                            }
                            storage = 
                                terminalMemory != undefined && terminalMemory.active && creep.room.terminal.store[RESOURCE_ENERGY] < 100000 ? creep.room.terminal : undefined;
                            }
                        // if we dont find one
                        if (storage == undefined) {
                            // find the storage
                            storage = creep.room.storage;
                        }
                        
                        // if we found one
                        if (storage != undefined) {
                            // try to withdraw energy, if it is not in range
                            if (creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                creep.moveTo(storage, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                    }
                }
            }
        }
    }
};