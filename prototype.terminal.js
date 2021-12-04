// made by Den_loob not for distribution
// create a new function for StructureSpawn
StructureTerminal.prototype.sendEnergy =
    function (dest, num = 100000) {
        if (this.store[RESOURCE_ENERGY] >= num && Game.rooms[dest].controller.my) {
            return this.send(RESOURCE_ENERGY, num, dest)
        }
    };
// create a new function for StructureSpawn
StructureTerminal.prototype.addTask =
    /**
     * @param  {string} type type of task that you want to add, auto/to/from
     * @param  {{enabled: boolean, resource: RESOURCE_*, id?: string, order?: boolean minPrice?: number, maxDistance?:number}} params   
     * @returns {string||object}
     */
    function (type, params, enableTerminal=true) {
        // if terminal memory is set properly
        if (Memory.rooms && Memory.rooms[this.room.name] && Memory.rooms[this.room.name].terminal && _.isEqual(Object.keys(Memory.rooms[this.room.name].terminal), ['enabled', 'autoSell', 'from', 'to'])) {
            // get the memory of the terminal in the room
            let terminalMemory = Memory.rooms[this.room.name].terminal;
            switch (type) {
                case 'auto':
                    if (!_.isEqual(Object.keys(params).sort(), ['enabled', 'resource', 'minPrice', 'maxDistance'].sort())) return 'error, wrong params';
                    else if(!(typeof params['enabled'] === 'boolean' && typeof params['resource'] === 'string' && typeof params['minPrice'] === 'number' && typeof params['maxDistance'] === 'number')) return 'error wrong params type';
                    terminalMemory.autoSell.push(params);
                    if (enableTerminal) terminalMemory.enabled = true;
                    return params;
                case 'to':
                    // if params keys are not ['enabled', 'dealData', 'order'], or they are not ['enabled', 'resource', 'order'] or they ['enabled', 'resource', 'order'] but order is false 
                    if (!(_.isEqual(Object.keys(params).sort(), ['enabled', 'dealData', 'order'].sort()) || !_.isEqual(Object.keys(params).sort(), ['enabled', 'resource', 'order'].sort()) || params.order)) return 'error, wrong params';
                    else if(!(typeof params['enabled'] === 'boolean' && (typeof params['resource'] === 'string' || _.isObject(params['dealData'])) && typeof params['order'] === 'boolean')) return 'error wrong params type';
                    terminalMemory.to.push(params);
                    if (enableTerminal) terminalMemory.enabled = true;
                    return params;
                case 'from':
                    // if params keys are not ['enabled', 'dealData', 'order'], or they are not ['enabled', 'resource', 'order'] or they ['enabled', 'resource', 'order'] but order is false 
                    if (!(_.isEqual(Object.keys(params).sort(), ['enabled', 'dealData', 'order'].sort()) || !_.isEqual(Object.keys(params).sort(), ['enabled', 'resource', 'order'].sort()) || params.order)) return 'error, wrong params';
                    else if(!(typeof params['enabled'] === 'boolean' && (typeof params['resource'] === 'string' || _.isObject(params['dealData'])) && typeof params['order'] === 'boolean')) return 'error wrong params type';
                    terminalMemory.from.push(params);
                    if (enableTerminal) terminalMemory.enabled = true;
                    return params;
                default:
                    return 'error, wrong type';
            }
        }
        else return 'error, wrong terminal memory';
    };
