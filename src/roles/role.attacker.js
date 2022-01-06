module.exports = {
  // a function to run the logic for this role
  /**
   * @param  {Creep} creep
   */
  run: function (creep) {
    // if in target room
    if (creep.room.name == creep.memory.target) {
      // find closest enemy creep
      let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, { filter: (c) => _.filter(c.body, (b) => b.type == ATTACK || b.type == HEAL).length });
      if (target == undefined) target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType == STRUCTURE_INVADER_CORE });
      if (target == undefined) {
        target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
          filter: (s) =>
            s.structureType == STRUCTURE_TOWER &&
            _.filter(creep.room.lookAt(s.pos), (o) => o.type == 'structure' && o.structure.structureType == STRUCTURE_RAMPART)[0] == undefined,
        });
        let maxRampartHits = 50000;
        let itr = 10000;
        if (target == undefined)
          for (let i = 0; i < maxRampartHits && target == undefined; i += itr) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
              filter: (s) =>
                s.structureType == STRUCTURE_TOWER &&
                _.filter(creep.room.lookAt(s.pos), (o) => o.type == 'structure' && o.structure.structureType == STRUCTURE_RAMPART && o.structure.hits < i)[0],
            });
          }
      }
      if (target == undefined) {
        target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
          filter: (s) =>
            s.structureType == STRUCTURE_SPAWN &&
            _.filter(creep.room.lookAt(s.pos), (o) => o.type == 'structure' && o.structure.structureType == STRUCTURE_RAMPART)[0] == undefined,
        });
        let maxRampartHits = 100000;
        let itr = 10000;
        if (target == undefined)
          for (let i = 0; i < maxRampartHits && target == undefined; i += itr) {
            target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
              filter: (s) =>
                s.structureType == STRUCTURE_SPAWN &&
                _.filter(creep.room.lookAt(s.pos), (o) => o.type == 'structure' && o.structure.structureType == STRUCTURE_RAMPART && o.structure.hits < i)[0],
            });
          }
      }
      if (target == undefined) target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
      if (target == undefined) target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType != STRUCTURE_CONTROLLER && s.hits < 30000 });
      if (target == undefined) target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: (s) => s.structureType != STRUCTURE_CONTROLLER });
      if (target == undefined) target = creep.pos.findClosestByPath(FIND_STRUCTURES);
      // if one is found
      if (target != undefined) {
        // try to attack
        let attack = creep.attack(target);
        // if the enemy is not in range
        if (attack == ERR_NOT_IN_RANGE) {
          // move towards the enemy
          creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
        } else if (attack == OK) console.log(`${creep.name} is attacking ${target} in ${creep.room}, hp left: ${creep.hits} while targets hits are ${target.hits}`);
      }
      if (creep.pos.y == 0) creep.move(BOTTOM);
      else if (creep.pos.y == 49) creep.move(TOP);
      else if (creep.pos.x == 0) creep.move(RIGHT);
      else if (creep.pos.x == 49) creep.move(LEFT);
    }
    // if not in target room and not waiting...
    else if (!creep.memory.waiting) {
      // travel to target room
      creep.travelTo(new RoomPosition(25, 25, creep.memory.target));
    }
  },
};
// let room = Game.rooms['#{room}'];
// if (room.controller && room.controller.my) {
//     let spawn = room.find(FIND_MY_SPAWNS)[0];
//     if (spawn) spawn.memory.attackRoom = ['#{room}', 6, false];
// }

// gets x and y or RoomPosition
// Creep.prototype.moveAttacker = function (x, y) {
//     if (arguments.length < 2) return 'x and y or RoomPosition needed';
//     // init roomPos
//     let roomPos;
//     if (!_.isObject(x)) {
//         if (!_.isNumber(x) || !_.isNumber(y)) return 'no coordinates were given';
//         roomPos = new RoomPosition(x, y, this.room.name);
//     }
//     else {
//         if (!_.isNumber(x.x) || !_.isNumber(x.y) || !_.isString(x.roomName)) return 'not a RoomPosition'
//         roomPos = x;
//     }

//     let path = this.pos.findPathTo(roomPos);
//     this.memory.dir = path[0].direction;
//     return [this.move(path[0].direction), path[0].direction];
//     }

// Creep.prototype.moveTo = function (firstArg, secondArg, opts) {
//         if (arguments.length < 2) return 'x and y or RoomPosition needed';

//         let visualizePathStyle =
//             opts.visualizePathStyle || {
//                 fill: 'transparent',
//                 stroke: '#fff',
//                 lineStyle: 'dashed',
//                 strokeWidth: .15,
//                 opacity: .1
//             }
//         // init roomPos
//         let roomPos;
//         if (!_.isObject(firstArg)) {
//             if (!_.isNumber(firstArg) || !_.isNumber(secondArg)) return 'no coordinates were given';
//             roomPos = new RoomPosition(firstArg, secondArg, this.room.name);
//         }
//         else {
//             if (!_.isNumber(firstArg.x) || !_.isNumber(firstArg.y) || !_.isString(firstArg.roomName)) return 'not a RoomPosition'
//             roomPos = firstArg;
//         }

//         let path = this.pos.findPathTo(roomPos);
//         this.memory.dir = path[0].direction;
//         this.memory.moving = path[0].direction;
//         return this.move(path[0].direction);
//     }

//     // put me to role.attacker.js
//     let dir = Game.creeps[target].memory.dir;
//     if (dir != undefined) moveHealer(dir);

// Creep.prototype.moveHealer = function(dir) {
//     if (_.isArray(dir) && dir.length == 2) dir = dir[1];
//     return this.move(dir)
//     }
