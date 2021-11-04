const express = require('express');
const router = express.Router();
const PlayersControllers = require("../controllers/Players")

router.post("/player/:roomId/create", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { name } = req.body;
        const player = await PlayersControllers.createPlayer(name, roomId);
        res.status(200).send(player).end();
    } catch(err) {
        next(err);
    }
});

router.post("/player/:roomId/continue", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { playerId } = req.body;
        const player = await PlayersControllers.gameContinue(roomId, playerId);
        res.status(200).send(player).end();
    } catch(err) {
        next(err);
    }
})

router.get("/player/:roomId", async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { name } = req.query;
        const player = await PlayersControllers.getPlayer(name, roomId);
        res.status(200).send(player).end();
    } catch(err) {
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