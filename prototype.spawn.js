var listOfRoles = ['harvester', 'collector', 'attacker', 'dismantler', 'claimer', 'upgrader',
'TM', 'MH', 'repairer', 'builder', 'wallRepairer'];

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
    function (CreepsDied) {
        /** @type {Room} */
        let room = this.room;
        // find all creeps in room
        /** @type {Array.<Creep>} */
        let creepsInRoom = room.find(FIND_MY_CREEPS);
        // count the number of creeps alive for each role in this room
        // _.sum will count the number of properties in Game.creeps filtered by the
        //  arrow function, which checks for the creep being a specific role
        /** @type {Object.<string, number>} */
        let numberOfCreeps = {};
        for (let role of listOfRoles) {
            numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
        }

        let maxEnergy = room.energyCapacityAvailable;
        // let maxEnergy = room.energyCapacityAvailable > 3000 ? 3000 : room.energyCapacityAvailable;
        let NewCreepRole = undefined;
        let name = undefined;
        let spawnsSpawning = [];
        for (let spawnName in Game.spawns) {
            let spawn = Game.spawns[spawnName];
            if (spawn.spawning)
                spawnsSpawning.push(spawn);
        }
        // console.log(spawnsSpawning)
        // if (_.some(spawnsSpawning, s => s.spawning.needTime != s.spawning.remainingTime) || !spawnsSpawning.length) {
        // TODO MAKE TWO SPAWNS LOGIC
            // if no harvesters are left AND either no miners or no collectors are left
            //  create a backup creep
            if (numberOfCreeps['harvester'] == 0 && numberOfCreeps['collector'] == 0) {
                // if there are still miners or enough energy in Storage left
                if (numberOfCreeps['miner'] > 0 ||
                    (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 100 + 550)) {
                    // create a collector
                    name = this.createNotWorkerCreep(room.energyAvailable, 'collector');
                    NewCreepRole = 'collector';
                }
                // if there is no miner and not enough energy in Storage left
                else {
                    // create a harvester because it can work on its own
                    name = this.createCustomCreep(room.energyAvailable, 'harvester');
                    NewCreepRole = 'harvester';
                }
            }
            // if no backup creep is required
            else {
                // check if all sources have miners
                let sources = room.find(FIND_SOURCES);
                // iterate over all sources
                for (let source of sources) {
                    // if the source has no miner
                    if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {
                        // check whether or not the source has a container
                        /** @type {Array.StructureContainer} */
                        let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                            filter: s => s.structureType == STRUCTURE_CONTAINER
                        });
                        // if there is a container next to the source
                        if (containers.length > 0) {
                            // spawn a miner
                            name = this.createMinerCreep(source.id);
                            NewCreepRole = 'miner';
                            break;
                        }
                    }
                }
            }

            // if none of the above caused a spawn command check for other roles
            if (name == undefined) {
                for (let role of listOfRoles) {
                    if (role == 'attacker' && this.memory.attackRoom != undefined && this.memory.attackRoom.length == 3) {
                        let attackRoomData = this.memory.attackRoom;
                        // try to spawn an attacker
                        name = this.createAttacker(maxEnergy, attackRoomData[0], attackRoomData[1], attackRoomData[2]);
                        // if that worked
                        if (name == 0) {
                            // delete the attack order
                            delete this.memory.attackRoom;  
                        }
                        NewCreepRole = role;
                        break;
                    }
                    // if no attacker order was found, check for dismantle attacker order
                    else if (role == 'dismantler' && this.memory.dismantleAttackRoom != undefined && this.memory.dismantleAttackRoom.length == 2) {
                        dismantleAttackRoomData = this.memory.dismantleAttackRoom;
                        // try to spawn an attacker
                        name = this.createDismantler(maxEnergy, dismantleAttackRoomData[0], dismantleAttackRoomData[1], room.name);
                        // if that worked
                        if (name == 0) {
                            // delete the dismantle order
                            delete this.memory.dismantleAttackRoom;
                        }
                        NewCreepRole = role;
                        break;
                    }
                    // if no dismantler order was found
                    else if (role == 'claimer') {
                        // check for claim order
                        if (this.memory.claimRoom != undefined) {
                            // try to spawn a claimer
                            claimRoomOrder = this.memory.claimRoom;
                            let claimParts = undefined;
                            let target = claimRoomOrder[0];
                            if (claimRoomOrder.length != 2) claimParts = 1;
                            else claimParts = claimRoomOrder[1];
                            name = this.createClaimerCreep(target=target, numberOfClaimParts=claimParts, reserve=false);
                            // if that worked
                            if (name == 0) {
                                // delete the claim order
                                delete this.memory.claimRoom;
                            }
                            break;
                        }
                        // if no claim order was found, check reservation order
                        else if (this.memory.reserveRoom != undefined) {
                            claimRoomOrder = this.memory.claimRoom;
                            let claimParts = undefined;
                            let target = claimRoomOrder[0];
                            if (claimRoomOrder.length != 2) claimParts = 1;
                            else claimParts = claimRoomOrder[1];
                            name = this.createClaimerCreep(target=target, numberOfClaimParts=claimParts, reserve=true);
                            // if that worked
                            if (name == 0) {
                                // delete the claim order
                                delete this.memory.claimRoom;
                            }
                            break;
                        }
                    }
                    // if no reservation order was found, check other roles
                    else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
                        if (role == 'collector') {
                            name = this.createNotWorkerCreep(maxEnergy, role);
                        }
                        else if (role == 'MH') {
                            let roomMineral = this.room.find(FIND_MINERALS)[0]
                            let roomExtractor = this.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTRACTOR})[0]
                            if (roomExtractor != undefined && roomMineral != undefined && roomMineral.mineralAmount > 0)
                                name = this.createCustomCreep(maxEnergy, role);
                            else continue;
                        }
                        else if (role == 'TM') {
                            if (Memory.rooms && Memory.rooms[this.room.name] && Memory.rooms[this.room.name].terminal && _.isEqual(Object.keys(Memory.rooms[this.room.name].terminal), ['enabled', 'autoSell', 'from', 'to'])) {
                                let terminalMemory = Memory.rooms[this.room.name].terminal;
                                if (terminalMemory.enabled && (_.some(terminalMemory.to, {enabled: true}) || _.some(terminalMemory.from, {enabled: true}))) {
                                    name = this.createCustomCreep(maxEnergy, role);
                                }
                                else continue;
                            }
                            else continue;
                        }
                        else {
                            name = this.createCustomCreep(maxEnergy, role);
                        }
                        NewCreepRole = role;
                        break;
                    }
                }
            }
            // if none of the above caused a spawn command check for LongDistanceHarvesters
            /** @type {Object.<string, number>} */
            let numberOfLongDistanceHarvesters = {};
            if (name == undefined) {
                // count the number of long distance harvesters globally
                for (let LDHData in this.memory.minLongDistanceHarvesters) {
                    let [roomName, sourceIndex, workParts] = LDHData.split('_');
                    numberOfLongDistanceHarvesters[LDHData] = _.sum(Game.creeps, (c) =>
                        c.memory.role == 'LDH' && c.memory.target == roomName && c.memory.sourceIndex == sourceIndex)
                    if (numberOfLongDistanceHarvesters[LDHData] < this.memory.minLongDistanceHarvesters[LDHData]) {
                        name = this.createLongDistanceHarvester(maxEnergy, workParts, room.name, roomName, sourceIndex);
                        NewCreepRole = 'LDH ' + roomName + ' ' + sourceIndex;
                    }
                }
            }
            
            // if none of the above caused a spawn command check for LongDistanceCollectors
            /** @type {Object.<string, number>} */
            let numberOfLongDistanceCollectors = {};
            if (name == undefined) {
                // count the number of long distance harvesters globally
                for (let roomName in this.memory.minLongDistanceCollectors) {
                    numberOfLongDistanceCollectors[roomName] = _.sum(Game.creeps, (c) => c.memory.role == 'LDC' && c.memory.target == roomName)
                    if (numberOfLongDistanceCollectors[roomName] < this.memory.minLongDistanceCollectors[roomName]) {
                        name = this.createLongDistanceCollector(maxEnergy, room.name, roomName);
                        NewCreepRole = 'LDC ' + roomName;
                    }
                }
            }
            
            // if none of the above caused a spawn command check for builders
            if (name == undefined) {
                // find all constracters sites
                let constracters_sites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
                if (constracters_sites.length > 0 && numberOfCreeps['builder'] < 1) {
                    name = this.createCustomCreep(maxEnergy, 'builder');
                    numberOfCreeps['builder']++;
                }
            }
        // }
        // let debugInfo = `${this.name}, name=" ${name} ", maxEnergy is ${maxEnergy} but ${this.room.energyAvailable} available`
        let spawnErrors = ['OK', 'ERR_NOT_OWNER', NaN, 'ERR_NAME_EXISTS', 'ERR_BUSY', NaN, 'ERR_NOT_ENOUGH_ENERGY', NaN, NaN, NaN, 'ERR_INVALID_ARGS', NaN, NaN, NaN, 'ERR_RCL_NOT_ENOUGH'];
        let errName = name != undefined ? `${spawnErrors[Math.abs(name)]},`: '';
        let debugInfo = `${errName} maxEnergy is ${maxEnergy} but ${this.room.energyAvailable} available`;
        Game.rooms[this.room.name].visual.text(debugInfo, this.pos.x, this.pos.y+1, {color: 'white', font: 0.2});
    
    // //     if (name == 0 || CreepsDied != undefined) {
    // //         console.log('=============================');
        
    // //         // print role to console if spawning was a success
    // //         if (name == 0 && CreepsDied != undefined) {
    // //             console.log(this.name + ' is spawning a ' + NewCreepRole + ' -- RIP: ' + CreepsDied + ' -- energy: ' + room.energyAvailable);
    // //         }
    // //         else if (name == 0) {
    // //             console.log(this.name + ' is spawning a ' + NewCreepRole + ' -- energy: ' + room.energyAvailable);
    // //         }
    // //         else if (CreepsDied != undefined) {
    // //             console.log(this.name + " RIP: " + CreepsDied + ' -- energy: ' + room.energyAvailable);
    // //         }

    // //         // print number of creeps
    // //         console.log('=============================');
    // //         console.log("Harvesters    : " + numberOfCreeps['harvester']);
    // //         console.log("Collectors    : " + numberOfCreeps['collector']);
    // //         console.log("Upgraders     : " + numberOfCreeps['upgrader']);
    // //         console.log("Builders      : " + numberOfCreeps['builder']);
    // //         console.log("Repairers     : " + numberOfCreeps["repairer"]);
    // //         console.log("WallRepairers : " + numberOfCreeps['wallRepairer']);
    // //         console.log("LDH E9N22     : " + _.sum(Game.creeps, (c) => c.memory.role == 'LDH' && c.memory.target == 'E9N22'));
    // //         console.log("LDH E7N23     : " + _.sum(Game.creeps, (c) => c.memory.role == 'LDH' && c.memory.target == 'E7N23'));
    // //         console.log("LDH E8N24     : " + _.sum(Game.creeps, (c) => c.memory.role == 'LDH' && c.memory.target == 'E8N24'));
    // //         console.log("Miners        : " + _.sum(creepsInRoom, (c) => c.memory.role == 'miner'));
    // //     }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function(energy, roleName) {
            // create a balanced body as big as possible with the given energy
            let numberOfParts = Math.floor(energy / 200);
            // make sure the creep is not too big (more than 50 parts)
            numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
            let body = [];
            if (roleName != 'upgrader') { // ! REMOVE WHEN MOVED TO OTHER SHARD
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(WORK);
                }
            } else body.push(WORK); // ! REMOVE WHEN MOVED TO OTHER SHARD
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY);
            }
            if (roleName != 'upgrader') { // ! REMOVE WHEN MOVED TO OTHER SHARD
                for (let i = 0; i < numberOfParts; i++) {
                    body.push(MOVE);
                }
            } else body.push(MOVE); // ! REMOVE WHEN MOVED TO OTHER SHARD
            if (body.length > 50) {
                body = []
                for (let i = 0; i < 50; i++) {
                    body.push(WORK);
                    body.push(MOVE);
                    body.push(CARRY);
                }
            }
            if (body.length > 50) body = body.slice(0, 50)
        
        let name = roleName + Math.floor(Math.random()*100)
        let newCreep = this.spawnCreep(body, name, {memory: { role: roleName, working: false, home: this.room.name } });
        while (newCreep == ERR_NAME_EXISTS){
            name = roleName + Math.floor(Math.random()*100)
            newCreep = this.spawnCreep(body, name, {memory: { role: roleName, working: false, home: this.room.name } });
        }

        // create creep with the created body and the given role
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createNotWorkerCreep =
    function(energy, role, numberOfWorkParts=0, additionalMemory = NaN) {
        // create a balanced body as big as possible with the given energy
        let body = [];
        for (let i = 0; i < numberOfWorkParts; i++) {
            body.push(WORK);
        }

        energy -= 100*numberOfWorkParts;
        
        let numberOfParts = Math.floor(energy / 100);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 2)); //// wrong fixing to 50
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }
        let memory = {memory: { role: role, working: false, home: this.room.name } }
        if (additionalMemory != NaN) {
            for (key in additionalMemory) {
                memory.memory[key] = additionalMemory[key];
            }
        } 
        if (body.length > 50) body = body.slice(0, 50);
        let name = role + Math.floor(Math.random()*100);
        let newCreep = this.spawnCreep(body, name, {memory: { role: role, working: false, home: this.room.name } });
        while (newCreep == ERR_NAME_EXISTS){
            name = role + Math.floor(Math.random()*100)
            newCreep = this.spawnCreep(body, name, {memory: { role: role, working: false, home: this.room.name } });
        }
        
        // create creep with the created body
        return newCreep;
    };
    // create a new function for StructureSpawn
    StructureSpawn.prototype.createLongDistanceHarvester =
    function(energy, numberOfWorkParts, home, target, sourceIndex) {
        // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
        let body = [];
        for (let i = 0; i < numberOfWorkParts; i++) body.push(WORK);
        
        // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
        energy -= 150*numberOfWorkParts;

        
        let numberOfParts = Math.floor(energy / 100);
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor((50 - numberOfWorkParts * 2) / 2));
        for (let i = 0; i < numberOfParts; i++) body.push(CARRY);
        for (let i = 0; i < numberOfParts + parseInt(numberOfWorkParts); i++) body.push(MOVE);

        if (body.length > 50) body = body.slice(0, 50)
        let name = 'LDH ' + target + '_' + Math.floor(Math.random()*100)
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'LDH',
            home: home,
            target: target,
            sourceIndex: sourceIndex,
            working: false
        } });
        while (newCreep == ERR_NAME_EXISTS){
            name = 'LDH ' + target + '_' + Math.floor(Math.random()*100)
            newCreep = this.spawnCreep(body, name, {memory: {
                role: 'LDH',
                home: home,
                target: target,
                sourceIndex: sourceIndex,
                working: false
            } });
        }
        // create creep with the created body
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createLongDistanceCollector =
    function(energy, home, target) {
        let body = [];
        
        let numberOfParts = Math.floor(energy / 100);
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 2));
        for (let i = 0; i < numberOfParts; i++) {body.push(CARRY);}
        for (let i = 0; i < numberOfParts; i++) {body.push(MOVE);}

        if (body.length > 50) {
            body = [];
            for (let i = 0; i < 50-numberOfWorkParts; i++) {
                body.push(CARRY);
                body.push(MOVE);
            }
        }

        if (body.length > 50) body = body.slice(0, 50)
        
        let name = 'LDC ' + target + '_' + Math.floor(Math.random()*100)
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'LDC',
            home: home,
            target: target,
            working: false
        } });
        while (newCreep == ERR_NAME_EXISTS){
            name = 'LDC ' + target + '_' + Math.floor(Math.random()*100)
            newCreep = this.spawnCreep(body, name, {memory: {
                role: 'LDC',
                home: home,
                target: target,
                working: false
            } });
        }

        // create creep with the created body
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createAttacker =
    // // data for creep creation in the format name: true/false/data for example {target: E7N23, attack: {numberOfAttackParts: 10}, dismantle: {numberOfWorkParts}}
    function(energy, target, numberOfAttackParts, tough) {
        let body = [];
        for (let i = 0; i < numberOfAttackParts && body.length < 50; i++) {body.push(ATTACK);}

        energy -= 80*numberOfAttackParts;

        let body_backup = [...body]
        if (tough) {
            let numberOfParts = Math.floor(energy / 53);
            for (let i = 0; i < numberOfParts && body.length < 50; i++) {body.push(MOVE);}
            
            energy -= 50*numberOfParts;
            numberOfParts = Math.floor((50-numberOfAttackParts-numberOfParts));
            for (let i = 0; i < numberOfParts && body.length < 50; i++) {body.push(TOUGH);}

            if (body.length > 50) {
                body = [...body_backup];
                for (let i = 0; i < 50-body_backup.length; i++) {
                    body.push(MOVE); body.push(MOVE); body.push(MOVE);
                    body.push(TOUGH); body.push(TOUGH);
                }
            }
        }
        else {
            let numberOfParts = Math.floor(energy / 50);
            for (let i = 0; i < numberOfParts && body.length < 50; i++) {body.push(MOVE)}
            
            if (body.length > 50) {
                body = [...body_backup];
                for (let i = 0; i < 50-body_backup.length; i++) {
                    body.push(MOVE);
                }
            }
        }
        if (body.length > 50) body = body.slice(0, 50);
        // // let counter = 0
        // // for (i of body) {
        // //     switch (i) {
        // //         case ATTACK:
        // //             counter += 80
        // //         case WORK:
        // //             counter += 100
        // //         case CARRY:
        // //             counter += 50
        // //         case MOVE:
        // //             counter += 50
        // //         case TOUGH:
        // //             counter += 10
        // //     }
        // // }
        // // console.log(counter)
        let name = 'Attacker ' + target + '_' + Math.floor(Math.random()*100)
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'attacker',
            target: target,
            working: false, home: this.room.name
        } });
        while (newCreep == ERR_NAME_EXISTS){
            name = 'Attacker ' + target + '_' + Math.floor(Math.random()*100)
            newCreep = this.spawnCreep(body, name, {memory: {
                role: 'attacker',
                target: target,
                working: false,
                home: this.room.name
            } });
        }

        // create creep with the created body
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createHealer =
    /** @arg {number} energy
    * @arg {number} numberOfHealParts
    * @arg {string} target
    * @arg {string} home */
    function(energy, numberOfHealParts, target, home) {
        let body = [];
        for (let i = 0; i < 25-numberOfHealParts; i++) {body.push(TOUGH)}
        for (let i = 0; i < numberOfHealParts; i++) {body.push(HEAL);}

        energy -= 100*numberOfHealParts;
        if (1 == 2) {  
            let numberOfParts = Math.floor(energy / 100);
            if (numberOfParts > Math.floor((50-numberOfHealParts)/2)) {
                numberOfParts = Math.floor((50-numberOfHealParts)/2)
            }
        }
        numberOfParts = 25
        // for (let i = 0; i < numberOfParts; i++) {body.push(CARRY);}
        for (let i = 0; i < numberOfParts; i++) {body.push(MOVE);}
        let counter = 0
        for (i of body) {
            switch (i) {
                case ATTACK:
                    counter += 80; break;
                case WORK:
                    counter += 100; break;
                case CARRY:
                    counter += 50; break;
                case MOVE:
                    counter += 50; break;
                case TOUGH:
                    counter += 10; break;
                case HEAL:
                    counter += 250; break;
            }
        }
        console.log(counter)
        console.log(body)

        if (body.length > 50) body = body.slice(0, 50);
        let name = 'Healer ' + target + '_' + Math.floor(Math.random()*100)
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'healer',
            target: target,
            home: home,
            working: false
        } });
        while (newCreep == ERR_NAME_EXISTS){
            name = 'Healer ' + target + '_' + Math.floor(Math.random()*100)
            newCreep = this.spawnCreep(body, name, {memory: {
                role: 'healer',
                target: target,
                home: home,
                working: false
            } });
        }

        // create creep with the created body
        return newCreep;
    };
