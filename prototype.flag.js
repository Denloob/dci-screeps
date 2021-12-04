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