var roles = {
  harvester: require('roles_role.harvester'),
  upgrader: require('roles_role.upgrader'),
  builder: require('roles_role.builder'),
  repairer: require('roles_role.repairer'),
  wallRepairer: require('roles_role.wallRepairer'),
  LDH: require('roles_role.longDistanceHarvester'),
  claimer: require('roles_role.claimer'),
  miner: require('roles_role.miner'),
  collector: require('roles_role.collector'),
  dismantler: require('roles_role.dismantler'),
  attacker: require('roles_role.attacker'),
  healer: require('roles_role.healer'),
  none: require('roles_role.none'),
  dec: require('roles_role.dec'),
  MH: require('roles_role.mineralHarvester'),
  LDC: require('roles_role.longDistanceCollector'),
  recycle: require('roles_role.recycle'),
  TM: require('roles_role.terminalManager'),
  scout: require('roles_role.scout'),
  boosting: require('roles_role.none'),
};
Creep.prototype.runRole = function () {
  roles[this.memory.role].run(this);
};
Creep.prototype.boost = function (resource) {
  if (!RESOURCES_ALL.includes(resource)) return `wrong resource ${resource}`;
  if (!_.isArray(this.room.memory.boostCreeps)) return `boostCreeps array is ${boostCreeps} and not array, try again later`;
  this.room.memory.boostCreeps.push([this.name, resource]);
};

/** @function 
    @param {bool} useContainer
    @param {bool} useSource */
Creep.prototype.getEnergy = function (useContainer, useSource, useOther) {
  if (useOther) {
    let droppedResources = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: (dr) => dr.resourceType == RESOURCE_ENERGY && dr.amount > 100,
    });
    if (droppedResources != undefined) {
      // try to withdraw droppedResources, if it is not in range
      if (this.pickup(droppedResources) == ERR_NOT_IN_RANGE) {
        // move towards it
        this.moveTo(droppedResources, {
          visualizePathStyle: { stroke: '#feeb75' },
        });
      }
      return;
    }
    let tombstone = this.pos.findClosestByPath(FIND_TOMBSTONES, {
      filter: (t) => t.store[RESOURCE_ENERGY] > 0,
    });
    if (tombstone != undefined) {
      // try to withdraw energy from tombstone, if it is not in range
      if (this.withdraw(tombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        // move towards it
        this.moveTo(tombstone, { visualizePathStyle: { stroke: '#feeb75' } });
      }
      return;
    }
    let ruin = this.pos.findClosestByPath(FIND_RUINS, {
      filter: (r) => r.store[RESOURCE_ENERGY] > 0,
    });
    if (ruin != undefined) {
      // try to withdraw energy from ruin, if it is not in range
      if (this.withdraw(ruin, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        // move towards it
        this.moveTo(ruin, { visualizePathStyle: { stroke: '#feeb75' } });
      }
      return;
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
      filter: (s) => s.structureType == STRUCTURE_STORAGE && s.store[RESOURCE_ENERGY] > 11000,
    });

    // if no storage found
    if (container == undefined) {
      container = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 650,
      });
    }

    // if one was found
    if (container != undefined) {
      // try to withdraw energy, if the container is not in range
      if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        // move towards it
        this.moveTo(container, { visualizePathStyle: { stroke: '#feeb75' } });
      }
      return;
    }
  }

  if (useSource) {
    // find closest source
    let source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

    // try to harvest energy, if the source is not in range
    if (this.harvest(source) == ERR_NOT_IN_RANGE) {
      // move towards it
      this.moveTo(source, { visualizePathStyle: { stroke: '#feeb75' } });
    }
  }
};
