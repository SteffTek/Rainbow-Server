const WebSocket = require('ws');
const Events = require("../events/Events/Events");
const Join = require("../events/Events/Join");
const db = require("../database/db");
const Ping = require('../events/Events/Ping');
const Update = require('../events/Events/Update');
const Logger = require('../utils/Logger');

class Client {
    constructor(ident, session, socket) {
        this.ident = ident;
        this.session = session;
        this.socket = socket;
        this.loggedIn = false;
        this.lastPixel = 0;

        // CHECK IF LOGGED IN
        this.logIn();
    }

    /* CHECK LOGIN STATUS */
    async logIn() {
        db.getUserSession(this.session).then(async (user) => {
            if(user) {
                this.loggedIn = true;
            }

            // SEND JOIN PACKET
            var imageData = room?.imageData || "";
            var lastPixel = user?.lastPixel || 0;
            var timer = 0;

            // CHECK LAST PIXEL TIME
            if((Date.now() - lastPixel < room.timeout)) {
                timer = room.timeout - (Date.now() - lastPixel);
            }

            /* DON'T SERVE IF BANNED */
            if(user) {

                // BAN USER
                let isBanned = await db.isBanned(user.id);
                if(isBanned) {
                    Logger.warn(`${user.username}#${user.discriminator} tried to log in but is banned! IP: ${this.getIP()}`);
                    this.socket.close();
                    return;
                }

                // LOGIN NOTIFY CONSOLE
                Logger.done(`${user.username}#${user.discriminator} successfully logged in! IP: ${this.getIP()}`)
            }

            // SET THIS LAST PIXEL
            this.lastPixel = lastPixel;

            eventManager.send(this.socket, new Join({imageData: imageData, timer: timer}))
        });
    }

    sendUpdate() {
        var payload = {
            users: clientManager.clientCount(),
            timer: room.timeout - (Date.now() - this.lastPixel),
            pixels: room.pixelCount
        }

        eventManager.send(this.socket, new Update(payload));
    }

    /* GET IP */
    getIP() {
        return this.socket.ip;
    }

    /* WEBSOCKET */
    sendMessage(string) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(string);
        }
    }
}

module.exports = Client;