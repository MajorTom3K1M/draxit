const CardModel = require("../models/Cards");
const PlayersModel = require("../models/Players");
const ObjectId = require('mongoose').Types.ObjectId;

const createCard = async (roomId, playerId, image, round) => {
    let card;
    const isCardAlreadyExisted = await CardModel.findOne({ roomId, playerId, round });
    const isStoryTeller = await PlayersModel.findOne({ _id: playerId,  })
    const cardImage = Buffer.from(image.split(",")[1],"base64");
    if(isCardAlreadyExisted) {
        card = await CardModel.findOneAndUpdate({ roomId, playerId, round }, { $set: { cardImage: cardImage } });
    } else {
        card = await CardModel.create({
            roomId,
            playerId,
            cardImage: cardImage,
            round
        });
        await PlayersModel.findByIdAndUpdate({ _id: playerId }, { $push: { cards: { id: card._id, round: round } } })
    }
    
    return card;
}

const getCards = async (roomId, round) => {
    let cards = await CardModel.find({ roomId, round }).populate("playerAnswers");
    cards = cards.map((card) => ({
        ...card._doc,
        cardImage: Buffer.from(card.cardImage).toString('base64')
    }))
    return cards;
}

const selectCard = async (roomId, cardId, playerId) => {
    await CardModel.findOneAndUpdate({ _id: cardId, roomId }, { $push: { playerAnswers: ObjectId(playerId) } });
    await PlayersModel.findOneAndUpdate({ _id: playerId }, { $set: { isSelected: true } });
    return { success: true };
}

module.exports = {
    createCard,
    getCards,
    selectCard
}