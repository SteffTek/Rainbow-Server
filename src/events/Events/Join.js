const Client = require("../../clients/Client");
const Logger = require("../../utils/Logger");
const Event = require("../Event");

class Join extends Event {

    /*
        Init Event
    */
    constructor(payload) {
        /*
            Model to validate Payload
        */
        let model = {
            imageData: "",
            timer: 0
        }

        super(payload, model);
    }

    /*
        Handle Event
    */
    async handle(ws) {
        /*
            Inform User about past session
        */
    }
}

module.exports = Join;