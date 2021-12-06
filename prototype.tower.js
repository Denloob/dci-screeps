// create a new function for StructureTower
StructureTower.prototype.main =
    function () {
        // find closest hostile creep the owner of which is not in the white list of the room
        let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: (c) => !Memory.rooms[this.room.name].whiteList.includes(c.owner)});
        let demagedCreep = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (c) => c.hits < c.hitsMax});
        // if one is found...
        if (target != undefined) {
            // ...FIRE!
            let attackCode = this.attack(target);
            let name;
            let roomSpawns = this.room.find(FIND_MY_SPAWNS);
            if (target.owner.username != 'Invader' || this.room.find(FIND_HOSTILE_CREEPS, { filter: (c) => !Memory.rooms[this.room.name].whiteList.includes(c.owner.username)}).length > 1) {
                let time = new Date().toLocaleString("en-US", {timeZone: 'Asia/Jerusalem', hour12: false});
                Game.notify(`[${time}] tower in ${this.room.name} attacked a creep ${target} with code ${attackCode}`);

                roomSpawns.forEach(roomSpawn => {
                    let numOfRoomDeffenders = _.sum(Game.creeps, (c) => c.memory.role == 'attacker' && c.memory.target == this.room.name);
                    //// console.log(this.room.find(FIND_HOSTILE_CREEPS, { filter: (c) => !Memory.rooms[this.room.name].whiteList.includes(c.owner)}).length);
        
                    // if target owner is not invader or there is more then one hostile creep AND there is no max amount of room deffenders
                    if (roomSpawn.memory.minDeffenders.attacker && numOfRoomDeffenders < roomSpawn.memory.minDeffenders.attacker) {   
                            // create deffender
                            name = roomSpawn.createAttacker(
                                this.room.energyCapacityAvailable,
                                this.room.name, // target
                                20, // numberOfAttackParts
                                true // tough
                            );
                        } 
                });
            }
        }
        else if (demagedCreep != undefined) {
            this.heal(demagedCreep);
        }
        // if no one is found
        else {
            // set the default walls limit
            let wallsLimit = 0
            // if room memory is defined
            if (Memory.rooms && Memory.rooms[this.room.name]) {
                // if wallsLimit is set right
                if (_.isObject(Memory.rooms[this.room.name].wallsLimit) && _.isEqual(Object.keys(Memory.rooms[this.room.name].wallsLimit).sort(), ['tower', 'creep'].sort()))
                    wallsLimit = Memory.rooms[this.room.name].wallsLimit.tower;
                // else reset to default
                else Memory.rooms[this.room.name].wallsLimit = {tower: wallsLimit, creep: wallsLimit};
            }
            // find closest structure with less than max hits
            let structure = this.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax &&
                                (
                                    (s.structureType != STRUCTURE_WALL &&
                                    s.structureType != STRUCTURE_RAMPART)
                                 || s.hits < wallsLimit)
            });
            // try to repair if we find one
            if (structure != undefined) this.repair(structure);
        }
    };