// create a new function for StructureSpawn
StructureTerminal.prototype.addOrder =
     /**
      * @param  {string||Object.<string, string, number, number, string?, bool?>} type The order type, either ORDER_SELL or ORDER_BUY.
      * @param  {string} resourceType Either one of the RESOURCE_* constants or one of account-bound resources (See INTERSHARD_RESOURCES constant). If your Terminal doesn't have the specified resource, the order will be temporary inactive.
      * @param  {number} price The price for one resource unit in credits. Can be a decimal number.
      * @param  {number} totalAmount The amount of resources to be traded in total.
      * @param  {string} roomName The room where your order will be created. You must have your own Terminal structure in this room, otherwise the created order will be temporary inactive. This argument is not used when resourceType is one of account-bound resources (See INTERSHARD_RESOURCES constant).
      * @param  {bool} enableTerminal if to enable terminal memory
      * @returns {string||number} one of Game.market.createOrder returns or 'error, wrong terminal memory'
      */
     function(type, resourceType, price, totalAmount, roomName, enableTerminal) {
        if ((Memory.rooms && Memory.rooms[this.room.name] && Memory.rooms[this.room.name].terminal && _.isEqual(Object.keys(Memory.rooms[this.room.name].terminal), ['enabled', 'autoSell', 'from', 'to']))) {
            if(_.isObject(type)) {
                var {type, resourceType, price, totalAmount, roomName, enableTerminal} = type;
            }
            if (roomName == undefined) {
                roomName = this.room.name;
            }
            if (enableTerminal == undefined) enableTerminal = false;
            let order = Game.market.createOrder(type, resourceType, price, totalAmount, roomName);
            if (order == OK) {
                if (type == ORDER_SELL)
                    this.addTask('to', {enabled: true, resource: resourceType, order: true}, enableTerminal);
                else 
                    this.addTask('from', {enabled: true, resource: resourceType, order: true}, enableTerminal);
            }
            return order;
        }
        else return 'error, wrong terminal memory';
        
    };
// create a new function for StructureSpawn
StructureTerminal.prototype.addGlobalTask =
    /**
     * @param  {string} type type of task that you want to add, auto/to/from
     * @param  {Object.<boolean, string, string?, number?, number?>} params   
     * @param  {Array?} roomList
     * @returns {string}
     */
    function (type, params, roomList=false) {
            if (!roomList) roomList = Object.keys(Game.rooms).filter(roomName => Game.rooms[roomName].controller && Game.rooms[roomName].controller.my)
            if (roomList.length == 0) return `Sorry, but no rooms found`;
            for (roomName of roomList) {
                let taskReturn = Game.rooms[roomName].terminal.addTask(type, params);
                if (typeof taskReturn === 'string') return `${roomName}: ${taskReturn}`
            }
            return `added ${JSON.stringify(params)} to [${roomList.join(', ')}]`;
    };
// create a new function for StructureSpawn
StructureTerminal.prototype.processTasks =
    function () {
        // once per 10 ticks, if memory of room terminal in exist
        if (Game.time%10 == 0 && Memory.rooms && Memory.rooms[this.room.name]) {
            // if room memory is set properly
            if (Memory.rooms[this.room.name].terminal && _.isEqual(Object.keys(Memory.rooms[this.room.name].terminal), ['enabled', 'autoSell', 'from', 'to'])) {
                // get room terminal memory
                let terminalMemory = Memory.rooms[this.room.name].terminal;
                // if it is enabled
                if (terminalMemory.enabled) {
                    // for each auto sell task
                    terminalMemory.autoSell.forEach((task, index) => {
                        // if the task is set properly
                        if (typeof task === 'object' && _.isEqual(Object.keys(task), ['enabled', 'resource', 'minPrice', 'maxDistance'])) {
                            // if the task is enabled
                            if (task.enabled) {
                                // find best offer
                                let dealData = this.getBestOffer(task.resource, task.minPrice, task.maxDistance);
                                if (dealData) {
                                    let sameResourceDeal = _.filter(terminalMemory.to, o => !o.order && _.isEqual(o.dealData != undefined ? o.dealData.resourceType : undefined, dealData.resourceType));   
                                    if (sameResourceDeal != undefined) {
                                        // this should never happen
                                        if (sameResourceDeal.length > 1) console.log('ERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRROR GOT LIST line 66');
                                        else {
                                            terminalMemory.to.splice(terminalMemory.to.indexOf(sameResourceDeal), 1);
                                        }
                                    }
                                    this.addTask('to', {enabled: true, dealData: dealData, order: false}, true);
                                }
                                //// let diedOrders = _.filter(terminalMemory.to, o => Game.market.getAllOrders({id: o.dealData.id}) == undefined);
                                let diedOrders = _.filter(terminalMemory.to, o => !o.order && (o.dealData == undefined || !o.dealData.active || Game.market.getOrderById(o.dealData.id) === null));
                                diedOrders.forEach(order => {
                                    let toMemory = Memory.rooms[this.room.name].terminal.to;
                                    toMemory.splice(toMemory.indexOf(order), 1);
                                });
                            }
                        }
                        // if task isn't set properly, delete it
                        else Memory.rooms[this.room.name].terminal.autoSell.splice(index, 1);
                    });
                    terminalMemory.to.forEach((task, index) => {
                        if (task.enabled && task.order == false){
                            let dealData = task.dealData;
                            let tradeAmount = dealData.amount > this.store[dealData.resourceType] && this.store[dealData.resourceType] > 10000 ? this.store[dealData.resourceType]: dealData.amount;
                            if (dealData.resourceType == RESOURCE_ENERGY) {
                                let transactionCost = Game.market.calcTransactionCost(tradeAmount, this.room.name, dealData.roomName);
                                tradeAmount = tradeAmount + transactionCost > this.store[dealData.resourceType]? tradeAmount - transactionCost: tradeAmount;
                                transactionCost = Game.market.calcTransactionCost(tradeAmount, this.room.name, dealData.roomName);
                            }
                            tradeAmount = dealData.amount > 10000 ? Math.max(tradeAmount, 5000): dealData.amount
                            this.deal(dealData.id, tradeAmount);
                        }
                    });
                }
            }
            // else (if room memory is not set properly)
            else {
                Memory.rooms[this.room.name].terminal = {enabled: false, autoSell: [{enabled: false, resource: undefined, minPrice: 0, maxDistance: -1}], from: [{enabled: false, resource: undefined, order: false}], to: [{enabled: false, dealData: undefined, order: false}]};
            }
        }
    };
