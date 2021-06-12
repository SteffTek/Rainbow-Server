const Client = require("../../clients/Client");
const Logger = require("../../utils/Logger");
const Event = require("../Event");

class Timer extends Event {

    /*
        Init Event
    */
    constructor(payload) {
        /*
            Model to validate Payload
        */
        let model = {
            time: 0
        }

        super(payload, model);
    }

    /*
        Handle Event
    */
    async handle(ws) {
        /*
            Set's Timer
        */
    }
}

module.exports = Timer;