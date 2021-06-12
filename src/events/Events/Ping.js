const Client = require("../../clients/Client");
const Logger = require("../../utils/Logger");
const Event = require("../Event");

class Ping extends Event {

    /*
        Init Event
    */
    constructor(payload) {
        /*
            Model to validate Payload
        */
        let model = {
            timestamp: 0
        }

        super(payload, model);
    }

    /*
        Handle Event
    */
    async handle(ws) {
        /*
            Keep Connection alive
        */
        eventManager.send(ws, new Ping(this.payload))
    }
}

module.exports = Ping;