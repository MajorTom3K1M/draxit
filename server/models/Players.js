const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Cards = mongoose.Schema({
    id: { type: ObjectId, ref: "Cards" },
    round: { type: Number }
})

const Players = mongoose.Schema({
    name: { type: String },
    lastRoomId: { type: String },
    isRoomOwner: { type: Boolean, default: false },
    isStoryTeller: { type: Boolean, default: false },
    cards: [Cards],
    isSelected: { type: Boolean, default: false },
    isContinue: { type: Boolean, default: false },
    sequence: { type: Number },
    isDisconnected: { type: Boolean, default: false }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
})

module.exports = mongoose.model("Players", Players);