const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Rooms = new mongoose.Schema({
    roomId: { type: String },
    playerCount: { type: Number },
    gameState: { type: String, enum: ['lobby-waiting', 'thinking-sentence', 'drawing-card', 'guessing', 'reaveal'] },
    round: { type: Number, default: 0 },
    story: { type: String },
    storyList: { type: Array },
    players: { type: Array, ref: 'Players' },
    currentStoryTeller: {
        id: { type: ObjectId },
        index: { type: Number }
    },
    cardAmount: { type: Number },
    isDeleted: { type: Boolean, default: false },
    isStarted: { type: Boolean, default: false }
}, {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
});

module.exports = mongoose.model("Rooms", Rooms);