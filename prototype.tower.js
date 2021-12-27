const Returns = ['OK', 'ERR_NOT_OWNER', 'ERR_NO_PATH', 'ERR_NAME_EXISTS', 'ERR_BUSY', 'ERR_NOT_FOUND', 'ERR_NOT_ENOUGH_RESOURCES', 'ERR_INVALID_TARGET', 'ERR_FULL', 'ERR_NOT_IN_RANGE', 'ERR_INVALID_ARGS', 'ERR_TIRED', 'ERR_NO_BODYPART', 'ERR_RCL_NOT_ENOUGH', 'ERR_GCL_NOT_ENOUGH']
// create a new function for StructureTower
StructureTower.prototype.main =
    function () {
        // find closest hostile creep the owner of which is not in the white list of the room
        let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: (c) => !Memory.rooms[this.room.name].whiteList.includes(c.owner) && _.some(c.body, b => b.type == ATTACK || b.type == CLAIM || b.type == RANGED_ATTACK || b.type == HEAL)});
        if (target == undefined) this.pos.findClosestByRange(FIND_HOSTILE_CREEPS, { filter: (c) => !Memory.rooms[this.room.name].whiteList.includes(c.owner) });
        
        let demagedCreep = this.pos.findClosestByRange(FIND_MY_CREEPS, { filter: (c) => c.hits < c.hitsMax && c.memory.role != 'scout'});
        // if one is found...
        if (target != undefined) {
            // ...FIRE!
            let attackCode = this.attack(target);
            if (target.owner.username != 'Invader' /** || this.room.find(FIND_HOSTILE_CREEPS, { filter: (c) => !Memory.rooms[this.room.name].whiteList.includes(c.owner.username)}).length > 1 */) {
                let addLeadingZero = (num) => ('0' + num).slice(-2);
                let fullDate = new Date();
                let GMT = 2;
                let date = `${addLeadingZero(fullDate.getDate())}/${addLeadingZero(fullDate.getMonth()+1)}/${fullDate.getFullYear()}`
                let time = `${addLeadingZero(fullDate.getHours()+GMT)}:${addLeadingZero(fullDate.getMinutes())}`;
                let attackCodeName = Returns[Math.abs(attackCode)];
                Game.notify(`[${date} ${time}] tower in ${this.room.name} attacked a creep ${target.name} of ${target.owner.username} with code ${attackCodeName}`);
                if (target.owner.username == 'Tigga' && _.some(target.body, b => b.type == ATTACK || b.type == CLAIM || b.type == RANGED_ATTACK || b.type == HEAL) && this.room.find(FIND_MY_SPAWNS).length) {
                    this.room.controller.activateSafeMode()
                }
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