const RoomModel = require("../models/Rooms")
const PlayerModel = require("../models/Players")
const CardModel = require("../models/Cards")
const ObjectId = require("mongoose").Types.ObjectId;

const { shuffle } = require('../utils/common')
const { customAlphabet } = require('nanoid');

const createRoom = async () => {
    const generateNanoId = customAlphabet("ABCDEFGHJKMNOPQRSTUVWXYZ0123456789", 6);
    const roomId = await generateNanoId();
    const isExisted = await RoomModel.findOne({ roomId: roomId, isDeleted: false }); 
    if(!isExisted) {
        const created = await RoomModel.create({
            roomId: roomId,
            playerCount: 0,
            gameState: "lobby-waiting",
            // players: [ObjectId(playerId)]
        });
        return created;
    } 

    throw {
        statusCode: 400,
        message: "room id already exists please re-create the room"
    }
}

const getPlayers = async (roomId) => {
    const room = await RoomModel.findOne({ roomId: roomId, isDeleted: false }).populate("players");
    if(!room) {
        throw {
            statusCode: 400,
            message: "room doesn't exists."
        }
    }
    return room ? room.players : [];
}

const isRoomAlive = async (roomId) => {
    const room = await RoomModel.findOne({ roomId: roomId });
    if(!room || room.isDeleted) {
        return { isAlive: false };
    }
    return { isAlive: true };
}

const joinRoom = async (roomId, playerName, isRoomOwner = false) => {
    // check is room existed
    const isExisted = await RoomModel.findOne({ roomId: roomId, isDeleted: false, gameState: 'lobby-waiting' });
    if(!isExisted) {
        throw {
            statusCode: 404,
            message: "room not found"
        }
    }

    // check is player already existed in this room
    let player;
    const isPlayerExisted = await PlayerModel.findOne({ name: playerName, lastRoomId: roomId });
    if(isPlayerExisted) {
        player = await PlayerModel.findOneAndUpdate({ name: playerName, lastRoomId: roomId }, {  $set: { isDisconnected: false } });
    } else {
        player = await PlayerModel.create({
            name: playerName,
            lastRoomId: roomId,
            isRoomOwner:isRoomOwner
        });
    }

    const room = await RoomModel.findOneAndUpdate({ roomId: roomId, isDeleted: false }, { $push: { players: ObjectId(player._id) }, $inc : { playerCount: 1 } }, { new: true });

    return { room, player };
}

const reConnect = async (roomId, playerId) => {
    // check is room existed
    const isExisted = await RoomModel.findOne({ roomId: roomId, isDeleted: false });
    if(!isExisted) {
        throw {
            statusCode: 404,
            message: "room not found"
        }
    }

    // check is player already existed in this room
    const isPlayerExisted = await PlayerModel.findOneAndUpdate({ _id: playerId, lastRoomId: roomId }, { $set: { isDisconnected: false } }, { new: true });
    if(!isPlayerExisted) {
        throw {
            statusCode: 404,
            message: "can't rejoin the room because player are not exists in this room"
        }
    }

    let room;
    if(!isExisted.players.includes(ObjectId(playerId))) {
        room = await RoomModel.findOneAndUpdate({ roomId: roomId, isDeleted: false }, { $push: { players: ObjectId(playerId) }, $inc : { playerCount: 1 } }, { new: true });
    }

    return { success: true };
}

const leaveRoom = async (roomId, playerId) => {
    const room = await RoomModel.findOneAndUpdate({ roomId, isDeleted: false }, { $pull: { players: ObjectId(playerId) }, $inc: { playerCount: -1 } }, { new: true }).populate("players")

    // if(room) {
    //     await PlayerModel.deleteOne({ _id: playerId });
    // }

    if(room && room.players.length <= 0) {
        await RoomModel.findOneAndUpdate({ roomId, isDeleted: false }, { $set: { isDeleted: true } }, { new: true })
    } else if (room) {
        const isRoomOwner = room.players.find((player) => String(player._id) === String(playerId))
        if(isRoomOwner) {
            await PlayerModel.findOneAndUpdate({ _id: playerId }, { $set: { isRoomOwner: false, isDisconnected: true } });
        } else {
            await PlayerModel.findOneAndUpdate({ _id: playerId }, { $set: { isDisconnected: true } });
        }
    
        const isRoomOwnerExisted = room.players.find((player) => player.isRoomOwner === true);
        if(!isRoomOwnerExisted) {
            // promoted the new room owner.
            await PlayerModel.findOneAndUpdate({ _id: room.players[0]._id }, { $set: { isRoomOwner: true } });
        }
    }

    return room || {};
}

