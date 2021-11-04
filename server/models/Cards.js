const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Cards = mongoose.Schema({
    roomId: { type: String },
    playerId: { type: ObjectId },
    cardImage: { type: Buffer },
    playerAnswers: { type: Array, ref: 'Players' },
    round: { type: Number },
    sequence: { type: Number }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
})

module.exports = mongoose.model("Cards", Cards);