//IMPORTANT IMPORTS
const mongoose = require("mongoose");

const pixelSchema = mongoose.Schema({
    timestamp: Number,
    userID: String,
    color: Number,
    x: Number,
    y: Number
});

module.exports = mongoose.models.Pixel || mongoose.model('Pixel', pixelSchema);