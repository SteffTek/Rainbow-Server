//IMPORTANT IMPORTS
const mongoose = require("mongoose");

const canvasSchema = mongoose.Schema({
    timestamp: Number,
    imageData: String,
    size: Number
});

module.exports = mongoose.models.Canvas || mongoose.model('Canvas', canvasSchema);