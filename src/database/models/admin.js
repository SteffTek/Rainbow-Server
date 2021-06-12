//IMPORTANT IMPORTS
const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
    userID: String,
});

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);