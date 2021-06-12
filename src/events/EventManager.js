const logger = require("../utils/Logger");
const { v4: uuidv4 } = require('uuid');

class EventManager {

    constructor() {
        this.ident = uuidv4();
        logger.done("Event System loaded!");
    }

    /*
        Sending & Receiving
    */
    handle(ws, received) {
        try {
            //GET JSON
            let json = JSON.parse(received);

            //CHECK IF UUID MATCHES => ABORT
            if(json.ident == this.ident) {
                return;
            }

            let event = this.decode(json);
            //CHECK IF EVENT EXISTS
            if(event == null) {
                return;
            }

            //RECALCULATE VALIDITY
            event.isValid = event.validate();

            //ONLY EXECUTE EVENT IF VALID
            if(event.isValid) {
                event.handle(ws);
            }

        } catch(e) {
            console.log(e);
            logger.error(e);
        }
    }

    async send(ws, event) {

        //DECODING JSON
        let json = this.encode(event);

        //APPENDING IDENT
        json.ident = this.ident;

        if(ws.readyState != 1) {
            return;
        }

        //SENDING EVENT
        ws.send(JSON.stringify(json));
    }

    async broadcast(event) {
        //DECODING JSON
        let json = this.encode(event);

        //APPENDING IDENT
        json.ident = this.ident;

        for(let client in clientManager.clients) {
            client = clientManager.clients[client];

            let ws = client.socket;
            if(ws.readyState != 1) {
                continue;
            }

            //SENDING EVENT
            ws.send(JSON.stringify(json));
        }
    }

    /*
        Event Encoding
    */
    encode(event) {
        return event.json();
    }

    decode(json) {
        if(!json.name) {
            return null;
        }

        if(!Events[json.name]) {
            return null;
        }

        return Object.assign(new Events[json.name], json);
    }

}

module.exports = EventManager;