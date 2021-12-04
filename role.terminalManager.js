// made by Den_loob not for distribution
let roleCollector = require('role.collector')
module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        if (Memory.rooms && Memory.rooms[creep.room.name]) {
            // get the room terminal data
            let terminalData = Memory.rooms[creep.room.name].terminal;
            // if there is no terminal data of the room
            if (terminalData == undefined) {
                // create one
                Memory.rooms[creep.room.name].terminal = {enabled: false, autoSell: [{enabled: false, resource: undefined, minPrice: 0, maxDistance: -1}], from: [{enabled: false, resource: undefined, order: false}], to: [{enabled: false, dealData: undefined, order: false}]}; terminalData = Memory.rooms[creep.room.name].terminal;
            }
            if (creep.memory.hand == undefined) {
                creep.memory.hand = 'left';
            }
            // if creep is bringing resource to a terminal but has no resources left
            if (creep.memory.working == true && creep.store.getFreeCapacity() == creep.store.getCapacity()) {
                // switch state
                creep.memory.working = false;
            }
            // if creep is collecting resources but is full and there is terminal in the room
            else if (creep.memory.working == false && creep.store.getFreeCapacity() == 0 && creep.room.terminal != undefined) {
                // switch state
                creep.memory.working = true;
            }


            // if creeps store is empty
            if (creep.store.getFreeCapacity() == creep.store.getCapacity()) {
                // if it right hand is active, there is a storage and a good TO order
                if (creep.memory.hand == 'right' && creep.room.storage != undefined && _.some(terminalData.to, order => order.enabled && ((order.dealData != undefined && creep.room.storage.store[order.dealData.resourceType] > 0 && (creep.room.storage == undefined || order.dealData.resourceType != RESOURCE_ENERGY || creep.room.storage.store[RESOURCE_ENERGY > 20000])) || (order.resource != undefined && creep.room.storage.store[order.resource] > 0 &&(creep.room.storage == undefined || order.resource != RESOURCE_ENERGY || creep.room.storage.store[RESOURCE_ENERGY > 20000])))))
                    // change the hand to left
                    creep.memory.hand = 'left';
                // else if it left hand is active, there is a terminal and a good from order
                else if (creep.memory.hand == 'left' && creep.room.terminal != undefined && _.some(terminalData.from, order => order.enabled && ((order.dealData != undefined && creep.room.terminal.store[order.dealData.resourceType] > 0) || (order.resource != undefined && creep.room.terminal.store[order.resource] > 0))))
                    creep.memory.hand = 'right';
            }

            // define a flag to check if creep found a good order to work with
            let foundGoodOrder = false;
            // if terminal trading is enabled
            if (terminalData.enabled) {
                // if right hand active so transferring FROM terminal to storage
                if (creep.memory.hand == 'right') {
                    // if full
                    if (creep.memory.working) {
                        // find the storage
                        let storage = creep.room.storage;
                        // for each from order if we found the room storage
                        if (storage != undefined) for (let order of terminalData.from) {
                            // if the order is enabled, order resource or dealData is defined and creep stores it
                            if (order.enabled && ((order.dealData != undefined && creep.store[order.dealData.resourceType] > 0 ) || (order.resource != undefined && creep.store[order.resource] > 0))) {
                                // set the foundGoodOrder flag to true so we don't run collector code
                                foundGoodOrder = true;
                                // get the order resource
                                let resource = order.dealData == undefined ? order.resource: order.dealData.resourceType
                                // transfer the resource to storage, if not in range
                                if (creep.transfer(storage, resource) == ERR_NOT_IN_RANGE) {
                                    // move towards it
                                    creep.moveTo(storage, {visualizePathStyle: {stroke: '#007700'}});
                                }
                                // break out of the loop
                                break;
                            }
                        }
                    }
                    // if not full
                    else {
                        // find room terminal
                        let terminal = creep.room.terminal;
                        // if we found the terminal for each 'from' order
                        if (terminal != undefined) for (let order of terminalData.from) {
                            // if the order is enabled, order resource or dealData is defined and reminal stores it
                            if (order.enabled && ((order.dealData != undefined && terminal.store[order.dealData.resourceType] > 0) || (order.resource != undefined && terminal.store[order.resource] > 0))) {
                                // set the foundGoodOrder flag to true so we don't run collector code
                                foundGoodOrder = true;
                                // get the order resource
                                let resource = order.dealData == undefined ? order.resource: order.dealData.resourceType;
                                // withdraw order resource from the terminal, if not in range
                                if (creep.withdraw(terminal, resource) == ERR_NOT_IN_RANGE) {
                                    // move towards it
                                    creep.moveTo(terminal, {visualizePathStyle: {stroke: '#00776D'}});
                                }
                                // break out of the loop
                                break;
                            }

                        }
                    }
                }
                // else if left hand active so transferring from storage TO terminal
                else if (creep.memory.hand == 'left') {
                    // if full
                    if (creep.memory.working) {
                        // find the terminal
                        let terminal = creep.room.terminal;
                        // for each 'to' order
                        for (let order of terminalData.to) {
                            // set the foundGoodOrder flag to true so we don't run collector code
                            foundGoodOrder = true;
                            // if the order is enabled, order resource or dealData is defined and there is no storage or resource isn't energy or there are 20k energy in the storage
                            if (order.enabled && ((order.dealData != undefined && creep.store[order.dealData.resourceType] > 0 && (creep.room.storage == undefined || order.dealData.resourceType != RESOURCE_ENERGY || creep.room.storage.store[RESOURCE_ENERGY > 20000])) || (order.resource != undefined && creep.store[order.resource] > 0 && (creep.room.storage == undefined || order.resource != RESOURCE_ENERGY || creep.room.storage.store[RESOURCE_ENERGY > 20000])))) {
                                // get the order resource
                                let resource = order.dealData == undefined ? order.resource: order.dealData.resourceType;

                                // transfer the resource to terminal
                                if (creep.transfer(terminal, resource) == ERR_NOT_IN_RANGE) {
                                    // move towards it
                                    creep.moveTo(terminal, {visualizePathStyle: {stroke: '#007700'}});
                                }
                                // break out of the loop
                                break;
                            }
                        }
                    }
                    // if not full
                    else {
                        // find room storage
                        let storage = creep.room.storage;
                        // if we found one
                        if (storage != undefined) {
                            // for each 'to' order
                            for (let order of terminalData.to) {
                                // set the foundGoodOrder flag to true so we don't run collector code
                                foundGoodOrder = true;
                                // if the order is enabled and order resource is defined and it is in the storage
                                if (order.enabled && ((order.dealData != undefined && storage.store[order.dealData.resourceType] > 0 && (creep.room.storage == undefined || order.dealData.resourceType != RESOURCE_ENERGY || creep.room.storage.store[RESOURCE_ENERGY > 20000])) || (order.resource != undefined && storage.store[order.resource] > 0 &&(creep.room.storage == undefined || order.resource != RESOURCE_ENERGY || creep.room.storage.store[RESOURCE_ENERGY > 20000])))) {
                                    // get the order resource
                                    let resource = order.dealData == undefined ? order.resource: order.dealData.resourceType;
                                    // withdraw order resource from the storage, if not in range
                                    if (creep.withdraw(storage, resource) == ERR_NOT_IN_RANGE) {
                                        // move towards it
                                        creep.moveTo(storage, {visualizePathStyle: {stroke: '#00776D'}});
                                    }
                                    // break out of the loop
                                    break;
                                }
                            }
                        }
                    }
                }
                else console.log('non-existent hand');    
            }
            if (!foundGoodOrder) roleCollector.run(creep);
        }
    }
};