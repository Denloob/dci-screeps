let excuseMe = require('creep.excuseMe');

Flag.prototype.build =
    function (structureType, name) {
        return this.room.createConstructionSite(this.pos, structureType, name);
    };
Flag.prototype.calcTask =
    function () {
        if (this.color == COLOR_YELLOW && this.secondaryColor == COLOR_ORANGE) this.build(STRUCTURE_TOWER);
        if (this.color == COLOR_YELLOW && this.secondaryColor == COLOR_YELLOW) this.build(STRUCTURE_EXTENSION);
        if (this.color == COLOR_WHITE && this.secondaryColor == COLOR_WHITE) this.build(STRUCTURE_ROAD);
    };
Flag.prototype.getState =
    /**
     * @param  {Creep} creep
     * @param  {RoomPosition} target
     */
    function (creep, target) {
        if (this.color == COLOR_PURPLE && this.secondaryColor == COLOR_PURPLE) {
            if (this.name.startsWith('blockStanding')) this.memory.allowStanding = false
            if (this.name.startsWith('blockStanding')) this.memory.allowStandingException = {role: 'miner'}
            let allowStanding = creep.memory.role == this.memory.allowStandingException.role ? !this.memory.allowStanding: this.memory.allowStanding
            if (!allowStanding && this.pos.x == creep.pos.x && this.pos.y == creep.pos.y && this.pos.roomName == creep.pos.roomName) {
                if (target != undefined)
                    return creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}})
                else return creep.move(excuseMe.getNudgeDirection_Random(creep.pos))
            }
        }
    };