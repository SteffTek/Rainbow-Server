const Client = require("../../clients/Client");
const Logger = require("../../utils/Logger");
const Event = require("../Event");

class Update extends Event {

    /*
        Init Event
    */
    constructor(payload) {
        /*
            Model to validate Payload
        */
        let model = {
            users: 0,
            timer: 0,
            pixels: 0
        }

        super(payload, model);
    }

    /*
        Handle Event
    */
    async handle(ws) {
        /*
            Update Information
        */
    }
}

module.exports = Update;