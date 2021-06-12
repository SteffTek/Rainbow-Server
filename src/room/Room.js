const Client = require("../clients/Client");
const Utils = require("../utils/Utils");
const { createCanvas, Image } = require('canvas')
const Canvas = require("../events/Events/Canvas");
const Logger = require("../utils/Logger");

const dbCanvas = require("../database/models/canvas");
const dbPixel = require("../database/models/pixel");

class Room {

    constructor(client_owner) {

        /* VARS */
        this.size = 256;
        this.timeout = 30 * 1000;
        this.pixelCount = 0;

        /* CREATE */
        this.canvas = createCanvas(this.size, this.size);
        this.context = this.canvas.getContext("2d");

        /* DEFAULT COLOR */
        this.context.fillStyle = "#ffffff";
        this.context.fillRect(0,0,this.size,this.size);

        /* GET IMAGE DATA */
        this.imageData = this.canvas.toDataURL();

        /* LOAD LAST SAVED IMAGE */
        dbCanvas.findOne().sort({_id:-1}).limit(1).then(doc => {
            //GOT CANVAS
            if(!doc) {
                /* GET IMAGE DATA */
                this.imageData = this.canvas.toDataURL();
                return;
            }

            /* REMOVE INVALID PIXELS NEWER THAN DATA*/
            dbPixel.deleteMany({timestamp: {$gt:doc.timestamp}}).then(() => {
                /* COUNT REMAINING PIXELS */
                dbPixel.countDocuments({}).then(count => {
                    this.pixelCount = count;
                })
            });

            /* LOAD DATA TO CANVAS */
            var image = new Image();
            image.onload = () => {
                this.context.drawImage(image, 0, 0);
                /* GET IMAGE DATA */
                this.imageData = this.canvas.toDataURL();
            }
            image.src = doc.imageData;

            image.onerror = err => { throw err }
        });

        /* COLORS */
        this.colors = [
            "",
            "#000000",
            "#808080",
            "#c0c0c0",
            "#ffffff",
            "#000080",
            "#0000ff",
            "#008080",
            "#00ffff",
            "#008000",
            "#00ff00",
            "#808000",
            "#ffff00",
            "#800000",
            "#ff0000",
            "#800080",
            "#ff00ff"
        ]

        /* SEND UPDATES TO CLIENTS */
        tickSystem.onTick(() => {
            for(let client in clientManager.clients) {

                // GET CLIENT
                client = clientManager.clients[client];

                // SEND UPDATE
                client.sendUpdate();
            }
        })

        /* SAVE CANVAS */
        this.save();
    }

    save() {
        var backup = this.imageData;
        tickSystem.executeAfterSeconds(60, () => {

            // CHECK FOR NEW DATA
            if(backup === this.imageData) {
                this.save();
                return;
            }

            Logger.info("Backing Up data...");
            var toStore = this.imageData;
            var size = this.size;

            new dbCanvas({
                timestamp: Date.now(),
                imageData: toStore,
                size: size
            }).save().then(() => {
                Logger.info("Backup complete!");

                // EXECUTE SAVING AGAIN
                this.save();
            }).catch(err => {
                Logger.error("Error while creating backup!");
                Logger.error(err);

                // SAVE AGAIN
                this.save();
            })
        })
    }

    setPixel(x,y,c) {

        // GET AND CHECK COLOR
        let color = this.getColor(c);
        if(!color) {
            return;
        }

        // CHECK PIXEL BOUNDS
        if(x < 0 || x > (this.size - 1)) {
            return;
        }
        if(y < 0 || y > (this.size - 1)) {
            return;
        }

        // SET PIXEL
        this.context.fillStyle = color;
        this.context.fillRect(x,y,1,1);

        this.imageData = this.canvas.toDataURL();

        // COUNT UP PIXEL COUNT
        this.pixelCount++;

        // SEND TO ALL CLIENTS
        eventManager.broadcast(new Canvas({imageData: this.imageData}));
    }

    getColor(i) {
        if(i === 0){
            return null;
        }

        return this.colors[i];
    }
}

module.exports = Room;