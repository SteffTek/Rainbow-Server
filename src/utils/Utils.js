/* CONST VARS */
const code_chars = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz1234567890";

/* FUNCTIONS */
function generateRoomCode(length) {
    let code = [];

    for(let i = 0; i < length; i++) {
        let char = code_chars[getRandomInt(code_chars.length)]
        code.push(char);
    }

    code = code.join("");

    return code;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

module.exports = {
    generateRoomCode: generateRoomCode,
    getRandomInt: getRandomInt,
}