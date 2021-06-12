/*
    IMPORTS
*/

// NECESSARY IMPORTS
const logger = require("./src/utils/Logger");
const configHandler = require("./src/utils/ConfigHandler");
const config = configHandler.getConfig();
const TickSystem = require("@stefftek/tick.js");
const db = require("./src/database/db");

// WEBSOCKET IMPORTS
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

// CLIENT & EVENT IMPORTS
const ClientManager = require("./src/clients/ClientManager");
const EventManager = require("./src/events/EventManager");
const Room = require("./src/room/Room");

global.Events = require("./src/events/Events/Events");
global.tickSystem = new TickSystem(64);
global.room = new Room();

/*
    TICK SYSTEM PERFORMANCE
*/
tickSystem.monitor(true);
setInterval(() => {
    if(tickSystem.performanceMonitor)
        console.log(tickSystem.performanceMonitor.report());
}, 1000)

/*
    STARTUP SEQUENCE
*/
// Starting DB Connection
db.connect();

// Starting up Websocket Hub
logger.info("Starting up WebSocket-Server...");
const wss = new WebSocket.Server({ port: config.hub.port });
logger.done("Server started!");

// Websocket Messaging
wss.on('connection', function connection(ws, req) {
    logger.info("New client is connecting... try to register...");

    // ASSIGN LOCAL ID FOR WS
    ws.id = uuidv4();

    //ASSIGN IP FOR EASY ACCESS
    ws.ip = req.headers['x-forwarded-for']?.split(/\s*,\s*/)[0] || req.socket.remoteAddress;

    // SEND REQUEST FOR AUTHENTICATION
    eventManager.send(ws, new Events.Register({ident: ws.id, session:""}));

    // ON INCOMING MESSAGE FROM SOCKET
    ws.on('message', function incoming(message) {
        // DECODING
        try {
            // HANDLING VIA EVENT MANAGER
            eventManager.handle(ws, message);
        // ERROR HANDLING
        } catch(e) {
            logger.error(e);
        }
    });

    // ON SOCKET CLOSED
    ws.on("close", function () {

        // GET CLIENT
        let client = clientManager.getClientBySocket(ws);
        if(client == null) {
            return;
        }
        logger.info("Client " + client.ident + " disconnected!");

        // REMOVE CLIENT FROM MANAGER
        clientManager.removeClient(client);
    })
});

//REGISTERING GLOBAL VARIABLES
logger.info("Creating Client Manager....");
global.clientManager = new ClientManager();

logger.info("Creating Event Manager....");
global.eventManager = new EventManager();

//INIT DONE
logger.done("DONE!");