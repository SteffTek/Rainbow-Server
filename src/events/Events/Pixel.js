const Client = require("../../clients/Client");
const Logger = require("../../utils/Logger");
const Event = require("../Event");
const db = require("../../database/db");
const Timer = require("./Timer");
const dbPixel = require("../../database/models/pixel");

class Pixel extends Event {

    /*
        Init Event
    */
    constructor(payload) {
        /*
            Model to validate Payload
        */
        let model = {
            session: "",
            pixel: {
                x: 0,
                y: 0,
                c: 0
            }
        }

        super(payload, model);
    }

    /*
        Handle Event
    */
    async handle(ws) {
        /*
            Set's Pixel on Canvas
        */

        /* GET CLIENT */
        var client = clientManager.getClientBySocket(ws);
        if(!client) {
            return;
        }

        // CHECK IF SESSION VALID
        db.getUserSession(this.payload.session).then(async user => {

            // GET PIXEL DATA
            let pixel = this.payload.pixel;

            // IGNORE IF NOT SIGNED IN
            if(!user) {
                return;
            }

            /* DON'T SERVE IF BANNED */
            let isBanned = await db.isBanned(user.id);
            if(isBanned) {
                ws.close();
                return;
            }

            // CHECK LAST PIXEL TIME
            if((Date.now() - user.lastPixel < room.timeout)) {
                return;
            }

            // CHECK PIXEL VALIDITY
            // GET AND CHECK COLOR
            let color = room.getColor(pixel.c);
            if(!color) {
                return;
            }


            // CHECK PIXEL BOUNDS
            if(pixel.x < 0 || pixel.x > (room.size - 1)) {
                return;
            }
            if(pixel.y < 0 || pixel.y > (room.size - 1)) {
                return;
            }


            // CHECK IF PIXEL HAS BEEN SET ALREADY
            dbPixel.findOne({x: pixel.x, y: pixel.y}).sort({timestamp: -1}).then(checkPixel => {

                // CHECK PIXEL COLORS IF MATCH RETURN
                if(checkPixel)
                    if(pixel.c === checkPixel.color) {
                        return;
                    }

                // SET LAST PIXEL
                user.lastPixel = Date.now();
                user.save().catch(err => { console.log(err) })

                // SET LAST PIXEL IN CLIENT FOR UPDATE
                client.lastPixel = user.lastPixel;

                var userID = user.id;

                // SEND COUNT EVENT
                eventManager.send(ws, new Timer({time: room.timeout}))

                // SEND PIXEL TO DB
                new dbPixel({
                    timestamp: Date.now(),
                    userID: userID,
                    color: pixel.c,
                    x: pixel.x,
                    y: pixel.y
                }).save().then(() => {
                    // SET PIXEL
                    room.setPixel(pixel.x, pixel.y, pixel.c);
                }).catch(err => {
                    // LOG ERROR
                    Logger.error("Error while saving Pixel!");
                    Logger.error(err);
                });
            });
        })
    }
}

module.exports = Pixel;