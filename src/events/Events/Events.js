const fs = require("fs");
var events = {}

let files = fs.readdirSync("./src/events/Events")
let jsFiles = files.filter((f) => f.split(".").pop() === "js");

if (jsFiles.length <= 0) {
    return;
}

jsFiles.forEach((f, i) => {
    let name = f.split(".")[0];

    if(name == "Events") {
        return;
    }

    let pull = require(`./${name}`);
    events[name] = pull;
});

module.exports = events;