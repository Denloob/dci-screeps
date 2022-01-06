var listOfRoles = ['harvester', 'collector', 'deffender', 'healer', 'attacker', 'dismantler', 'claimer', 'upgrader',
'TM', 'MH', 'repairer', 'builder', 'wallRepairer', 'scout'];

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
    function () {
        /** @type {Room} */
        let room = this.room;
        if (!_.isObject(this.memory)) this.memory = {minCreeps: {harvester: 2, collector: 0, upgrader: 2, builder: 1, repairer: 0, wallRepairer: 0, MH: 1, TM: 1}, minLongDistanceHarvesters: {}, minLongDistanceCollectors: {}, minDeffenders: {attacker: 2}};
        else ["minCreeps","minLongDistanceHarvesters","minLongDistanceCollectors","minDeffenders"].forEach(key => {
            if (this.memory != undefined && !_.isObject(this.memory[key])) {
                switch (key) {
                    case 'minCreeps':
                        this.memory.minCreeps = {harvester: 2, collector: 0, upgrader: 2, builder: 1, repairer: 0, wallRepairer: 0, MH: 1, TM: 1};
                        break;
                    case 'minLongDistanceHarvesters':
                        this.memory.minLongDistanceHarvesters = {};
                        break;
                    case 'minLongDistanceCollectors':
                        this.memory.minLongDistanceCollectors = {};
                        break;
                    case 'minDeffenders':
                        this.memory.minDeffenders = {attacker: 2};
                        break;
                }
            }
        });
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
                    if (role == 'deffender') { // TODO TEST IF WORKS AND FIX -- 09.12
                        let numOfRoomDeffenders = _.sum(Game.creeps, (c) => c.memory.role == 'attacker' && c.memory.target == this.room.name);
                        if(this.memory.minDeffenders.attacker && numOfRoomDeffenders < this.memory.minDeffenders.attacker) {  
                            let hostileCreeps = this.room.find(FIND_HOSTILE_CREEPS, {filter: (c) => _.filter(c.body, b => b.type == ATTACK || b.type == HEAL || b.type == WORK).length});
                            if (hostileCreeps.length && (_.sum(hostileCreeps, hc => hc.owner.username != 'Invader')) || hostileCreeps.length > 4) {
                                // create deffender
                                name = this.createAttacker(
                                    this.room.energyCapacityAvailable,
                                    this.room.name, // target
                                    Math.floor(this.room.energyCapacityAvailable/200)+1,
                                    true // tough
                                );
                                let time = new Date().toLocaleString("en-US", {timeZone: 'Asia/Jerusalem', hour12: false});
                                Game.notify(`[${time}] spawn in ${this.room.name} spawned a deffender because hostile creeps found with code ${name}. first creep found: ${hostileCreeps[0].name} of ${hostileCreeps[0].owner.username}`);
                                console.log(`spawn in ${this.room.name} spawned a deffender because hostile creeps found with code ${name}. first creep found: ${hostileCreeps[0].name} of ${hostileCreeps[0].owner.username}`);
                                break;
                            }
                            else continue;
                        }
                        else continue;
                    }
                    else if (role == 'attacker' && this.memory.attackRoom != undefined && this.memory.attackRoom.length >= 3) {
                        let attackRoomData = this.memory.attackRoom
                        // try to spawn an attacker
                        name = this.createAttacker(maxEnergy, attackRoomData[0], attackRoomData[1], attackRoomData[2], attackRoomData[3]);
                        // if that worked
                        if (name == 0) {
                            // delete the attack order
                            delete this.memory.attackRoom;  
                        }
                        NewCreepRole = role;
                        break;
                    }
                    // if no attacker order was found, check for healer attacker order
                    else if (role == 'healer' && this.memory.healTarget != undefined && this.memory.healTarget.length >= 3) {
                        let healTargetData = this.memory.healTarget;
                        // try to spawn an healer
                        let name = this.createHealer(maxEnergy, healTargetData[0], healTargetData[1], healTargetData[2], healTargetData[3]);
                        // if that worked
                        if (name == 0) {
                            // delete the dismantle order
                            delete this.memory.healTarget;
                        }
                        break;
                    }
                    // if no healer order was found, check for dismantle attacker order
                    else if (role == 'dismantler' && this.memory.dismantleAttackRoom != undefined && this.memory.dismantleAttackRoom.length >= 3) {
                        dismantleAttackRoomData = this.memory.dismantleAttackRoom;
                        // try to spawn an attacker
                        name = this.createDismantler(maxEnergy, dismantleAttackRoomData[0], dismantleAttackRoomData[1], dismantleAttackRoomData[2], dismantleAttackRoomData[3]);
                        // if that worked
                        if (name == 0) {
                            // delete the dismantle order
                            delete this.memory.dismantleAttackRoom;
                        }
                        break;
                    }
                    // if no dismantle attack order was found, check for builder order
                    else if (role == 'builder' && this.memory.buildRoom != undefined && this.memory.buildRoom.length == 2) {
                        // try to spawn an builder
                        name = this.createNotWorkerCreep(maxEnergy, role, this.memory.buildRoom[1], {target: this.memory.buildRoom[0]});
                        // if that worked
                        if (name == 0) {
                            // delete the dismantle order
                            delete this.memory.buildRoom;
                        }
                        break;
                    }
                    // if no builder order was found, check for scout order
                    else if (role == 'scout' && _.isString(this.memory.scoutRoom)) {
                        // try to spawn an builder
                        let body = [MOVE],
                        name = `${role[0]}${role.charCodeAt(1)}_${Game.time}`,
                        memory = {memory: {role: role, working: false, home: this.room.name, target: this.memory.scoutRoom, notifyWhenAttacked: true}};
                        name = this.spawnCreep(body, name, memory);
                        // if that worked
                        if (name == 0) {
                            // delete the dismantle order
                            delete this.memory.scoutRoom;
                        }
                        break;
                    }
                    // if no scout order was found
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
                    // if no order was found, check other roles
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
                                    name = this.createNotWorkerCreep(maxEnergy, role);
                                }
                                else continue;
                            }
                            else continue;
                        }
                        else if (role == 'builder') {
                            // find all constracters sites
                            let constracters_sites = this.room.find(FIND_MY_CONSTRUCTION_SITES);
                            if (constracters_sites.length) {
                                name = this.createCustomCreep(maxEnergy, 'builder');
                            }
                            else continue;
                        }
                        else {
                            name = this.createCustomCreep(maxEnergy, role);
                        }
                        break;
                    }
                }
            }
            // if none of the above caused a spawn command check for LongDistanceHarvesters
            /** @type {Object.<string, number>} */
            let numberOfLongDistanceHarvesters = {};
            if (name == undefined && this.memory.healTarget == undefined && this.memory.buildRoom == undefined && this.memory.dismantleAttackRoom == undefined && this.memory.attackRoom == undefined) {
                // count the number of long distance harvesters globally
                for (let LDHData in this.memory.minLongDistanceHarvesters) {
                    let [roomName, sourceIndex, workParts] = LDHData.split('_');
                    numberOfLongDistanceHarvesters[LDHData] = _.sum(Game.creeps, (c) =>
                        c.memory.role == 'LDH' && c.memory.target == roomName && c.memory.sourceIndex == sourceIndex && c.memory.home == this.room.name);
                    if (numberOfLongDistanceHarvesters[LDHData] < this.memory.minLongDistanceHarvesters[LDHData]) {
                        name = this.createLongDistanceHarvester(maxEnergy, workParts, room.name, roomName, sourceIndex);
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
    function(energy, role) {
            // create a balanced body as big as possible with the given energy
            let numberOfParts = Math.floor(energy / (BODYPART_COST[MOVE]+BODYPART_COST[CARRY]+BODYPART_COST[WORK]));
            // make sure the creep is not too big (more than 50 parts)
            numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
            let body = [];
            for (let i = 0; i < numberOfParts; i++) {
                body.push(WORK);
            }
            for (let i = 0; i < numberOfParts; i++) {
                body.push(CARRY);
            }
            let numOfHeavyParts = body.length
            for (let i = 0; i < numberOfParts; i++) {
                body.push(MOVE);
                numOfHeavyParts--;
            }
            energy -= numberOfParts*200;
            while (energy >= 50 && body.length < 50 && numOfHeavyParts > 0) {
                body.push(MOVE);
                energy -= 50;
                numOfHeavyParts--;
            }
            if (body.length > 50) body = body.slice(0, 50)
        
        let name = `${role[0]}${role.charCodeAt(1)}_${Game.time}`
        let newCreep = this.spawnCreep(body, name, {memory: { role: role, working: false, home: this.room.name } });
        // while (newCreep == ERR_NAME_EXISTS){
        //     name = role + Math.floor(Math.random()*100)
        //     newCreep = this.spawnCreep(body, name, {memory: { role: role, working: false, home: this.room.name } });
        // }

        // create creep with the created body and the given role
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createNotWorkerCreep =
    function(energy, role, numberOfWorkParts=0, additionalMemory=NaN) {
        // create a balanced body as big as possible with the given energy
        let body = [];
        for (let i = 0; i < numberOfWorkParts; i++) body.push(WORK);
        energy -= BODYPART_COST[WORK]*numberOfWorkParts;
        
        let numberOfParts = Math.floor(energy / (BODYPART_COST[MOVE]+BODYPART_COST[CARRY]));
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 2));
        for (let i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        let numOfHeavyParts = body.length
        for (let i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }
        energy -= numberOfParts*(BODYPART_COST[MOVE]+BODYPART_COST[CARRY]+BODYPART_COST[WORK]);
        while (energy >= 50 && body.length < 50 && numOfHeavyParts > 0) {
            body.push(MOVE);
            energy -= 50;
            numOfHeavyParts--;
        }

        let memory = {memory: { role: role, working: false, home: this.room.name } }
        if (additionalMemory !== NaN) {
            for (let key in additionalMemory) {
                memory.memory[key] = additionalMemory[key];
            }
        }
        let name = `${role[0]}${role.charCodeAt(1)}_${Game.time}`
        let newCreep = this.spawnCreep(body, name, memory);
        
        // create creep with the created body
        return newCreep;
    };
    // create a new function for StructureSpawn
StructureSpawn.prototype.createLongDistanceHarvester =
    function(energy, numberOfWorkParts, home, target, sourceIndex) {
        // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
        let body = [];
        for (let i = 0; i < numberOfWorkParts; i++) body.push(WORK);
        energy -= (BODYPART_COST[MOVE]+BODYPART_COST[WORK])*numberOfWorkParts;
        let numberOfParts = Math.floor(energy / (BODYPART_COST[MOVE]+BODYPART_COST[CARRY]));
        // make sure the creep is not too big (more than 50 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor((50 - numberOfWorkParts * 2) / 2));
        for (let i = 0; i < numberOfParts; i++) body.push(CARRY);
        for (let i = 0; i < numberOfParts + parseInt(numberOfWorkParts); i++) body.push(MOVE);

        if (body.length > 50) body = body.slice(0, 50)
        let name = `LDH_${Game.time}`
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'LDH',
            home: home,
            target: target,
            sourceIndex: sourceIndex,
            working: false
        } });
        // create creep with the created body
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createLongDistanceCollector =
    function(energy, home, target) {
        let body = [];
        
        let numberOfParts = Math.floor(energy / (BODYPART_COST[MOVE]+BODYPART_COST[CARRY]));
        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 2));
        for (let i = 0; i < numberOfParts; i++) {body.push(CARRY);}
        for (let i = 0; i < numberOfParts; i++) {body.push(MOVE);}

        if (body.length > 50) body = body.slice(0, 50)
        
        let name = `LDC_${Game.time}`
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'LDC',
            home: home,
            target: target,
            working: false
        } });
        // create creep with the created body
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createAttacker =
    // // data for creep creation in the format name: true/false/data for example {target: E7N23, attack: {numberOfAttackParts: 10}, dismantle: {numberOfWorkParts}}
    function(energy, target, numberOfAttackParts, tough, id) {
        let body = [];
        for (let i = 0; i < numberOfAttackParts && body.length < 49; i++) {body.push(ATTACK); body.push(MOVE);}
        energy -= (BODYPART_COST[ATTACK]+BODYPART_COST[MOVE])*numberOfAttackParts;
        if (tough) {
            let numberOfParts = Math.min(Math.floor(energy/(BODYPART_COST[MOVE]+BODYPART_COST[TOUGH])), Math.floor((25-numberOfAttackParts)));
            for (let i = 0; i < numberOfParts && body.length < 49; i++) {body.push(TOUGH); body.push(MOVE);}
        }
        // sort the body by TOUGH ... MOVE ... ELSE
        body.sort((a, b) => {
            if (a == b) return 0;
            else if (a == TOUGH) return -1;
            else if (b == TOUGH) return 1;
            else if (a == MOVE) return -1
            else if (b == MOVE) return 1
        });
        let name = `a_${Game.time}`
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'attacker',
            target: target,
            home: this.room.name,
            working: false,
            waiting: false,
            id: id,
        } });

        // create creep with the created body
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createHealer =
    /** @arg {number} energy
    * @arg {number} numberOfHealParts
    * @arg {string} target
    * @arg {string} home */
    function(energy, target, numberOfHealParts, tough, id) {
        let body = [];
        for (let i = 0; i < numberOfHealParts && body.length < 49; i++) {body.push(HEAL); body.push(MOVE);}
        energy -= (BODYPART_COST[HEAL]+BODYPART_COST[MOVE])*numberOfHealParts;

        if (tough) {
            let numberOfParts = Math.min(Math.floor(energy/(BODYPART_COST[MOVE]+BODYPART_COST[TOUGH])), Math.floor((25-numberOfHealParts)));
            for (let i = 0; i < numberOfParts && body.length < 49; i++) {body.push(TOUGH); body.push(MOVE);}
        }
        // sort the body by TOUGH ... MOVE ... ELSE
        body.sort((a, b) => {
            if (a == b) return 0;
            else if (a==TOUGH) return -1;
            else if (b==TOUGH) return 1;
            else if (a == MOVE) return -1
            else if (b == MOVE) return 1
        });
        let name = `h_${Game.time}`
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'healer',
            target: target,
            home: this.room.name,
            working: false,
            waiting: false,
            id: id,
        } });
        // create creep with the created body
        return newCreep;
    };
