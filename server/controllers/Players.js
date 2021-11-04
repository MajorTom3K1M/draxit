const PlayerModel = require("../models/Players")

const createPlayer = async (name, lastRoomId) => {
    const isExisted = await PlayerModel.findOne({ name: name, lastRoomId: lastRoomId });
    if(!isExisted) {
        const player = await PlayerModel.create({
            name: name,
            lastRoomId: lastRoomId
        });
        return player;
    } 

    throw {
        statusCode: 400,
        message: "player name already exists in this room"
    }
}

const getPlayer = async (name, lastRoomId) => {
    const player = await PlayerModel.findOne({ lastRoomId: lastRoomId, name: name });
    return player;
}

const gameContinue = async (roomId, playerId) => {
    await PlayerModel.findOneAndUpdate({ lastRoomId: roomId, _id: playerId }, { $set: { isSelected: false, isContinue: true } });
    return { success: true };
}

module.exports = {
    createPlayer,
    getPlayer,
    gameContinue
}