StructureSpawn.prototype.createDismantler =
    /** @arg {number} energy
    * @arg {number} numberOfWorkParts
    * @arg {string} target
    * @arg {string} home */
    function(energy, numberOfWorkParts, target, home) {
        let body = [];
        for (let i = 0; i < 10; i++) {body.push(TOUGH)}
        for (let i = 0; i < numberOfWorkParts; i++) {body.push(WORK);}

        energy -= 100*numberOfWorkParts;
        if (1 == 2) {  
            let numberOfParts = Math.floor(energy / 100);
            if (numberOfParts > Math.floor((50-numberOfWorkParts)/2)) {
                numberOfParts = Math.floor((50-numberOfWorkParts)/2)
            }
        }
        numberOfParts = 20
        // for (let i = 0; i < numberOfParts; i++) {body.push(CARRY);}
        for (let i = 0; i < numberOfParts; i++) {body.push(MOVE);}

        if (body.length > 50) body = body.slice(0, 50)
        
        let name = 'Dismantler ' + target + '_' + Math.floor(Math.random()*100)
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'dismantler',
            target: target,
            home: home,
            working: false
        } });
        while (newCreep == ERR_NAME_EXISTS){
            name = 'Dismantler ' + target + '_' + Math.floor(Math.random()*100)
            newCreep = this.spawnCreep(body, name, {memory: {
                role: 'dismantler',
                target: target,
                home: home,
                working: false
            } });
        }

        // create creep with the created body
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimerCreep =
    function(target, numberOfClaimParts, reserve=false) {
        let body = []
        for (let i = 0; i < numberOfClaimParts/2; i++) body.push(MOVE);
        for (let i = 0; i < numberOfClaimParts; i++) body.push(CLAIM);
        for (let i = 0; i < numberOfClaimParts/2; i++) body.push(MOVE);
        let name = 'claimer' + Math.floor(Math.random()*100)
        let newCreep = this.spawnCreep(body, name, {memory: { role: 'claimer', target: target, reserve: reserve, home: this.room.name } });
        while (newCreep == ERR_NAME_EXISTS){
            name = 'claimer' + Math.floor(Math.random()*100)
            newCreep = this.spawnCreep(body, name, {memory: { role: 'claimer', target: target, reserve: reserve, home: this.room.name } });
        }

        // create claimer creep with the created body, and target
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createMinerCreep =
    function(sourceId) {
        body = [WORK, WORK, WORK, WORK, WORK, MOVE]

        let name = 'miner' + Math.floor(Math.random()*100)
        let newCreep = this.spawnCreep(body, name, {memory: { role: 'miner', sourceId: sourceId, home: this.room.name } });
        while (newCreep == ERR_NAME_EXISTS){
            name = 'miner' + Math.floor(Math.random()*100)
            newCreep = this.spawnCreep(body, name, {memory: { role: 'miner', sourceId: sourceId, home: this.room.name } });
        }

        // create claimer creep with the created body, and target
        return newCreep;
    };

Structure.prototype.maxEnergy =
    function() {
        return this.room.energyCapacityAvailable
    }
Structure.prototype.claimRoom =
    function(target, claimParts=1) {
        if (target != undefined) {this.memory.claimRoom = [target, claimParts]; return [target, claimParts]}
        else return 'target is needed'
    }
Structure.prototype.reserveRoom =
    function(target, claimParts=1) {
        if (target != undefined) {this.memory.reserveRoom = [target, claimParts]; return [target, claimParts]}
        else return 'target is needed'
    }
Structure.prototype.sellResource =
    function(resource, minPrice, maxDistance) {
        if (arguments.length == 3) {
            if (Memory.rooms && Memory.rooms[this.room.name] && Memory.rooms[this.room.name].terminal) {
                Memory.rooms[this.room.name].terminal.autoSell.push(
                    {enabled: true, resource: resource, minPrice: minPrice, maxDistance: maxDistance});
                return `added ${JSON.stringify({enabled: true, resource: resource, minPrice: minPrice, maxDistance: maxDistance})} to auto sell of ${this.room.name}`
            }
            else return `there is no path "Memory.rooms['${this.room.name}'].terminal"`
        }
        else return 'resource, minPrice and maxDistance are needed'
    }