StructureSpawn.prototype.createDismantler =
    /** @arg {number} energy
    * @arg {number} numberOfWorkParts
    * @arg {string} target */
    function(energy, target, numberOfWorkParts, tough, id) {
        let body = [];
        for (let i = 0; i < numberOfWorkParts && body.length < 49; i++) {body.push(WORK); body.push(MOVE);}
        energy -= (BODYPART_COST[MOVE]+BODYPART_COST[WORK])*numberOfWorkParts;

        if (tough) {
            let numberOfParts = Math.min(Math.floor(energy/(BODYPART_COST[MOVE]+BODYPART_COST[TOUGH])), Math.floor((25-numberOfWorkParts)));
            for (let i = 0; i < numberOfParts && body.length < 49; i++) {body.push(TOUGH); body.push(MOVE);}
        }  
        // sort the body by TOUGH ... MOVE ... ELSE
        body.sort((a, b) => {
            if (a == b) return 0;
            else if (a == TOUGH) return -1;
            else if (b == TOUGH) return 1;
            else if (a == MOVE) return -1
            else if (b == MOVE) return 1
        });
        let name = `d_${Game.time}`
        let newCreep = this.spawnCreep(body, name, {memory: {
            role: 'dismantler',
            target: target,
            home: this.room.name,
            working: false,
            waiting: false,
            id: id,
        } });
        // create creep with the created body
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimerCreep =
    function(target, numberOfClaimParts, reserve=false) {
        let body = []
        for (let i = 0; i < numberOfClaimParts-1; i++) body.push(MOVE);
        for (let i = 0; i < numberOfClaimParts; i++) body.push(CLAIM);
        body.push(MOVE);
        let name = `c_${Game.time}`
        let newCreep = this.spawnCreep(body, name, {memory: { role: 'claimer', target: target, reserve: reserve, home: this.room.name } });

        // create claimer creep with the created body, and target
        return newCreep;
    };
// create a new function for StructureSpawn
StructureSpawn.prototype.createMinerCreep =
    function(sourceId) {
        let body = [WORK, WORK, WORK, WORK, WORK, MOVE]

        let name = `m_${Game.time}`
        let newCreep = this.spawnCreep(body, name, {memory: { role: 'miner', sourceId: sourceId, home: this.room.name } });

        // create miner creep with the created body, and target
        return newCreep;
    };
Structure.prototype.claimRoom =
    function(target, claimParts=1) {
        if (target == undefined) return 'target is needed';
        this.memory.claimRoom = [target, claimParts];
        return [target, claimParts]
    };
Structure.prototype.reserveRoom =
    function(target, claimParts=1) {
        if (target == undefined) return 'target is needed' 

        this.memory.reserveRoom = [target, claimParts];
        return [target, claimParts]
    };
Structure.prototype.buildRoom =
    function(target, workParts=1) {
        if (target == undefined) return 'target is needed';

        this.memory.buildRoom = [target, workParts];
        return [target, workParts];
    };
Structure.prototype.spawnAttacker =
    function(target, numberOfAttackParts, tough, id=undefined) {
        if (arguments.length < 3) return 'target, numberOfAttackParts and tough are needed';
        this.memory.attackRoom = [target, numberOfAttackParts, tough, id];
        return [target, numberOfAttackParts, tough, id];
    };
Structure.prototype.spawnDismantler =
    function(target, numberOfWorkParts, tough, id=undefined) {
        if (arguments.length < 3) return 'target, numberOfWorkParts and tough are needed';
        this.memory.dismantleAttackRoom = [target, numberOfWorkParts, tough, id];
        return [target, numberOfWorkParts, tough, id];
    };
Structure.prototype.spawnHealer =
    function(target, numberOfHealParts, tough, id=undefined) {
        if (arguments.length < 3) return 'target, numberOfHealParts and tough are needed';

        this.memory.healTarget = [target, numberOfHealParts, tough, id];
        return [target, numberOfHealParts, tough, id];
    };
Structure.prototype.spawnScout =
    function(target) {
        if (arguments.length == 0) return 'auto target is WIP';
        this.memory.scoutRoom = target;
        return target;
    };
Structure.prototype.attackRoom =
    function(target, dismantlers, attackers, healers, tough, forceAttack=false) {
        if (arguments.length < 5) return 'target, dismantlers, attackers, healers and tough are needed'
        else if (attackers + dismantlers > 1) return 'WIP'
        else if (!(Memory.rooms && Memory.rooms[this.room.name])) return 'wrong room memory, try again later'
        else if (!_.isArray(Memory.rooms[this.room.name].attackRoom)) Memory.rooms[this.room.name].attackRoom = [];

        Memory.rooms[this.room.name].attackRoom.push({target: target, dismantlers: dismantlers, attackers: attackers, healers: healers, tough: tough, id: Game.time, forceAttack: forceAttack});
        return {target: target, dismantlers: dismantlers, attackers: attackers, healers: healers, tough: tough, id: Game.time, forceAttack: forceAttack}
        
    };
StructureSpawn.prototype.processAttacks =
    function() {
        if (Memory.rooms && Memory.rooms[this.room.name] && _.isArray(Memory.rooms[this.room.name].attackRoom)) Memory.rooms[this.room.name].attackRoom.forEach((task) => {
            // not a force attack and is not seeing the target room
            if (!task.forceAttack && Game.rooms[task.target] == undefined) {
                // once per 100 tick
                if (Game.time % 100) {
                    let numOfScouts = _.sum(Game.creeps, c => c.memory.role == 'scout' && c.memory.target == task.target)
                    if (numOfScouts < 1) this.spawnScout(task.target);
                }
                // ALWAYS break proccess of curent task
                return;
            }
            if (Game.rooms[task.target] != undefined && (!(Game.rooms[task.target].controller == undefined || Game.rooms[task.target].controller.safeMode == undefined  || Game.rooms[task.target].controller.safeMode <= 200))) return;
            let numOfDismantlers = _.sum(Memory.creeps, (m) => (m.role == 'dismantler' || m.hardRole == 'dismantler') && m.id == task.id);
            let numOfAttackers = _.sum(Memory.creeps, (m) => (m.role == 'attacker' || m.hardRole == 'attacker') && m.id == task.id);
            let numOfHealers = _.sum(Memory.creeps, (m) => (m.role == 'healer' || m.hardRole == 'healer') && m.id == task.id);
			let numOfReadyHealers = _.sum(Memory.creeps, (m) => (m.role == 'healer' || m.hardRole == 'healer') && m.id == task.id && !m.spawning);
            let ready = -3;
            if (numOfDismantlers < task.dismantlers) this.spawnDismantler(task.target, Math.floor(this.room.energyCapacityAvailable/200), task.tough, task.id);
            else ready++;
            if (numOfAttackers < task.attackers) this.spawnAttacker(task.target, Math.floor(this.room.energyCapacityAvailable/200)+1, task.tough, task.id);
            else ready++;
            if (numOfHealers < task.healers && (numOfAttackers > 0 || numOfDismantlers > 0)) this.spawnHealer(_.filter(Game.creeps, (c) => c.memory.id == task.id && (c.memory.role == 'attacker' || c.memory.role == 'dismantler' || c.memory.hardRole == 'attacker' || c.memory.hardRole == 'dismantler'))[0].name, Math.floor(this.room.energyCapacityAvailable/300)-1, task.tough, task.id);
            else if (numOfReadyHealers === task.healers) ready++;
            let waiting = ready < 0;
            for (let creepName in Game.creeps) {
                if (Game.creeps[creepName].memory.id == task.id) Game.creeps[creepName].memory.waiting = waiting;
            }
        });
    };
Structure.prototype.sellResource =
    function(resource, minPrice, maxDistance) {
        if (arguments.length != 3) return 'resource, minPrice and maxDistance are needed'
    
        if (Memory.rooms && Memory.rooms[this.room.name] && Memory.rooms[this.room.name].terminal) return `there is no path "Memory.rooms['${this.room.name}'].terminal"`

        Memory.rooms[this.room.name].terminal.autoSell.push({enabled: true, resource: resource, minPrice: minPrice, maxDistance: maxDistance});
        return `added ${JSON.stringify({enabled: true, resource: resource, minPrice: minPrice, maxDistance: maxDistance})} to auto sell of ${this.room.name}`
    };

// let creep = Game.getObjectById('#{id}');
// let homeRoom = Game.rooms[creep.memory.home];
// if (homeRoom != undefined) {
//     let homeSpawn = homeRoom.find(FIND_MY_SPAWNS)[0];
//     if (homeSpawn) {
//         let creepHitsPercentage = creep.hits/creep.hitsMax*100;
//         let numberOfHealParts = Math.max(Math.floor((100-creepHitsPercentage)/20), 1);
//         console.log(homeSpawn.spawnHealer(creep.name, numberOfHealParts, false));
//     }
// }