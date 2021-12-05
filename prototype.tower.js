// create a new function for StructureTower
StructureTower.prototype.main =
    function () {
        // find closest hostile creep the owner of which is not in the white list of the room
        let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: (c) => !Memory.rooms[this.room.name].whiteList.includes(c.owner)});
        let demagedCreep = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (c) => c.hits < c.hitsMax});
        // if one is found...
        if (target != undefined) {
            // ...FIRE!
            this.attack(target);
            Game.notify('[' + convertTimeZone(new Date(), 'Asia/Jerusalem') + '] tower attacked a creep ' + target)

            let name = undefined;
            let roomSpawn = Game.spawns[
                this.room.find(
                    FIND_MY_STRUCTURES,
                    { filter : (s) => s.structureType == STRUCTURE_SPAWN}
                    )[0].name
                ];
            let numOfRoomDeffenders = _.sum(Game.creeps, (c) => c.memory.role == 'attacker' && c.memory.target == this.room.name);
            //// console.log(this.room.find(FIND_HOSTILE_CREEPS, { filter: (c) => !Memory.rooms[this.room.name].whiteList.includes(c.owner)}).length);

            // if target owner is not invader or there is more then one hostile creep AND there is no max amount of room deffenders
            if (
                (
                    target.owner.username != 'Invader' || 
                    this.room.find(FIND_HOSTILE_CREEPS, { filter: (c) => !Memory.rooms[this.room.name].whiteList.includes(c.owner)}).length > 1
                ) &&
                roomSpawn.memory.minDeffenders.attacker && numOfRoomDeffenders < roomSpawn.memory.minDeffenders.attacker)
                {   
                    // create deffender
                    name = roomSpawn.createAttacker(
                        this.room.energyCapacityAvailable,
                        20, // numberOfAttackParts
                        0,  // numberOfWorkParts
                        0, // numberOfCarryParts
                        this.room.name, // target
                        true // tough
                    );
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

function convertTimeZone(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));   
}