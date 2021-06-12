const Client = require("../../clients/Client");
const Logger = require("../../utils/Logger");
const Event = require("../Event");

class Register extends Event {

    /*
        Init Event
    */
    constructor(payload) {
        /*
            Model to validate Payload
        */
        let model = {
            ident: "",
            session: "",
        }

        super(payload, model);
    }

    /*
        Handle Event
    */
    async handle(ws) {
        /*
            Registers Instance on Server
        */
        if(this.payload.ident !== ws.id) {
            ws.close();
            return;
        }

        Logger.done("New client " + this.payload.ident + " connected successfully!");
        clientManager.addClient(new Client(this.payload.ident, this.payload.session, ws));
    }
}

module.exports = Register;