const startGame = async (roomId) => {
    const room = await RoomModel.findOneAndUpdate({ roomId }, { $set: { isStarted: true, gameState: "thinking-sentence", round: 1 } }, { new: true }).populate("players");

    /* random story teller 
        -> set every one story teller status to false if found old story teller
        -> random one and promote to be story teller 
        -> set currentStoryTeller detail in room
        -> random player sequence! except the current storyTeller are seq 1
    */
    const players = room.players;
    const isFoundStoryTeller = players.find((player) => player.isStoryTeller);
    const randomIndex = Math.floor(Math.random()*players.length);
    const randomPlayerId = players[randomIndex]._id;
    const unSeqPlayers = shuffle(players.filter((player) => String(player._id) !== String(randomPlayerId)));
    const updateQueries = unSeqPlayers.map((players, index) => ({
        updateOne: {
            filter: { _id: players._id },
            update: { $set: { sequence: index + 2 } }
        }
    }));
    // console.log({updateQueries})

    if(isFoundStoryTeller) {
        const allId = players.map((player) => player._id);
        await PlayerModel.updateMany({ _id: { $in: allId }, lastRoomId: roomId }, { $set: { isStoryTeller: false } });
    }
    await PlayerModel.findOneAndUpdate({ _id: randomPlayerId, lastRoomId: roomId  }, { $set: { isStoryTeller: true, sequence: 1 } });
    await PlayerModel.bulkWrite(updateQueries);
    const newRoomData = await RoomModel.findOneAndUpdate({ roomId }, { $set: { currentStoryTeller: { id: randomPlayerId, sequence: 1 } } }, { new: true });

    return newRoomData;
};

const getRoom = async (roomId) => {
    const room = await RoomModel.findOne({ roomId: roomId, isDeleted: false });
    if(!room) {
        throw {
            statusCode: 400,
            message: "room doesn't exists."
        }
    }
    return room;
}

const setStateOld = async (roomId, state, stateOptions = {}) => {
    let incrementor = state === "thinking-sentence" ? 1 : 0;

    if(state === "drawing-card" && !stateOptions.story) {
        throw {
            statusCode: 400,
            message: "must have story for the drawing-card state."
        }
    }

    const room = await RoomModel.findOneAndUpdate(
        { roomId, isDeleted: false }, 
        { $set: { gameState: state, story: stateOptions.story }, $inc: { round: incrementor }, $push: { storyList: stateOptions.story } }, 
        { new: true, omitUndefined: true }
    );
    if(!room) {
        throw {
            statusCode: 400,
            message: "room doesn't exists."
        }
    }

    if(state === "thinking-sentence") {
        await PlayerModel.updateMany({ _id: { $in: room.players }, lastRoomId: roomId }, { $set: { isStoryTeller: false } });
        const randomPlayerId = room.players[Math.floor(Math.random()*room.players.length)];
        await PlayerModel.findOneAndUpdate({ _id: randomPlayerId, lastRoomId: roomId  }, { $set: { isStoryTeller: true } });
    } else if(state === "drawing-card") {
        
    }

    return room;
}

const setState = async (roomId, state, stateOptions = {}) => {
    let room;
    // can't use players state in this api beacause it update after
    switch(state) {
        case "thinking-sentence":
            // update state increase round
            room = await RoomModel.findOneAndUpdate(
                { roomId, isDeleted: false }, 
                { $set: { gameState: state, cardAmount: 0  }, $inc: { round: 1 } }, 
                { new: true, omitUndefined: true }
            ).populate("players");

            // next story teller !
            const players = room.players.sort((a,b) => a.sequence - b.sequence);
            const oldStoryTellerIndex = players.findIndex((player) => player.isStoryTeller);
            const oldStoryTellerId = players[oldStoryTellerIndex % players.length]._id;
            const newStoryTellerId = players[(oldStoryTellerIndex + 1)  % players.length]._id;
            await PlayerModel.updateOne({ _id: oldStoryTellerId, lastRoomId: roomId }, { $set: { isStoryTeller: false } });
            await PlayerModel.updateOne({ _id: newStoryTellerId, lastRoomId: roomId }, { $set: { isStoryTeller: true } });
            // await PlayerModel.updateMany({ lastRoomId: roomId }, { $set: { isContinue: false } });

            return room;
        case "drawing-card":
            if (!stateOptions.story) {
                throw {
                    statusCode: 400,
                    message: "must have story for the drawing-card state."
                }
            }
            room = await RoomModel.findOneAndUpdate(
                { roomId, isDeleted: false },  
                { $set: { gameState: state, story: stateOptions.story }, $push: { storyList: stateOptions.story } }, 
                { new: true }
            );
            return room;
        case "guessing":
            if (!stateOptions.round) {
                throw {
                    statusCode: 400,
                    message: "must have round for the guessing state."
                }
            }
            // random card sequence
            const cards = await CardModel.find({ roomId, round: stateOptions.round }, { _id: 1 });
            const shuffledCard = shuffle([...cards]);
            const updateQueries = shuffledCard.map((card, index) => ({
                updateOne: {
                    filter: { _id: card._id },
                    update: { $set: { sequence: index + 1 } }
                }
            }));
            await CardModel.bulkWrite(updateQueries);

            room = await RoomModel.findOneAndUpdate(
                { roomId, isDeleted: false }, 
                { $set: { gameState: state  } }, 
                { new: true, omitUndefined: true }
            );
            return room;
        case "reveal":
            // update player is selected
            await PlayerModel.updateMany({ lastRoomId: roomId }, { $set: { isSelected: false, isContinue: false } });
            room = await RoomModel.findOneAndUpdate(
                { roomId, isDeleted: false }, 
                { $set: { gameState: state  } }, 
                { new: true, omitUndefined: true }
            );
            return room;
    }
}



module.exports = {
    createRoom,
    getPlayers,
    joinRoom,
    leaveRoom,
    isRoomAlive,
    reConnect,
    startGame,
    getRoom,
    setState
}