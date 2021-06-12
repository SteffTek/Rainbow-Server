const Client = require("../../clients/Client");
const Logger = require("../../utils/Logger");
const Event = require("../Event");
const db = require("../../database/db");
const dbPixel = require("../../database/models/pixel");
const admin = require("../../database/models/admin");

class Inspector extends Event {

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
                r: []
            }
        }

        super(payload, model);
    }

    /*
        Handle Event
    */
    async handle(ws) {
        /*
            Get all Pixels for this position
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

            /* DON'T SERVE IF NOT STEFF */
            let adminDoc = await admin.findOne({userID: user.id});
            if(!adminDoc) {
                Logger.warn(`INVALID Inspector request from ID: ${user.id}; ${user.username}#${user.discriminator}`);
                return;
            }
            Logger.info(`Inspector request from ID: ${user.id}; ${user.username}#${user.discriminator}`);

            dbPixel.find({x: pixel.x, y: pixel.y}).sort({x: -1}).then(pixels => {

                let payload = {
                    session:"",
                    pixel: {
                        x: pixel.x,
                        y: pixel.y,
                        r: pixels
                    }
                }

                eventManager.send(ws, new Inspector(payload));

            });
        })
    }
}

module.exports = Inspector;