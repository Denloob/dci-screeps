module.exports = {
    // a function to run the logic for this role
    /** @type {Creep} */
    run: function(creep) {
        let pos = new RoomPosition(45, 8, 'W23S35');
        creep.moveTo(pos);
    }
}