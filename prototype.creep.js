var roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    repairer: require('role.repairer'),
    wallRepairer: require('role.wallRepairer'),
    LDH: require('role.longDistanceHarvester'),
    claimer: require('role.claimer'),
    miner: require('role.miner'),
    collector: require('role.collector'),
    dismantler: require('role.dismantler'),
    attacker: require('role.attacker'),
    healer: require('role.healer'),
    none: require('role.none'),
    MH: require('role.mineralHarvester'),
    LDC: require('role.longDistanceCollector'),
    recycle: require('role.recycle'),
    TM: require('role.terminalManager'),
};

Creep.prototype.runRole =
    function () {
        roles[this.memory.role].run(this);
    };

/** @function 
    @param {bool} useContainer
    @param {bool} useSource */
Creep.prototype.getEnergy =
    function (useContainer, useSource, useOther) {
        if (useOther) {
            let droppedResources = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, { filter: dr => dr.resourceType == RESOURCE_ENERGY && dr.amount > 100});
            if(droppedResources != undefined) {
                // try to withdraw droppedResources, if it is not in range
                if(this.pickup(droppedResources) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(droppedResources, {visualizePathStyle: {stroke: '#feeb75'}});
                }
                return;
            }
            let tombstone = this.pos.findClosestByPath(FIND_TOMBSTONES, { filter: (t) => t.store[RESOURCE_ENERGY] > 0 });
            if (tombstone != undefined) {
                // try to withdraw energy from tombstone, if it is not in range
                if(this.withdraw(tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(tombstone, {visualizePathStyle: {stroke: '#feeb75'}});
                }
                return;
            }
            let ruin = this.pos.findClosestByPath(FIND_RUINS, { filter: (r) => r.store[RESOURCE_ENERGY] > 0 });
            if (ruin != undefined) {
                // try to withdraw energy from ruin, if it is not in range
                if(this.withdraw(ruin, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(ruin, {visualizePathStyle: {stroke: '#feeb75'}});
                }
                return
            }
        }
        // if the Creep should look for containers
        if (useContainer) {
            //// find closest terminal
            //// container = this.pos.findClosestByPath(FIND_STRUCTURES, {
            ////     filter: s => s.structureType == STRUCTURE_TERMINAL && s.store[RESOURCE_ENERGY] > 0
            //// });
            // find closest storage
            let container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 10000
            });

            // if no storage found      
            if (container == undefined) {
                container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 650
                });
            }
            
            // if one was found
            if (container != undefined) {
                // try to withdraw energy, if the container is not in range
                if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(container, {visualizePathStyle: {stroke: '#feeb75'}});
                }
                return;
            }
        }

        if (useSource) {
            // find closest source
            let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE, {filter: s => s.id != '5bbcad679099fc012e637357s'});

            // try to harvest energy, if the source is not in range
            if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards it
                this.moveTo(source, {visualizePathStyle: {stroke: '#feeb75'}});
            }
        }
    };