const Client = require("../../clients/Client");
const Logger = require("../../utils/Logger");
const Event = require("../Event");

const db = require("../../database/db");
const banned = require("../../database/models/banned");
const dbUser = require("../../database/models/user");

class Ban extends Event {

    /*
        Init Event
    */
    constructor(payload) {
        /*
            Model to validate Payload
        */
        let model = {
            session: "",
            userID: "",
            reason: "",
            result: ""
        }

        super(payload, model);
    }

    /*
        Handle Event
    */
    async handle(ws) {
        /*
            Logs Result of Ban
        */
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

            // GET BAN DATA
            let banData = this.payload;

            // IGNORE IF NOT SIGNED IN
            if(!user) {
                return;
            }

            /* DON'T SERVE IF NOT STEFF */
            let adminDoc = await db.isAdmin(user.id);
            if(!adminDoc) {
                Logger.warn(`INVALID Ban request from ID: ${user.id}; ${user.username}#${user.discriminator}`);
                return;
            }
            Logger.info(`Ban request from ID: ${user.id}; ${user.username}#${user.discriminator}`);

            // GET USER
            let userData = await dbUser.findOne({id: banData.userID});
            if(!userData) {
                eventManager.send(ws, new Ban({session:"",userID: banData.userID, reason: banData.reason, result: "User not found!"}))
                return;
            }

            // CHECK IF BANNED
            let isBanned = await db.isBanned(userData.id);
            if(isBanned) {
                eventManager.send(ws, new Ban({session:"",userID: banData.userID, reason: banData.reason, result: "User already banned!"}))
                return;
            }

            // SEND BAN TO DB
            new banned({
                userID: banData.userID,
                reason: banData.reason,
                username: userData.username + "#" + userData.discriminator,
                moderator: user.id,
                timestamp: Date.now()
            }).save().then(() => {
                // SEND RESULT
                eventManager.send(ws, new Ban({session:"",userID: banData.userID, reason: banData.reason, result: "User banned!"}))
            }).catch(err => {
                // LOG ERROR
                Logger.error("Error while saving Ban!");
                Logger.error(err);

                // SEND RESULT
                eventManager.send(ws, new Ban({session:"",userID: banData.userID, reason: banData.reason, result: "User ban failed! See Logs..."}))
            });
        })
    }
}

module.exports = Ban;