// create a new function for StructureSpawn
StructureTerminal.prototype.deal =
    function (orderId, amount) {
        deal = Game.market.deal(orderId, amount, this.room.name);
        // if hard memory is set properly
        if (deal == OK && Memory.hardMemory && typeof Memory.hardMemory.rooms && typeof Memory.hardMemory.rooms[this.room.name] && typeof Memory.hardMemory.rooms[this.room.name] === 'object' && _.isEqual(Object.keys(Memory.hardMemory.rooms[this.room.name]), ['notifyOnDisplayReset', 'commentsOnDisplayReset', 'notifyOnTerminalDeal'])) {
            if (Memory.hardMemory.rooms[this.room.name].notifyOnTerminalDeal) {
                let dealData = Game.market.getAllOrders({id: orderId})[0]
                console.log(`terminal in room ${this.room.name} transferd ${amount} of ${dealData.resourceType} to ${dealData.roomName} for ${dealData.price}$ each so you earned ${dealData.price*amount} and payed ${Game.market.calcTransactionCost(amount, this.room.name, dealData.roomName)} energy fee`);
            }
        }
        return deal;
    };
// create a new function for StructureSpawn
StructureTerminal.prototype.getBestOffer =
    /**
     * @param  {string} resource
     * @param  {number} bestPice
     * @param  {number} maxDistance
     * @param  {string} type=ORDER_BUY
     * @returns {object}
     */
    function (resource, bestPice, maxDistance, type=ORDER_BUY) {
        let orderFilter;
        // if we want to SELL to someone who is BUYING
        if (type == ORDER_BUY) {
            // // if (maxDistance < 0) {
            // //     orderFilter = order => order.resourceType == resource && order.type == type && order.price >= bestPice;
            // // }
            // // else {
                orderFilter = order => order.resourceType == resource && order.type == type &&
                Game.map.getRoomLinearDistance(this.room.name, order.roomName, true) <= maxDistance && order.price >= bestPice;
            // // }
        }
        // if we want to BUY from someone who is SELLING
        else if (type == ORDER_SELL) {
            // // if (maxDistance < 0) {
            // //     orderFilter = order => order.resourceType == resource && order.type == type && order.price <= bestPice;
            // // }
            // // else {
                orderFilter = order => order.resourceType == resource && order.type == type &&
                    Game.map.getRoomLinearDistance(this.room.name, order.roomName, true) <= maxDistance && order.price <= bestPice;
            // // }
        }
        else {
            return 'error, wrong type'
        }
        // get all orders by defined filter
        let orders = Game.market.getAllOrders(orderFilter);
        // sort them from biggest distance to smallest, and get the last
        let bestOrder = _.sortBy(orders, order => order.maxDistance)[orders.length-1]
        // return the best offer found
        return bestOrder
    };
