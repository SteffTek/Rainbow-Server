const Events = require("../events/Events/Events");

class ClientManager {
    constructor() {
        this.clients = {
            /* ident : client */
        };
    }

    getClient(ident) {
        return this.clients[ident];
    }

    clientCount() {
        return Object.keys(this.clients).length;
    }

    getClientBySocket(socket) {
        for(let client in this.clients) {
            if(this.clients[client].socket.id == socket.id) {
                return this.clients[client];
            }
        }
        return null;
    }

    addClient(client) {
        this.clients[client.ident] = client;
    }

    removeClient(client) {
        delete this.clients[client.ident];
    }

    broadcast(json) {
        let msg = JSON.stringify(json);

        for(let client in this.clients) {
            this.clients[client].sendMessage(msg);
        }
    }
}

module.exports = ClientManager;