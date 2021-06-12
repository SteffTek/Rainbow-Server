const Client = require("../../clients/Client");
const Logger = require("../../utils/Logger");
const Event = require("../Event");

class Canvas extends Event {

    /*
        Init Event
    */
    constructor(payload) {
        /*
            Model to validate Payload
        */
        let model = {
            imageData: ""
        }

        super(payload, model);
    }

    /*
        Handle Event
    */
    async handle(ws) {
        /*
            Handles Image Data
        */
    }
}

module.exports = Canvas;