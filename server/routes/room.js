const express = require('express');
const router = express.Router();
const RoomsControllers = require("../controllers/Rooms");

router.post("/games/create", async (req, res, next) => {
    try {
        const room = await RoomsControllers.createRoom();
        res.status(200).send(room).end();
    } catch(err) {
        next(err);
    }
});

router.post("/games/:roomId/join", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { playerName, isRoomOwner } = req.body;
        const room = await RoomsControllers.joinRoom(roomId, playerName, isRoomOwner);
        res.status(200).send(room).end();
    } catch (err) {
        next(err);
    }
});

router.post("/games/:roomId/leave", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { playerId } = req.body;
        const room = await RoomsControllers.leaveRoom(roomId, playerId);
        res.status(200).send(room).end();
    } catch(err) {
        next(err);
    }
});

router.post("/games/:roomId/start", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const room = await RoomsControllers.startGame(roomId);
        res.status(200).send(room).end();
    } catch(err) {
        next(err);
    }
})

router.post("/games/:roomId/state", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { state, stateOptions = {} } = req.body;
        const room = await RoomsControllers.setState(roomId, state, stateOptions);
        res.status(200).send(room).end();
    } catch(err) {
        next(err);
    }
})

router.get("/games/:roomId/health", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const room = await RoomsControllers.isRoomAlive(roomId);
        res.status(200).send(room).end();  
    } catch(err) {
        next(err)
    }
})

router.get("/games/:roomId", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const room = await RoomsControllers.getPlayers(roomId);
        res.status(200).send(room).end();
    } catch (err) {
        next(err);
    }
});

router.use((err, req, res, next) => {
    console.log({ err });
    res
      .status(err.statusCode ? err.statusCode : 500)
      .send({ statusCode: err.statusCode ? err.statusCode : 500, message: err.message })
      .end();
});

module.exports = router;